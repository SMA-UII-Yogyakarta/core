<?php

namespace App\Services;

use App\Events\AttendanceCreated;
use App\Events\AttendanceMarked;
use App\Models\AcademicCalendar;
use App\Models\Attendance;
use App\Models\AttendanceTimeSetting;
use App\Models\LeaveRequest;
use App\Models\SchoolLocationSetting;
use App\Models\Student;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Log;

class AttendanceService
{
    private const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

    private const MAX_PHOTO_BLOB_LENGTH = 7_340_032;

    private const ALLOWED_PHOTO_MIMES = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
    ];

    public function __construct(
        protected StorageService $storageService,
    ) {
    }

    public function paginate(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        return Attendance::query()
            ->with(['student.user', 'student.class'])
            ->when($filters['student_id'] ?? null, fn ($q, $v) => $q->where('student_id', $v))
            ->when($filters['class_id'] ?? null, fn ($q, $v) => $q->whereHas('student', fn ($sq) => $sq->where('class_id', $v)))
            ->when($filters['date'] ?? null, fn ($q, $v) => $q->whereDate('attendance_date', $v))
            ->when($filters['status'] ?? null, fn ($q, $v) => $q->where('status', $v))
            ->latest('attendance_date')
            ->paginate($perPage);
    }

    public function todayByClass(int $classId): array
    {
        $today = now()->toDateString();

        $students = Student::with('user')
            ->where('class_id', $classId)
            ->where('status', 'Active')
            ->get();

        $attendances = Attendance::whereDate('attendance_date', $today)
            ->whereIn('student_id', $students->pluck('id'))
            ->get()
            ->keyBy('student_id');

        $results = [];
        foreach ($students as $student) {
            $att = $attendances->get($student->id);
            $results[] = [
                'student' => $student,
                'attendance' => $att,
                'status' => $att->status ?? 'Absent',
            ];
        }

        return $results;
    }

    public function checkIn(int $studentId, array $data): Attendance
    {
        $today = now()->toDateString();
        $now = now();

        try {
            // ─── Layer 1: Academic Calendar Check ───
            $holiday = AcademicCalendar::whereDate('holiday_date', $today)
                ->where('is_holiday', true)
                ->first();

            if ($holiday) {
                Log::info('Check-in attempt on holiday', [
                    'student_id' => $studentId,
                    'date' => $today,
                    'holiday' => $holiday->description,
                ]);
                throw new \RuntimeException('Today is a holiday: ' . $holiday->description);
            }

            // ─── Layer 2: Active Day Check ───
            $dayName = now()->format('l');
            $setting = AttendanceTimeSetting::where('day', $dayName)->first();

            if (! $setting) {
                Log::info('Check-in attempt on unscheduled day', [
                    'student_id' => $studentId,
                    'day' => $dayName,
                ]);
                throw new \RuntimeException('No attendance schedule for ' . $dayName);
            }

            if (! $setting->is_active) {
                Log::info('Check-in attempt on inactive day', [
                    'student_id' => $studentId,
                    'day' => $dayName,
                ]);
                throw new \RuntimeException('Attendance is closed for ' . $dayName);
            }

            // ─── Layer 3: Time Range Check ───
            $currentTime = $now->format('H:i:s');
            $openTime = $setting->check_in_open->format('H:i:s');
            $lateTime = $setting->late_threshold->format('H:i:s');
            $closeTime = $setting->check_in_close->format('H:i:s');

            if ($currentTime < $openTime) {
                Log::info('Check-in attempt before open time', [
                    'student_id' => $studentId,
                    'current_time' => $currentTime,
                    'open_time' => $openTime,
                ]);
                throw new \RuntimeException('Attendance opens at ' . $openTime);
            }

            $status = 'Present';
            if ($currentTime > $lateTime) {
                $status = 'Late';
            }

            if ($currentTime > $closeTime) {
                Log::info('Check-in attempt after close time', [
                    'student_id' => $studentId,
                    'current_time' => $currentTime,
                    'close_time' => $closeTime,
                ]);
                throw new \RuntimeException('Attendance closed at ' . $closeTime);
            }

            // ─── Layer 4: Location & Geofence Check ───
            $latitude = $data['latitude'] ?? null;
            $longitude = $data['longitude'] ?? null;

            if (! is_numeric($latitude) || ! is_numeric($longitude)) {
                throw new \RuntimeException('Valid GPS coordinates are required.');
            }

            $latitude = (float) $latitude;
            $longitude = (float) $longitude;

            if ($latitude < -90 || $latitude > 90 || $longitude < -180 || $longitude > 180) {
                throw new \RuntimeException('GPS coordinates are out of range.');
            }

            $schoolLocation = SchoolLocationSetting::where('is_active', true)->first();

            if ($schoolLocation !== null && $schoolLocation->radius_meters > 0) {
                $distanceMeters = $this->haversineMeters(
                    $latitude,
                    $longitude,
                    (float) $schoolLocation->latitude,
                    (float) $schoolLocation->longitude,
                );

                if ($distanceMeters > $schoolLocation->radius_meters) {
                    Log::warning('Check-in attempt out of geofence radius', [
                        'student_id' => $studentId,
                        'distance_meters' => round($distanceMeters, 2),
                        'allowed_radius' => $schoolLocation->radius_meters,
                    ]);
                    throw new \RuntimeException(sprintf(
                        'Anda berada %.0f meter dari titik presensi sekolah (maksimal %d meter).',
                        $distanceMeters,
                        $schoolLocation->radius_meters,
                    ));
                }
            }

            // Check if already checked in today
            $existing = Attendance::where('student_id', $studentId)
                ->whereDate('attendance_date', $today)
                ->first();

            if ($existing) {
                Log::info('Duplicate check-in attempt blocked', [
                    'student_id' => $studentId,
                    'date' => $today,
                ]);
                throw new \RuntimeException('Already checked in today.');
            }

            $photoUrl = $data['photo_url'] ?? '';

            if (($data['photo'] ?? null) instanceof UploadedFile) {
                $this->assertValidUpload($data['photo']);
                $photoUrl = $this->storageService->uploadAttendancePhoto($data['photo'], $studentId);
            } elseif (trim((string) $photoUrl) === '' && isset($data['photo_blob'])) {
                $uploadedFile = $this->decodePhotoBlob($data['photo_blob']);
                try {
                    $photoUrl = $this->storageService->uploadAttendancePhoto($uploadedFile, $studentId);
                } finally {
                    // Always clean up temp file after upload
                    if (file_exists($uploadedFile->getPathname())) {
                        @unlink($uploadedFile->getPathname());
                    }
                }
            }

            if (trim((string) $photoUrl) === '') {
                throw new \RuntimeException('Attendance photo is required.');
            }

            return \Illuminate\Support\Facades\DB::transaction(function () use ($studentId, $today, $now, $latitude, $longitude, $photoUrl, $status) {
                $attendance = Attendance::create([
                    'student_id' => $studentId,
                    'attendance_date' => $today,
                    'check_in_time' => $now->format('H:i:s'),
                    'latitude' => $latitude,
                    'longitude' => $longitude,
                    'photo_url' => $photoUrl,
                    'status' => $status,
                ]);

                AttendanceCreated::dispatch($attendance);
                AttendanceMarked::dispatch($attendance);

                Log::info('Attendance check-in completed successfully', [
                    'attendance_id' => $attendance->id,
                    'student_id' => $studentId,
                    'status' => $status,
                    'date' => $today,
                ]);

                return $attendance;
            });
        } catch (\RuntimeException $e) {
            throw $e;
        } catch (\Throwable $e) {
            Log::error('Unexpected exception during attendance check-in', [
                'student_id' => $studentId,
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);
            throw new \RuntimeException('Gagal memproses presensi: ' . $e->getMessage(), 0, $e);
        }
    }

    private function assertValidUpload(UploadedFile $file): void
    {
        if (! $file->isValid()) {
            throw new \RuntimeException('Uploaded photo is not valid.');
        }

        if ($file->getSize() > self::MAX_PHOTO_BYTES) {
            throw new \RuntimeException('Photo exceeds maximum size of 5 MB.');
        }

        if (! isset(self::ALLOWED_PHOTO_MIMES[(string) $file->getMimeType()])) {
            throw new \RuntimeException('Photo must be a JPEG, PNG, or WebP image.');
        }
    }

    private function decodePhotoBlob(mixed $blob): UploadedFile
    {
        if (! is_string($blob) || $blob === '') {
            throw new \RuntimeException('Invalid photo payload.');
        }

        if (strlen($blob) > self::MAX_PHOTO_BLOB_LENGTH) {
            throw new \RuntimeException('Photo exceeds maximum size of 5 MB.');
        }

        $binary = base64_decode($blob, true);

        if ($binary === false || strlen($binary) < 1024 || strlen($binary) > self::MAX_PHOTO_BYTES) {
            throw new \RuntimeException('Invalid photo data.');
        }

        $info = @getimagesizefromstring($binary);

        if ($info === false || ! isset(self::ALLOWED_PHOTO_MIMES[$info['mime']])) {
            throw new \RuntimeException('Photo must be a valid JPEG, PNG, or WebP image.');
        }

        $extension = self::ALLOWED_PHOTO_MIMES[$info['mime']];
        $tempPath = tempnam(sys_get_temp_dir(), 'attendance_');
        file_put_contents($tempPath, $binary);

        return new UploadedFile($tempPath, 'photo.' . $extension, $info['mime'], null, true);
    }

    private function haversineMeters(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $earthRadius = 6371000.0;
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat / 2) ** 2
            + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLon / 2) ** 2;

        return $earthRadius * 2 * atan2(sqrt($a), sqrt(1 - $a));
    }

    public function todayByStudent(int $studentId): ?Attendance
    {
        return Attendance::where('student_id', $studentId)
            ->whereDate('attendance_date', now()->toDateString())
            ->first();
    }

    public function getStudentStats(int $studentId, ?int $month = null, ?int $year = null): array
    {
        $stats = Attendance::where('student_id', $studentId)
            ->when($month, fn ($q, $v) => $q->whereMonth('attendance_date', $v))
            ->when($year, fn ($q, $v) => $q->whereYear('attendance_date', $v))
            ->selectRaw("
                count(*) as total,
                count(case when status = 'Present' then 1 end) as present,
                count(case when status = 'Late' then 1 end) as late
            ")
            ->first();

        $total = (int) ($stats->total ?? 0);
        $present = (int) ($stats->present ?? 0);
        $late = (int) ($stats->late ?? 0);

        return [
            'total_days' => $total,
            'present' => $present,
            'late' => $late,
            'absent' => max(0, $total - $present - $late),
        ];
    }

    public function history(int $studentId, int $perPage = 20, ?int $month = null, ?int $year = null): LengthAwarePaginator
    {
        return Attendance::where('student_id', $studentId)
            ->when($month, fn ($q, $v) => $q->whereMonth('attendance_date', $v))
            ->when($year, fn ($q, $v) => $q->whereYear('attendance_date', $v))
            ->latest('attendance_date')
            ->paginate($perPage);
    }

    public function stats(int $classId, ?string $date = null): array
    {
        $date = $date ?? now()->toDateString();

        $students = Student::where('class_id', $classId)
            ->where('status', 'Active')
            ->count();

        $attStats = Attendance::query()
            ->join('students', 'students.id', '=', 'attendances.student_id')
            ->where('students.class_id', $classId)
            ->whereDate('attendances.attendance_date', $date)
            ->selectRaw("
                count(*) as total_recorded,
                count(case when attendances.status = 'Present' then 1 end) as present,
                count(case when attendances.status = 'Late' then 1 end) as late
            ")
            ->first();

        $present = (int) ($attStats->present ?? 0);
        $late = (int) ($attStats->late ?? 0);
        $totalRecorded = (int) ($attStats->total_recorded ?? 0);

        $sickCount = LeaveRequest::where('approval_status', 'Approved')
            ->where('category', 'Sick')
            ->where('start_date', '<=', $date)
            ->where('end_date', '>=', $date)
            ->whereHas('student', fn ($q) => $q->where('class_id', $classId))
            ->count();

        return [
            'total' => $students,
            'present' => $present,
            'late' => $late,
            'absent' => max(0, $students - $totalRecorded),
            'sick_permission' => $sickCount,
        ];
    }

    public function getMonthlyDaily(int $classId, int $month, int $year): array
    {
        $students = Student::where('class_id', $classId)
            ->where('status', 'Active')
            ->count();

        $attendances = Attendance::whereYear('attendance_date', $year)
            ->whereMonth('attendance_date', $month)
            ->whereHas('student', fn ($q) => $q->where('class_id', $classId))
            ->get()
            ->groupBy('attendance_date');

        $days = [];
        $totalPresent = 0;
        $totalLate = 0;
        $totalAbsent = 0;

        foreach ($attendances as $date => $items) {
            $present = $items->where('status', 'Present')->count();
            $late = $items->where('status', 'Late')->count();
            $absent = $students - $items->count();

            $days[] = [
                'date' => $date,
                'present' => $present,
                'late' => $late,
                'absent' => max(0, $absent),
            ];

            $totalPresent += $present;
            $totalLate += $late;
            $totalAbsent += max(0, $absent);
        }

        return [
            'days' => $days,
            'summary' => [
                'total_students' => $students,
                'total_present' => $totalPresent,
                'total_late' => $totalLate,
                'total_absent' => $totalAbsent,
                'total_days' => count($days),
            ],
        ];
    }
}
