import { StatCard, StatusBadge } from "@/Components";
import TeacherLayout from "@/Layouts/TeacherLayout";

interface Teacher {
    id: number;
    name: string;
}

interface SchoolClass {
    id: number;
    name: string;
}

interface Student {
    id: number;
    nis: string;
    name: string;
    attendances: { id: number; status: string; check_in_time: string }[];
}

interface Stats {
    total: number;
    present: number;
    late: number;
    absent: number;
}

interface PageProps {
    teacher: Teacher;
    class: SchoolClass | null;
    students: Student[];
    stats: Stats | null;
}

export default function DashboardWaliKelas({
    teacher,
    class: kelas,
    students,
    stats,
}: PageProps) {
    return (
        <TeacherLayout
            title="Dashboard Wali Kelas"
            username={teacher.name}
            userInitial={teacher.name.charAt(0)}
            activeMenu="homeroom"
        >
            {!kelas ? (
                <div className="bg-surface border border-border rounded-xl p-12 text-center">
                    <p className="text-text-muted text-[14px]">
                        Anda belum ditugaskan sebagai wali kelas.
                    </p>
                </div>
            ) : (
                <>
                    {/* Class Header */}
                    <section className="bg-surface border border-border rounded-xl p-5 mb-6">
                        <h2 className="text-[18px] font-bold text-text-primary">
                            {kelas.name}
                        </h2>
                        <p className="text-[13px] text-text-muted mt-1">
                            {stats?.total ?? 0} siswa aktif
                        </p>
                    </section>

                    {/* Stats */}
                    {stats && (
                        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                            <StatCard
                                label="Total Siswa"
                                value={stats.total}
                                color="grey"
                            />
                            <StatCard
                                label="Hadir"
                                value={stats.present}
                                color="green"
                            />
                            <StatCard
                                label="Terlambat"
                                value={stats.late}
                                color="amber"
                            />
                            <StatCard
                                label="Tidak Hadir"
                                value={stats.absent}
                                color="red"
                            />
                        </section>
                    )}

                    {/* Student List */}
                    <section className="bg-surface border border-border rounded-xl p-5">
                        <h2 className="text-[16px] font-bold text-text-primary font-inter mb-4">
                            Daftar Siswa Hari Ini
                        </h2>
                        {students.length === 0 ? (
                            <p className="text-text-muted text-[13px] text-center py-8">
                                Belum ada data siswa.
                            </p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse font-inter">
                                    <thead>
                                        <tr className="bg-background border-b border-border">
                                            <th className="px-3 py-2 text-left text-[12px] font-semibold text-text-muted uppercase">
                                                NIS
                                            </th>
                                            <th className="px-3 py-2 text-left text-[12px] font-semibold text-text-muted uppercase">
                                                Nama
                                            </th>
                                            <th className="px-3 py-2 text-left text-[12px] font-semibold text-text-muted uppercase">
                                                Status
                                            </th>
                                            <th className="px-3 py-2 text-left text-[12px] font-semibold text-text-muted uppercase">
                                                Jam
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students.map((s) => {
                                            const att = s.attendances[0];
                                            return (
                                                <tr
                                                    key={s.id}
                                                    className="border-b border-border last:border-b-0 hover:bg-background transition-colors"
                                                >
                                                    <td className="px-3 py-2 text-[13px] text-text-primary">
                                                        {s.nis}
                                                    </td>
                                                    <td className="px-3 py-2 text-[13px] text-text-primary font-medium">
                                                        {s.name}
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        {att ? (
                                                            <StatusBadge
                                                                variant={
                                                                    att.status ===
                                                                    "Present"
                                                                        ? "present"
                                                                        : "late"
                                                                }
                                                            />
                                                        ) : (
                                                            <StatusBadge variant="absent" />
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2 text-[13px] text-text-muted">
                                                        {att?.check_in_time ??
                                                            "-"}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </>
            )}
        </TeacherLayout>
    );
}
