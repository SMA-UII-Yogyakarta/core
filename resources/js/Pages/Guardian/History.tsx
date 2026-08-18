import { useState } from "react";
import { router } from "@inertiajs/react";
import {
    FiUser,
    FiCalendar,
    FiFilter,
    FiClock,
    FiFileText,
    FiBarChart2,
} from "react-icons/fi";
import AttendanceChart from "@/Components/features/AttendanceChart";
import {
    StatCard,
    StatusBadge,
    FilterBar,
    Button,
    Table,
    PageHeader,
    Card,
    EmptyState,
    Avatar,
} from "@/Components";
import type { Column } from "@/Components/ui/Table";
import AppShell from "@/Layouts/AppShell";

interface Student {
    id: number;
    name: string;
    nis: string;
    class: { id: number; name: string } | null;
}

interface AttendanceRecord {
    id: number;
    status: string;
    check_in_time: string;
    attendance_date: string;
}

interface LeaveRequest {
    id: number;
    category: string;
    start_date: string;
    end_date: string;
    approval_status: string;
}

interface MonthlyTrend {
    label: string;
    present: number;
    late: number;
}

interface Stats {
    total_days: number;
    present: number;
    late: number;
    absent: number;
}

interface PageProps {
    students: Student[];
    selectedStudentId: number;
    selectedStudent: Student | null;
    attendances: AttendanceRecord[];
    leaveRequests: LeaveRequest[];
    month: number;
    year: number;
    stats: Stats | null;
    monthlyTrend: MonthlyTrend[] | null;
}

const MONTH_NAMES = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
];

