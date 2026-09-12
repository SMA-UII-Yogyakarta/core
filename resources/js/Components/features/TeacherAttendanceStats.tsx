import StatCard from "@/Components/ui/StatCard";

export interface TeacherAttendanceSummary {
    total: number;
    present: number;
    late: number;
    sick_permission: number;
    absent: number;
}

interface TeacherAttendanceStatsProps {
    summary: TeacherAttendanceSummary;
    className?: string;
}

export default function TeacherAttendanceStats({ summary, className = "" }: TeacherAttendanceStatsProps) {
    return (
        <section
            aria-label="Ringkasan presensi"
            className={`grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4 ${className}`.trim()}
        >
            <StatCard label="Total Siswa" value={summary.total} indicatorDot="blue" />
            <StatCard label="Hadir Terdata" value={summary.present} variant="success" indicatorDot="green" />
            <StatCard label="Terlambat" value={summary.late} variant="warning" indicatorDot="amber" />
            <StatCard label="Sakit / Izin" value={summary.sick_permission} variant="info" indicatorDot="blue" />
            <StatCard label="Alpa / Kosong" value={summary.absent} variant="danger" indicatorDot="red" />
        </section>
    );
}
