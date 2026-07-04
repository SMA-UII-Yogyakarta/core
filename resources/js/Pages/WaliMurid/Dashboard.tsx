import { Link } from "@inertiajs/react";
import { StatCard, StatusBadge } from "@/Components";
import WaliMuridLayout from "@/Layouts/WaliMuridLayout";

interface Student {
    id: number;
    name: string;
    class: { id: number; name: string } | null;
    nis: string;
}

interface Stats {
    total_hari: number;
    hadir: number;
    terlambat: number;
    alpa: number;
    izin_pending: number;
}

interface LeaveRequest {
    id: number;
    category: string;
    start_date: string;
    end_date: string;
    approval_status: string;
    student: { id: number; name: string };
}

interface PageProps {
    guardian: {
        id: number;
        name: string;
    };
    students: Student[];
    stats: Stats | null;
    recentLeaves: LeaveRequest[];
}

export default function WaliMuridDashboard({
    guardian,
    students,
    stats,
    recentLeaves,
}: PageProps) {
    return (
        <WaliMuridLayout
            title="Dashboard"
            username={guardian.name}
            userInitial={guardian.name.charAt(0)}
        >
            {/* Profile */}
            <section className="bg-surface border border-border rounded-xl p-5 mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-[16px]">
                        {guardian.name.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-[18px] font-bold text-text-primary">
                            {guardian.name}
                        </h1>
                        <p className="text-[13px] text-text-muted">
                            Wali Murid — {students.length} anak
                        </p>
                    </div>
                </div>
            </section>

            {/* Stats Overview */}
            {stats && (
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
                    <StatCard
                        label="Izin Pending"
                        value={stats.izin_pending}
                        color="blue"
                    />
                </section>
            )}

            {/* Children Cards */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-6">
                {students.map((s) => (
                    <div
                        key={s.id}
                        className="bg-surface border border-border rounded-xl p-5"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-primary font-bold text-[14px]">
                                {s.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="text-[15px] font-bold text-text-primary">
                                    {s.name}
                                </h3>
                                <p className="text-[12px] text-text-muted">
                                    {s.class?.name ?? "Belum ada kelas"} — NIS:{" "}
                                    {s.nis}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </section>

            {/* Recent Leave Requests */}
            <section className="bg-surface border border-border rounded-xl p-5 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-[16px] font-bold text-text-primary font-inter">
                        Pengajuan Izin Terbaru
                    </h2>
                    <Link
                        href="/wali/pengajuan-izin"
                        className="text-[13px] text-primary font-semibold hover:underline"
                    >
                        Lihat Semua
                    </Link>
                </div>
                {recentLeaves.length === 0 ? (
                    <p className="text-text-muted text-[13px] text-center py-6">
                        Belum ada pengajuan izin.
                    </p>
                ) : (
                    <div className="space-y-2">
                        {recentLeaves.slice(0, 5).map((lr) => (
                            <div
                                key={lr.id}
                                className="flex items-center justify-between py-2 border-b border-border last:border-b-0"
                            >
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[13px] font-semibold text-text-primary">
                                            {lr.student.name}
                                        </span>
                                        <span className="text-[12px] text-text-muted">
                                            — {lr.category}
                                        </span>
                                    </div>
                                    <p className="text-[12px] text-text-muted">
                                        {lr.start_date} — {lr.end_date}
                                    </p>
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

            {/* Quick Actions */}
            <section className="flex gap-3">
                <Link
                    href="/wali/pengajuan-izin"
                    className="flex-1 px-5 py-4 bg-primary text-white rounded-xl text-center font-semibold text-[14px] hover:bg-primary/90 transition-colors"
                >
                    + Ajukan Izin
                </Link>
            </section>
        </WaliMuridLayout>
    );
}
