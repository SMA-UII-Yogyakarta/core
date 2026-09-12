import { Link } from "@inertiajs/react";
import { FiCalendar, FiCamera, FiCheckCircle } from "react-icons/fi";
import { Button, DashboardHero, PageHeader, StatCard, StatusBadge } from "@/Components";
import { useLanguage } from "@/Contexts/LanguageContext";
import AppShell from "@/Layouts/AppShell";

interface Student {
    id: number;
    nis: string;
    nisn: string;
    name: string;
    class: { id: number; name: string } | null;
}

interface TodayAttendance {
    id: number;
    status: string;
    check_in_time: string;
    attendance_date: string;
}

interface Stats {
    total_attendance: number;
    present: number;
    late: number;
    pending_leaves: number;
    absent?: number;
}

interface PageProps {
    student: Student;
    todayAttendance: TodayAttendance | null;
    stats: Stats;
}

export default function StudentDashboard({ student, todayAttendance, stats }: PageProps) {
    const { t } = useLanguage();
    const absent = stats.absent ?? 0;
    const className = student.class?.name ?? "-";
    const totalDays = (stats as unknown as { total_days?: number }).total_days ?? stats.present + stats.late + absent;
    const presentPct = totalDays > 0 ? Math.round((stats.present / totalDays) * 100) : 0;
    const latePct = totalDays > 0 ? Math.round((stats.late / totalDays) * 100) : 0;
    const absentPct = totalDays > 0 ? Math.round((absent / totalDays) * 100) : 0;

    return (
        <AppShell title={t("studentDash.title")}>
            <div className="flex flex-col gap-4 sm:gap-6 font-inter">
                <PageHeader
                    title={t("studentDash.welcome", { name: student.name })}
                    description={t("studentDash.subtitle", {
                        className,
                        nis: student.nis,
                        nisn: student.nisn || "-",
                    })}
                    className="hidden lg:flex shrink-0 mb-4"
                />

                {/* Hero Greeting Card */}
                <DashboardHero
                    title={student.name}
                    description={t("studentDash.className", { className })}
                    descriptionClassName="text-accent text-[12px] sm:text-[13px] font-semibold"
                    dusk="student-greeting-card"
                    data-testid="student-greeting-card"
                />

                {/* Primary Action Button */}
                {todayAttendance ? (
                    <div
                        className="rounded-2xl px-4 py-3 sm:py-3.5 flex items-center justify-between bg-success-bg border border-success/30 text-success shadow-card"
                        dusk="today-attendance-done"
                        data-testid="today-attendance-done"
                    >
                        <div className="flex items-center gap-2">
                            <FiCheckCircle className="text-[18px]" />
                            <span className="font-bold text-[13px] sm:text-[14px]">
                                {t("studentDash.attendanceDone", { time: todayAttendance.check_in_time })}
                            </span>
                        </div>
                        <StatusBadge variant={todayAttendance.status} />
                    </div>
                ) : (
                    <Link
                        href="/student/attendance"
                        className="w-full"
                        dusk="btn-presensi-mobile"
                        data-testid="btn-presensi-mobile"
                    >
                        <Button
                            variant="primary"
                            size="lg"
                            className="w-full justify-center text-[14px] sm:text-[15px] font-extrabold py-3 sm:py-3.5 shadow-md rounded-xl"
                            icon={<FiCamera className="w-4 h-4" />}
                        >
                            <span>{t("studentDash.checkInNow")}</span>
                        </Button>
                    </Link>
                )}

                {/* REKAP BULAN INI */}
                <div className="space-y-2.5 sm:space-y-3">
                    <div className="flex items-center justify-between px-0.5">
                        <h3 className="text-[12px] sm:text-[13px] font-bold text-text-muted sm:text-text-primary uppercase tracking-wider">
                            {t("studentDash.monthlyRecap")}
                        </h3>
                        {totalDays > 0 && (
                            <span className="text-[11px] text-text-muted font-medium">
                                {t("studentDash.totalDays", { count: String(totalDays) })}
                            </span>
                        )}
                    </div>
                    <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                        <StatCard
                            label={t("studentDash.statHadir")}
                            value={stats.present}
                            color="green"
                            indicatorDot="green"
                            percentage={presentPct}
                            percentageColor="text-success"
                            subtitle={t("studentDash.statHadirSub")}
                        />
                        <StatCard
                            label={t("studentDash.statTelat")}
                            value={stats.late}
                            color="amber"
                            indicatorDot="amber"
                            percentage={latePct}
                            percentageColor="text-warning"
                            subtitle={t("studentDash.statTelatSub")}
                        />
                        <StatCard
                            label={t("studentDash.statAlpa")}
                            value={absent}
                            color="red"
                            indicatorDot="red"
                            percentage={absentPct}
                            percentageColor="text-danger"
                            subtitle={t("studentDash.statAlpaSub")}
                        />
                    </div>
                </div>

                {/* Menu Utama Navigasi Grid */}
                <div className="space-y-2.5 sm:space-y-3">
                    <h3 className="text-[12px] sm:text-[13px] font-bold text-text-muted sm:text-text-primary uppercase tracking-wider px-0.5">
                        {t("studentDash.menuTitle")}
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        <Link
                            href="/student/attendance"
                            className="bg-surface border border-border rounded-2xl p-3.5 sm:p-4 shadow-card hover:border-primary/40 active:scale-[0.98] transition-all flex flex-col justify-between group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-[18px] mb-2.5 group-hover:scale-105 transition-transform">
                                <FiCamera />
                            </div>
                            <div>
                                <span className="text-[13px] sm:text-[14px] font-bold text-text-primary block leading-tight">
                                    {t("studentDash.menuLive")}
                                </span>
                                <span className="text-[11px] text-text-muted mt-0.5 block truncate sm:whitespace-normal">
                                    {t("studentDash.menuLiveDesc")}
                                </span>
                            </div>
                        </Link>

                        <Link
                            href="/student/history"
                            className="bg-surface border border-border rounded-2xl p-3.5 sm:p-4 shadow-card hover:border-warning/40 active:scale-[0.98] transition-all flex flex-col justify-between group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-warning/10 text-warning flex items-center justify-center text-[18px] mb-2.5 group-hover:scale-105 transition-transform">
                                <FiCalendar />
                            </div>
                            <div>
                                <span className="text-[13px] sm:text-[14px] font-bold text-text-primary block leading-tight">
                                    {t("studentDash.menuHistory")}
                                </span>
                                <span className="text-[11px] text-text-muted mt-0.5 block truncate sm:whitespace-normal">
                                    {t("studentDash.menuHistoryDesc")}
                                </span>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