export default function History({
    students,
    selectedStudentId,
    selectedStudent,
    attendances,
    leaveRequests,
    month,
    year,
    stats,
    monthlyTrend,
}: PageProps) {
    const [monthVal, setMonthVal] = useState(month.toString());
    const [yearVal, setYearVal] = useState(year.toString());

    const handleSelectStudent = (id: number) => {
        router.get(
            "/guardian/history",
            { student_id: id, month: monthVal, year: yearVal },
            { preserveState: true }
        );
    };

    const handleFilter = () => {
        router.get(
            "/guardian/history",
            { student_id: selectedStudentId, month: monthVal, year: yearVal },
            { preserveState: true }
        );
    };

    // Columns for Attendance Table
    const attendanceColumns: Column<AttendanceRecord>[] = [
        {
            key: "attendance_date",
            header: "Tanggal Presensi",
            render: (row: AttendanceRecord) => (
                <div className="flex items-center gap-2 font-medium text-text-primary">
                    <FiCalendar className="w-4 h-4 text-text-muted shrink-0" />
                    <span>{row.attendance_date}</span>
                </div>
            ),
        },
        {
            key: "check_in_time",
            header: "Jam Masuk",
            render: (row: AttendanceRecord) => (
                <div className="flex items-center gap-2 font-mono font-medium text-text-primary">
                    <FiClock className="w-4 h-4 text-text-muted shrink-0" />
                    <span>{row.check_in_time ? `${row.check_in_time} WIB` : "-"}</span>
                </div>
            ),
        },
        {
            key: "status",
            header: "Status Kehadiran",
            render: (row: AttendanceRecord) => {
                const statusLower = row.status?.toLowerCase() ?? "";
                const variant =
                    statusLower === "present"
                        ? "present"
                        : statusLower === "late"
                        ? "late"
                        : "absent";
                return <StatusBadge variant={variant} />;
            },
        },
    ];

    // Columns for Leave Request Table
    const leaveColumns: Column<LeaveRequest>[] = [
        {
            key: "category",
            header: "Kategori Izin",
            render: (row: LeaveRequest) => (
                <div className="flex items-center gap-2 font-medium text-text-primary">
                    <FiFileText className="w-4 h-4 text-primary shrink-0" />
                    <span>{row.category}</span>
                </div>
            ),
        },
        {
            key: "period",
            header: "Periode Tanggal",
            render: (row: LeaveRequest) => (
                <span className="text-text-muted font-medium text-[13px]">
                    {row.start_date} {row.end_date && row.end_date !== row.start_date ? `s/d ${row.end_date}` : ""}
                </span>
            ),
        },
        {
            key: "approval_status",
            header: "Status Persetujuan",
            render: (row: LeaveRequest) => {
                const s = row.approval_status?.toLowerCase() ?? "pending";
                const variant =
                    s === "approved"
                        ? "approved"
                        : s === "rejected"
                        ? "rejected"
                        : "pending";
                return <StatusBadge variant={variant} />;
            },
        },
    ];

    return (
        <AppShell title="Riwayat Presensi Anak">
            <div className="flex flex-col gap-6 font-inter">
                {/* Header */}
                <PageHeader
                    title="Riwayat Presensi Anak"
                    description="Pantau laporan kehadiran harian, keterlambatan, dan riwayat pengajuan izin anak Anda."
                />

                {/* Child Selector Tabs */}
                <Card className="p-5 border-border">
                    <h3 className="text-[12px] font-bold text-text-muted uppercase tracking-wider mb-3 flex items-center gap-2 font-inter">
                        <FiUser className="w-4 h-4 text-primary" />
                        <span>Pilih Anak</span>
                    </h3>
                    <div className="flex flex-wrap gap-2.5">
                        {students.map((s) => {
                            const isSelected = s.id === selectedStudentId;
                            return (
                                <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => handleSelectStudent(s.id)}
                                    className={`px-4 py-2.5 rounded-xl border text-[13px] font-bold transition-all flex items-center gap-2 cursor-pointer ${
                                        isSelected
                                            ? "bg-primary text-white border-primary shadow-xs"
                                            : "bg-surface text-text-primary border-border hover:bg-muted"
                                    }`}
                                >
                                    <Avatar name={s.name} size="xs" />
                                    <span>{s.name}</span>
                                    {s.class?.name && (
                                        <span className={`text-[11px] px-1.5 py-0.5 rounded-md font-normal ${
                                            isSelected ? "bg-white/20 text-white" : "bg-muted text-text-muted"
                                        }`}>
                                            {s.class.name}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </Card>

                {selectedStudent ? (
                    <>
                        {/* Selected Student Profile Banner */}
                        <Card className="p-5 border-border bg-gradient-to-r from-surface to-muted/40">
                            <div className="flex items-center gap-4">
                                <Avatar name={selectedStudent.name} size="lg" className="ring-2 ring-primary/20" />
                                <div className="min-w-0">
                                    <h2 className="text-[18px] font-bold text-text-primary truncate">
                                        {selectedStudent.name}
                                    </h2>
                                    <p className="text-[13px] text-text-muted mt-0.5">
                                        Kelas: <strong className="text-text-primary font-semibold">{selectedStudent.class?.name ?? "-"}</strong>
                                        <span className="mx-2">•</span>
                                        NIS: <strong className="text-text-primary font-mono font-semibold">{selectedStudent.nis}</strong>
                                    </p>
                                </div>
                            </div>
                        </Card>

                        {/* Summary Stats */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                            <StatCard
                                label="Hari Tercatat"
                                value={stats?.total_days ?? 0}
                                color="grey"
                                subtitle="Total Hari Sekolah"
                            />
                            <StatCard
                                label="Hadir Tepat"
                                value={stats?.present ?? 0}
                                color="green"
                                subtitle="Sesuai Jam Masuk"
                            />
                            <StatCard
                                label="Terlambat"
                                value={stats?.late ?? 0}
                                color="amber"
                                subtitle="Lewat Batas Jam"
                            />
                            <StatCard
                                label="Tidak Hadir / Alpa"
                                value={stats?.absent ?? 0}
                                color="red"
                                subtitle="Tanpa Keterangan"
                            />
                        </div>

                        {/* Monthly Trend Chart */}
                        {monthlyTrend && monthlyTrend.length > 0 && (
                            <Card className="p-5 border-border">
                                <h3 className="text-[15px] font-bold text-text-primary font-inter mb-4 flex items-center gap-2">
                                    <FiBarChart2 className="w-4 h-4 text-primary" />
                                    <span>Grafik Tren Kehadiran Bulanan</span>
                                </h3>
                                <AttendanceChart data={monthlyTrend} />
                            </Card>
                        )}

                        {/* Filter Bar */}
                        <FilterBar>
                            <FilterBar.Select
                                label="Bulan"
                                options={MONTH_NAMES.map((name, i) => ({
                                    value: (i + 1).toString(),
                                    label: name,
                                }))}
                                value={monthVal}
                                onChange={(e) => setMonthVal(e.target.value)}
                            />
                            <FilterBar.Select
                                label="Tahun"
                                options={["2024", "2025", "2026", "2027"].map((t) => ({
                                    value: t,
                                    label: t,
                                }))}
                                value={yearVal}
                                onChange={(e) => setYearVal(e.target.value)}
                            />
                            <Button variant="primary" onClick={handleFilter} icon={<FiFilter className="w-4 h-4" />}>
                                Tampilkan Filter
                            </Button>
                        </FilterBar>

                        {/* Attendance Table */}
                        <section className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[16px] font-bold text-text-primary font-inter">
                                    Detail Presensi — {MONTH_NAMES[month - 1]} {year}
                                </h3>
                                <span className="text-[12px] font-normal text-text-muted font-inter">
                                    Total: {attendances.length} Rekam Data
                                </span>
                            </div>

                            {attendances.length === 0 ? (
                                <EmptyState
                                    title="Belum Ada Data Presensi"
                                    description={`Tidak ada rekaman data presensi untuk periode ${MONTH_NAMES[month - 1]} ${year}.`}
                                />
                            ) : (
                                <Table
                                    columns={attendanceColumns}
                                    data={attendances}
                                    keyExtractor={(item: AttendanceRecord) => item.id}
                                />
                            )}
                        </section>

                        {/* Leave Requests Table */}
                        <section className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[16px] font-bold text-text-primary font-inter">
                                    Riwayat Permohonan Izin / Sakit
                                </h3>
                                <span className="text-[12px] font-normal text-text-muted font-inter">
                                    Total: {leaveRequests.length} Pengajuan
                                </span>
                            </div>

                            {leaveRequests.length === 0 ? (
                                <EmptyState
                                    title="Belum Ada Pengajuan Izin"
                                    description="Siswa ini belum memiliki riwayat pengajuan izin atau sakit."
                                />
                            ) : (
                                <Table
                                    columns={leaveColumns}
                                    data={leaveRequests}
                                    keyExtractor={(item: LeaveRequest) => item.id}
                                />
                            )}
                        </section>
                    </>
                ) : (
                    <EmptyState
                        title="Tidak Ada Siswa Terpilih"
                        description="Silakan pilih salah satu profil anak di atas untuk menampilkan riwayat presensi."
                    />
                )}
            </div>
        </AppShell>
    );
}
