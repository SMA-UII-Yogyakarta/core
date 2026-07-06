import { useState } from "react";
import { router } from "@inertiajs/react";
import AttendanceChart from "@/Components/AttendanceChart";
import { StatCard, StatusBadge, FilterBar, Button } from "@/Components";
import SiswaLayout from "@/Layouts/SiswaLayout";

interface Student {
    id: number;
    nis: string;
    name: string;
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
    hadir: number;
    terlambat: number;
}

interface Stats {
    total_hari: number;
    hadir: number;
    terlambat: number;
    alpa: number;
}

interface PageProps {
    student: Student;
    attendances: AttendanceRecord[];
    leaveRequests: LeaveRequest[];
    bulan: number;
    tahun: number;
    stats: Stats;
    bulanName: string;
    monthlyTrend: MonthlyTrend[];
}

export default function RiwayatKehadiran({
    student,
    attendances,
    leaveRequests,
    bulan,
    tahun,
    stats,
    bulanName,
    monthlyTrend,
}: PageProps) {
    const [bulanVal, setBulanVal] = useState(bulan.toString());
    const [tahunVal, setTahunVal] = useState(tahun.toString());

    const handleFilter = () => {
        router.get(
            "/siswa/riwayat",
            { bulan: bulanVal, tahun: tahunVal },
            { preserveState: true },
        );
    };

    const monthNames = [
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

    return (
        <SiswaLayout
            title="Riwayat Kehadiran"
            userInitial={student.name.charAt(0)}
            showBack
            backHref="/siswa/dashboard"
        >
            {/* Profile */}
            <section className="bg-surface border border-border rounded-xl p-5 mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold text-[14px]">
                        {student.name.charAt(0)}
                    </div>
                    <div>
                        <h2 className="text-[16px] font-bold text-text-primary">
                            {student.name}
                        </h2>
                        <p className="text-[12px] text-text-muted">
                            {student.class?.name ?? "-"} — NIS: {student.nis}
                        </p>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                <StatCard
                    label="Hari Tercatat"
                    value={stats.total_hari}
                    color="grey"
                />
                <StatCard label="Hadir" value={stats.hadir} color="green" />
                <StatCard
                    label="Terlambat"
                    value={stats.terlambat}
                    color="amber"
                />
                <StatCard label="Alpa" value={stats.alpa} color="red" />
            </section>

            {/* Monthly Trend Chart */}
            {monthlyTrend.length > 0 && (
                <section className="bg-surface border border-border rounded-xl p-5 mb-6">
                    <h2 className="text-[16px] font-bold text-text-primary font-inter mb-4">
                        Tren Kehadiran Bulanan
                    </h2>
                    <AttendanceChart data={monthlyTrend} title="" />
                </section>
            )}

            {/* Filter */}
            <FilterBar className="mb-6">
                <FilterBar.Select
                    label="Bulan"
                    options={monthNames.map((name, i) => ({
                        value: (i + 1).toString(),
                        label: name,
                    }))}
                    value={bulanVal}
                    onChange={(e) => setBulanVal(e.target.value)}
                />
                <FilterBar.Select
                    label="Tahun"
                    options={["2024", "2025", "2026", "2027"].map((t) => ({
                        value: t,
                        label: t,
                    }))}
                    value={tahunVal}
                    onChange={(e) => setTahunVal(e.target.value)}
                />
                <Button variant="primary" onClick={handleFilter}>
                    Tampilkan
                </Button>
            </FilterBar>

            {/* Attendance Table */}
            <section className="bg-surface border border-border rounded-xl p-5 mb-6">
                <h2 className="text-[16px] font-bold text-text-primary font-inter mb-4">
                    Detail Kehadiran — {bulanName} {tahun}
                </h2>
                {attendances.length === 0 ? (
                    <p className="text-text-muted text-[13px] text-center py-8">
                        Belum ada data kehadiran.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse font-inter">
                            <thead>
                                <tr className="bg-background border-b border-border">
                                    <th className="px-4 py-3 text-left text-[12px] font-semibold text-text-muted uppercase">
                                        Tanggal
                                    </th>
                                    <th className="px-4 py-3 text-left text-[12px] font-semibold text-text-muted uppercase">
                                        Jam Masuk
                                    </th>
                                    <th className="px-4 py-3 text-left text-[12px] font-semibold text-text-muted uppercase">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendances.map((att) => (
                                    <tr
                                        key={att.id}
                                        className="border-b border-border last:border-b-0 hover:bg-background transition-colors"
                                    >
                                        <td className="px-4 py-3 text-[14px] text-text-primary">
                                            {att.attendance_date}
                                        </td>
                                        <td className="px-4 py-3 text-[14px] text-text-primary">
                                            {att.check_in_time} WIB
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusBadge
                                                variant={
                                                    att.status === "Present"
                                                        ? "present"
                                                        : "late"
                                                }
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* Leave Requests */}
            <section className="bg-surface border border-border rounded-xl p-5">
                <h2 className="text-[16px] font-bold text-text-primary font-inter mb-4">
                    Riwayat Izin
                </h2>
                {leaveRequests.length === 0 ? (
                    <p className="text-text-muted text-[13px] text-center py-4">
                        Belum ada pengajuan izin.
                    </p>
                ) : (
                    <div className="space-y-2">
                        {leaveRequests.map((lr) => (
                            <div
                                key={lr.id}
                                className="flex items-center justify-between py-2 border-b border-border last:border-b-0"
                            >
                                <div>
                                    <span className="text-[13px] text-text-primary font-medium">
                                        {lr.category}
                                    </span>
                                    <span className="text-[12px] text-text-muted ml-2">
                                        {lr.start_date} — {lr.end_date}
                                    </span>
                                </div>
                                <StatusBadge
                                    variant={
                                        lr.approval_status === "Approved"
                                            ? "approved"
                                            : lr.approval_status === "Rejected"
                                              ? "rejected"
                                              : "pending"
                                    }
                                />
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </SiswaLayout>
    );
}
