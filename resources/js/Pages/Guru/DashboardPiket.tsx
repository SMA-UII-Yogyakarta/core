import GuruLayout from "@/Layouts/GuruLayout";

interface Teacher {
    id: number;
    name: string;
}

interface ClassStat {
    class: string;
    total: number;
    present: number;
    late: number;
    absent: number;
    pending_leaves: number;
}

interface PageProps {
    teacher: Teacher;
    isScheduled: boolean;
    today: string;
    classStats: ClassStat[];
}

export default function DashboardPiket({
    teacher,
    isScheduled,
    today,
    classStats,
}: PageProps) {
    return (
        <GuruLayout
            title="Dashboard Guru Piket"
            username={teacher.name}
            userInitial={teacher.name.charAt(0)}
            activeMenu="piket"
        >
            {/* Status */}
            <section className="bg-surface border border-border rounded-xl p-5 mb-6">
                <div className="flex items-center gap-3 mb-3">
                    <div
                        className={`w-3 h-3 rounded-full ${isScheduled ? "bg-success" : "bg-text-muted"}`}
                    />
                    <span className="text-[14px] font-semibold text-text-primary">
                        {isScheduled
                            ? "Jadwal Piket Hari Ini"
                            : "Tidak Ada Jadwal Piket"}
                    </span>
                </div>
                <p className="text-[13px] text-text-muted">{today}</p>
            </section>

            {/* Stats Overview */}
            <section className="grid grid-cols-1 gap-3 mb-6">
                {classStats.map((cs) => (
                    <div
                        key={cs.class}
                        className="bg-surface border border-border rounded-xl p-5"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-[15px] font-bold text-text-primary">
                                {cs.class}
                            </h3>
                            <span className="text-[12px] text-text-muted">
                                {cs.total} siswa
                            </span>
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-center">
                            <div>
                                <div className="text-[18px] font-bold text-success">
                                    {cs.present}
                                </div>
                                <div className="text-[11px] text-text-muted">
                                    Hadir
                                </div>
                            </div>
                            <div>
                                <div className="text-[18px] font-bold text-warning">
                                    {cs.late}
                                </div>
                                <div className="text-[11px] text-text-muted">
                                    Terlambat
                                </div>
                            </div>
                            <div>
                                <div className="text-[18px] font-bold text-danger">
                                    {cs.absent}
                                </div>
                                <div className="text-[11px] text-text-muted">
                                    Alpa
                                </div>
                            </div>
                            <div>
                                <div className="text-[18px] font-bold text-primary">
                                    {cs.pending_leaves}
                                </div>
                                <div className="text-[11px] text-text-muted">
                                    Izin
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {classStats.length === 0 && (
                    <div className="bg-surface border border-border rounded-xl p-8 text-center">
                        <p className="text-text-muted text-[13px]">
                            Belum ada data kelas.
                        </p>
                    </div>
                )}
            </section>

            <div className="flex gap-3">
                <a
                    href="/admin/monitoring"
                    className="flex-1 px-4 py-3 bg-primary text-white rounded-xl text-center text-[13px] font-semibold hover:bg-primary/90 transition-colors"
                >
                    Monitoring Presensi
                </a>
                <a
                    href="/admin/verifikasi-izin"
                    className="flex-1 px-4 py-3 bg-surface border border-border text-text-primary rounded-xl text-center text-[13px] font-semibold hover:bg-background transition-colors"
                >
                    Verifikasi Izin
                </a>
            </div>
        </GuruLayout>
    );
}
