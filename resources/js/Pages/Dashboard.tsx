import { Link, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { DashboardStats, StatCard, Table, StatusBadge } from "@/Components";
import AttendanceChart from "@/Components/AttendanceChart";
import type { Column } from "@/Components/ui/Table";
import type { StatusVariant } from "@/types/component";

interface Stats {
    total_students: number;
    hadir_terdata: number;
    terlambat: number;
    sakit_izin: number;
    alpa: number;
}

interface AttendanceRow {
    id: number;
    student: { id: number; nisn: string; name: string; class: { id: number; name: string } | null };
    status: string;
    check_in_time: string | null;
    attendance_date: string;
    latitude: string;
    longitude: string;
    photo_url: string;
}

interface MonthlyStats {
    bulan: string;
    total_siswa: number;
    hari_efektif: number;
    total_hadir: number;
    total_terlambat: number;
    rata_hadir_per_hari: number;
}

interface SchoolClass {
    id: number;
    name: string;
}

interface ClassStat {
    id: number;
    name: string;
    total: number;
    hadir: number;
    terlambat: number;
}

interface StudentRow {
    id: number;
    name: string;
    nis: string;
    status: string;
    check_in_time: string | null;
}

interface StudentDetailStats {
    total_hari: number;
    hadir: number;
    terlambat: number;
    alpa: number;
    persentase_kehadiran: number;
}

interface StudentDetailData {
    student: { id: number; name: string; nis: string; class: string };
    month: number;
    year: number;
    stats: StudentDetailStats;
    daily: { date: string; status: string; check_in_time: string | null }[];
}

interface TrendMonth {
    bulan: string;
    total: number;
    hadir: number;
    terlambat: number;
}

interface TrendWeek {
    label: string;
    total: number;
    hadir: number;
    terlambat: number;
}

interface DashboardProps {
    stats: Stats;
    todayAttendance: AttendanceRow[];
    pendingLeaveCount: number;
    monthlyStats: MonthlyStats;
    overview: { date: string; total_siswa: number; hadir_terdata: number; present: number; late: number; sick_permission: number; absent: number; kelas: ClassStat[] };
    monthlyTrend: { year: number; months: TrendMonth[] };
    weeklyTrend: TrendWeek[];
    classes: SchoolClass[];
    selectedClassId: number | null;
    classDetail: { class: SchoolClass; date: string; students: StudentRow[] } | null;
    studentDetail: StudentDetailData | null;
    selectedDate: string;
}

const statusToVariant: Record<string, StatusVariant> = {
    Present: "present",
    Late: "late",
    Absent: "absent",
};

export default function Dashboard({
    stats,
    todayAttendance,
    pendingLeaveCount,
    monthlyStats,
    overview,
    monthlyTrend,
    weeklyTrend,
    classes,
    selectedClassId,
    classDetail,
    studentDetail,
    selectedDate,
}: DashboardProps) {
    const attendanceColumns: Column<AttendanceRow>[] = [
        { key: "student", header: "Nama Siswa", render: (r) => (
            <div>
                <div className="font-semibold text-text-primary">{r.student.name}</div>
                <div className="text-[12px] text-text-muted">NISN: {r.student.nisn}</div>
            </div>
        )},
        { key: "kelas", header: "Kelas", render: (r) => r.student.class?.name ?? "-" },
        { key: "status", header: "Status", render: (r) => {
            const variant = statusToVariant[r.status] ?? "absent";
            return <StatusBadge variant={variant} />;
        }},
        { key: "time", header: "Waktu", render: (r) => (r.check_in_time ? `${r.check_in_time} WIB` : "-") },
    ];

    const handleClassFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        router.get("/dashboard", { class_id: val || undefined }, { preserveState: true, replace: true });
    };

    const drillToClass = (classId: number) => {
        router.get("/dashboard", { class_id: classId, date: selectedDate }, { preserveState: true, replace: true });
    };

    const drillToStudent = (studentId: number) => {
        router.get("/dashboard", {
            class_id: selectedClassId,
            student_id: studentId,
            date: selectedDate,
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
        }, { preserveState: true, replace: true });
    };

    const resetDrill = () => {
        router.get("/dashboard", {}, { preserveState: true, replace: true });
    };

    return (
        <AdminLayout title="Dashboard Admin" activeMenu="Dashboard">
            {/* Statistics Cards */}
            <section className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
                <StatCard label="Total Siswa" value={stats.total_students} color="grey" />
                <StatCard label="Hadir Terdata" value={stats.hadir_terdata} color="green" />
                <StatCard label="Terlambat" value={stats.terlambat} color="amber" />
                <StatCard label="Sakit / Izin" value={stats.sakit_izin} color="blue" />
                <StatCard label="Alpa (Kosong)" value={stats.alpa} color="red" />
            </section>

            {/* Class Filter + Drill Breadcrumb */}
            <section className="flex flex-wrap items-center gap-3 mb-6">
                <select
                    onChange={handleClassFilter}
                    value={selectedClassId ?? ""}
                    className="px-3 py-2 border border-border rounded-lg bg-surface text-text-primary text-[13px]"
                >
                    <option value="">Semua Kelas</option>
                    {classes.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>

                {selectedClassId && (
                    <>
                        <span className="text-text-muted text-[13px]">/</span>
                        <button onClick={resetDrill} className="text-[13px] text-primary hover:underline">
                            {classDetail?.class.name ?? "Kelas"}
                        </button>
                    </>
                )}

                {studentDetail && (
                    <>
                        <span className="text-text-muted text-[13px]">/</span>
                        <span className="text-[13px] text-text-primary font-semibold">
                            {studentDetail.student.name}
                        </span>
                    </>
                )}
            </section>

            {/* Level 1 → Level 2: Class Drill-Down */}
            {!selectedClassId && (
                <section className="bg-surface border border-border rounded-lg p-4 lg:p-6 mb-6">
                    <h2 className="text-[16px] font-bold text-text-primary font-inter mb-4">
                        Rekap Per Kelas — {overview.date}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {overview.kelas.map((k) => (
                            <button
                                key={k.id}
                                onClick={() => drillToClass(k.id)}
                                className="bg-background rounded-lg p-4 text-left hover:ring-2 hover:ring-primary transition-all"
                            >
                                <div className="font-semibold text-text-primary text-[14px] mb-2">{k.name}</div>
                                <div className="grid grid-cols-3 gap-2 text-center">
                                    <div>
                                        <div className="text-[18px] font-bold text-success">{k.hadir}</div>
                                        <div className="text-[11px] text-text-muted">Hadir</div>
                                    </div>
                                    <div>
                                        <div className="text-[18px] font-bold text-warning">{k.terlambat}</div>
                                        <div className="text-[11px] text-text-muted">Terlambat</div>
                                    </div>
                                    <div>
                                        <div className="text-[18px] font-bold text-text-primary">{k.total}</div>
                                        <div className="text-[11px] text-text-muted">Total</div>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </section>
            )}

            {/* Level 2 → Level 3: Student List within Class */}
            {classDetail && !studentDetail && (
                <section className="bg-surface border border-border rounded-lg p-4 lg:p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-[16px] font-bold text-text-primary font-inter">
                            Siswa — {classDetail.class.name}
                        </h2>
                        <span className="text-[13px] text-text-muted">{classDetail.date}</span>
                    </div>
                    <table className="w-full text-[13px]">
                        <thead>
                            <tr className="text-text-muted border-b border-border">
                                <th className="text-left py-2 font-medium">Nama</th>
                                <th className="text-left py-2 font-medium">NIS</th>
                                <th className="text-left py-2 font-medium">Status</th>
                                <th className="text-left py-2 font-medium">Waktu</th>
                            </tr>
                        </thead>
                        <tbody>
                            {classDetail.students.map((s) => (
                                <tr
                                    key={s.id}
                                    onClick={() => drillToStudent(s.id)}
                                    className="border-b border-border hover:bg-muted/50 cursor-pointer transition-colors"
                                >
                                    <td className="py-2.5 font-medium text-text-primary">{s.name}</td>
                                    <td className="py-2.5 text-text-muted">{s.nis}</td>
                                    <td className="py-2.5">
                                        <StatusBadge variant={statusToVariant[s.status] ?? "absent"} />
                                    </td>
                                    <td className="py-2.5 text-text-muted">{s.check_in_time ?? "-"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            )}

            {/* Level 3 → Level 4: Student Detail */}
            {studentDetail && (
                <section className="bg-surface border border-border rounded-lg p-4 lg:p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-[16px] font-bold text-text-primary font-inter">
                            Detail — {studentDetail.student.name}
                        </h2>
                        <span className="text-[13px] text-text-muted">
                            Kelas {studentDetail.student.class} — {studentDetail.month}/{studentDetail.year}
                        </span>
                    </div>
                    <div className="grid grid-cols-4 gap-3 mb-4">
                        <div className="bg-background rounded-lg p-3 text-center">
                            <div className="text-[20px] font-bold text-primary">{studentDetail.stats.total_hari}</div>
                            <div className="text-[11px] text-text-muted">Total</div>
                        </div>
                        <div className="bg-background rounded-lg p-3 text-center">
                            <div className="text-[20px] font-bold text-success">{studentDetail.stats.hadir}</div>
                            <div className="text-[11px] text-text-muted">Hadir</div>
                        </div>
                        <div className="bg-background rounded-lg p-3 text-center">
                            <div className="text-[20px] font-bold text-warning">{studentDetail.stats.terlambat}</div>
                            <div className="text-[11px] text-text-muted">Terlambat</div>
                        </div>
                        <div className="bg-background rounded-lg p-3 text-center">
                            <div className="text-[20px] font-bold text-danger">{studentDetail.stats.alpa}</div>
                            <div className="text-[11px] text-text-muted">Alpa</div>
                        </div>
                    </div>
                    <div className="bg-background rounded-lg p-3 mb-4 text-center">
                        <div className="text-[24px] font-bold text-primary">{studentDetail.stats.persentase_kehadiran}%</div>
                        <div className="text-[12px] text-text-muted">Persentase Kehadiran</div>
                    </div>
                    <table className="w-full text-[13px]">
                        <thead>
                            <tr className="text-text-muted border-b border-border">
                                <th className="text-left py-2 font-medium">Tanggal</th>
                                <th className="text-left py-2 font-medium">Status</th>
                                <th className="text-left py-2 font-medium">Jam</th>
                            </tr>
                        </thead>
                        <tbody>
                            {studentDetail.daily.map((d, i) => (
                                <tr key={i} className="border-b border-border">
                                    <td className="py-2 text-text-primary">{d.date}</td>
                                    <td className="py-2">
                                        <StatusBadge variant={statusToVariant[d.status] ?? "absent"} />
                                    </td>
                                    <td className="py-2 text-text-muted">{d.check_in_time ?? "-"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            )}

            {/* Charts */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-surface border border-border rounded-lg p-4 lg:p-6">
                    <AttendanceChart
                        data={monthlyTrend.months.map((m) => ({ label: m.bulan, hadir: m.hadir, terlambat: m.terlambat }))}
                        title={`Tren Bulanan ${monthlyTrend.year}`}
                    />
                </div>
                <div className="bg-surface border border-border rounded-lg p-4 lg:p-6">
                    <AttendanceChart
                        data={weeklyTrend.map((w) => ({ label: w.label, hadir: w.hadir, terlambat: w.terlambat }))}
                        title="Tren Mingguan"
                    />
                </div>
            </section>

            {/* Today's Attendance */}
            <section className="bg-surface border border-border rounded-lg p-4 lg:p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-[16px] font-bold text-text-primary font-inter">Kehadiran Hari Ini</h2>
                    {pendingLeaveCount > 0 && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-danger-bg text-danger rounded-full text-[12px] font-semibold">
                            <span className="w-2 h-2 bg-danger rounded-full" />
                            {pendingLeaveCount} izin menunggu
                        </span>
                    )}
                </div>
                <Table
                    columns={attendanceColumns}
                    data={todayAttendance}
                    keyExtractor={(r) => r.id}
                    emptyMessage="Belum ada data kehadiran hari ini."
                />
            </section>

            {/* Monthly Stats */}
            <section className="bg-surface border border-border rounded-lg p-4 lg:p-6 mb-6">
                <h2 className="text-[16px] font-bold text-text-primary font-inter mb-4">
                    Statistik Bulanan — {monthlyStats.bulan}
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-background rounded-lg p-4 text-center">
                        <div className="text-[24px] font-bold text-primary">{monthlyStats.hari_efektif}</div>
                        <div className="text-[12px] text-text-muted mt-1">Hari Efektif</div>
                    </div>
                    <div className="bg-background rounded-lg p-4 text-center">
                        <div className="text-[24px] font-bold text-success">{monthlyStats.total_hadir}</div>
                        <div className="text-[12px] text-text-muted mt-1">Total Hadir</div>
                    </div>
                    <div className="bg-background rounded-lg p-4 text-center">
                        <div className="text-[24px] font-bold text-warning">{monthlyStats.total_terlambat}</div>
                        <div className="text-[12px] text-text-muted mt-1">Total Terlambat</div>
                    </div>
                    <div className="bg-background rounded-lg p-4 text-center">
                        <div className="text-[24px] font-bold text-primary">{monthlyStats.rata_hadir_per_hari}</div>
                        <div className="text-[12px] text-text-muted mt-1">Rata-rata/Hari</div>
                    </div>
                </div>
            </section>

            {/* Mobile Dashboard Stats */}
            <section className="lg:hidden mb-6">
                <DashboardStats />
            </section>
        </AdminLayout>
    );
}
