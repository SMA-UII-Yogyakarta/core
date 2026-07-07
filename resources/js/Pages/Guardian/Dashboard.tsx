import { router } from "@inertiajs/react";
import AttendanceChart from "@/Components/AttendanceChart";
import { StatCard, StatusBadge } from "@/Components";
import GuardianLayout from "@/Layouts/GuardianLayout";

interface Student {
  id: number;
  name: string;
  class: { id: number; name: string } | null;
  nis: string;
}

interface Stats {
  total_days: number;
  present: number;
  late: number;
  absent: number;
  pending_leave: number;
}

interface LeaveRequest {
  id: number;
  category: string;
  start_date: string;
  end_date: string;
  approval_status: string;
  student: { id: number; name: string };
}

interface MonthlyTrend {
  month: string;
  present: number;
  late: number;
  absent: number;
}

interface PageProps {
  guardian: { id: number; name: string };
  students: Student[];
  stats: Stats | null;
  recentLeaves: LeaveRequest[];
  selectedStudentId: number | null;
  selectedStudent: Student | null;
  studentStats: {
    total: number;
    present: number;
    late: number;
    sick: number;
    permit: number;
  } | null;
  monthlyTrend: MonthlyTrend[] | null;
  recentHistory: Array<{
    id: number;
    status: string;
    check_in_time: string;
    attendance_date: string;
  }>;
}

export default function WaliMuridDashboard({
  guardian,
  students,
  stats,
  recentLeaves,
  selectedStudentId,
  selectedStudent,
  studentStats,
  monthlyTrend,
  recentHistory,
}: PageProps) {
  function selectStudent(id: number) {
    router.get("/guardian", { student_id: id }, { preserveState: true });
  }

  function resetSelection() {
    router.get("/guardian", {}, { preserveState: true });
  }

  function statusCount(records: MonthlyTrend[]) {
    return records.reduce(
      (acc, r) => ({
        present: acc.present + r.present,
        late: acc.late + r.late,
        absent: acc.absent + r.absent,
      }),
      { present: 0, late: 0, absent: 0 },
    );
  }

  const trendStats = monthlyTrend ? statusCount(monthlyTrend) : null;

  return (
    <GuardianLayout
      title="Dashboard"
      username={guardian.name}
      userInitial={guardian.name.charAt(0)}
    >
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

      {/* Child Selector */}
      <section className="mb-6">
        <label className="block text-[13px] text-text-muted font-medium mb-2">
          Pilih Anak
        </label>
        <div className="flex gap-2 flex-wrap">
          {students.map((s) => (
            <button
              key={s.id}
              onClick={() => selectStudent(s.id)}
              className={`px-4 py-2 rounded-lg border text-[13px] font-semibold transition-colors ${
                selectedStudentId === s.id
                  ? "bg-primary text-white border-primary"
                  : "bg-surface text-text-primary border-border hover:bg-background"
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      </section>

      {selectedStudent && studentStats ? (
        <>
          <section className="bg-surface border border-border rounded-xl p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-primary font-bold text-[14px]">
                  {selectedStudent.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-[16px] font-bold text-text-primary">
                    {selectedStudent.name}
                  </h2>
                  <p className="text-[12px] text-text-muted">
                    {selectedStudent.class?.name ?? "-"} — NIS: {selectedStudent.nis}
                  </p>
                </div>
              </div>
              <button
                onClick={resetSelection}
                className="text-[12px] text-primary hover:underline"
              >
                Lihat Semua
              </button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard label="Total Presensi" value={studentStats.total} color="grey" />
              <StatCard label="Hadir" value={studentStats.present} color="green" />
              <StatCard label="Terlambat" value={studentStats.late} color="amber" />
              <StatCard
                label="Sakit"
                value={studentStats.sick + studentStats.permit}
                color="blue"
              />
            </div>
          </section>

          {monthlyTrend && monthlyTrend.length > 0 && (
            <section className="bg-surface border border-border rounded-xl p-5 mb-6">
              <h2 className="text-[16px] font-bold text-text-primary mb-4">
                Tren Bulanan
              </h2>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <StatCard label="Hadir" value={trendStats?.present ?? 0} color="green" />
                <StatCard
                  label="Terlambat"
                  value={trendStats?.late ?? 0}
                  color="amber"
                />
                <StatCard label="Absent" value={trendStats?.absent ?? 0} color="red" />
              </div>
              <AttendanceChart
                data={monthlyTrend.map((m) => ({
                  label: m.month,
                  present: m.present,
                  late: m.late,
                }))}
                title="Kehadiran Bulanan"
              />
            </section>
          )}

          <section className="bg-surface border border-border rounded-xl p-5 mb-6">
            <h2 className="text-[16px] font-bold text-text-primary mb-4">
              Riwayat Terbaru
            </h2>
            {recentHistory.length === 0 ? (
              <p className="text-text-muted text-[13px] text-center py-6">
                Belum ada riwayat presensi.
              </p>
            ) : (
              <div className="space-y-2">
                {recentHistory.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between py-2 border-b border-border last:border-b-0"
                  >
                    <span className="text-[13px] text-text-primary">
                      {r.attendance_date}
                    </span>
                    <span className="text-[13px] text-text-muted">
                      {r.check_in_time} WIB
                    </span>
                    <StatusBadge
                      variant={
                        r.status === "Present"
                          ? "present"
                          : r.status === "Late"
                            ? "late"
                            : "absent"
                      }
                    />
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      ) : (
        <>
          {/* Stats Overview */}
          {stats && (
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              <StatCard label="Days Recorded" value={stats.total_days} color="grey" />
              <StatCard label="Hadir" value={stats.present} color="green" />
              <StatCard label="Terlambat" value={stats.late} color="amber" />
              <StatCard label="Izin Pending" value={stats.pending_leave} color="blue" />
            </section>
          )}

          {/* Children Cards */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-6">
            {students.map((s) => (
              <button
                key={s.id}
                onClick={() => selectStudent(s.id)}
                className="bg-surface border border-border rounded-xl p-5 text-left hover:bg-background transition-colors"
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
                      {s.class?.name ?? "Belum ada kelas"} — NIS: {s.nis}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </section>
        </>
      )}

      {/* Recent Leave Requests */}
      <section className="bg-surface border border-border rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[16px] font-bold text-text-primary font-inter">
            Pengajuan Izin Terbaru
          </h2>
          <a
            href="/guardian/leave-application"
            className="text-[13px] text-primary font-semibold hover:underline"
          >
            Lihat Semua
          </a>
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
                    <span className="text-[12px] text-text-muted">— {lr.category}</span>
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

      <section className="flex gap-3">
        <a
          href="/guardian/leave-application"
          className="flex-1 px-5 py-4 bg-primary text-white rounded-xl text-center font-semibold text-[14px] hover:bg-primary/90 transition-colors"
        >
          + Ajukan Izin
        </a>
      </section>
    </GuardianLayout>
  );
}
