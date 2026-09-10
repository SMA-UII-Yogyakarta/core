import { Link, router, usePage } from "@inertiajs/react";
import {
    FiActivity,
    FiCalendar,
    FiCheckCircle,
    FiChevronRight,
    FiClock,
    FiFileText,
    FiUserCheck,
    FiUsers,
} from "react-icons/fi";
import { Button, Card, DashboardHero, NativeSelect, PageHeader, StatCard, StatusBadge } from "@/Components";
import { useLanguage } from "@/Contexts/LanguageContext";
import AppShell from "@/Layouts/AppShell";

interface Student {
    id: number;
    name: string;
    class: { id: number; name: string } | null;
    nis: string;
}

interface TodayAttendance {
    id: number;
    status: string;
    check_in_time: string | null;
    attendance_date: string;
}

interface SemesterStats {
    present: number;
    sick_permit: number;
    absent: number;
}

interface PageProps {
    guardian: { id: number; name: string };
    students: Student[];
    selectedStudentId: number | null;
    selectedStudent: Student | null;
    todayAttendance: TodayAttendance | null;
    semesterStats: SemesterStats | null;
}

export default function GuardianDashboard({
    guardian,
    students,
    selectedStudentId,
    selectedStudent: _selectedStudent,
    todayAttendance,
    semesterStats,
}: PageProps) {
    const { t } = useLanguage();
    const { schoolName = "SMA UII Yogyakarta", academicYear = "2026/2027" } = usePage().props as {
        schoolName?: string;
        academicYear?: string;
    };
    const handleSelectStudent = (val: string) => {
        router.get("/guardian", { student_id: val }, { preserveState: true });
    };

    return (
        <AppShell title={t("guardianDash.title")}>
            <div className="flex flex-col gap-6 font-inter">
                {/* 1. Page Header & Hero Greeting Card */}
                <PageHeader
                    title={t("guardianDash.welcome", { name: guardian?.name ?? t("guardianDash.welcomeFallback") })}
                    description={t("guardianDash.subtitle", { schoolName })}
                    className="hidden lg:flex shrink-0 mb-4"
                />

                <DashboardHero
                    title={t("guardianDash.heroTitle")}
                    description={schoolName}
                    badges={[
                        {
                            icon: <FiUsers className="w-3.5 h-3.5 text-accent" />,
                            label: t("guardianDash.heroBadgeStudents", { count: String(students.length) }),
                        },
                        {
                            icon: <FiCalendar className="w-3.5 h-3.5 text-white/70" />,
                            label: t("guardianDash.academicYear", { year: academicYear }),
                        },
                    ]}
                />

                {/* 2. Selector Profil Anak */}
                <Card className="p-5 border-border">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <label className="text-[12px] font-bold text-text-primary uppercase tracking-wider block font-inter">
                                {t("guardianDash.selectChild")}
                            </label>
                            <p className="text-[12px] text-text-muted mt-0.5">
                                {t("guardianDash.selectChildDesc")}
                            </p>
                        </div>
                        <div className="w-full sm:w-80 min-w-0 max-w-full">
                            <NativeSelect
                                value={selectedStudentId?.toString() ?? ""}
                                onChange={(e) => handleSelectStudent(e.target.value)}
                            >
                                {students.map((s) => (
                                    <option key={s.id} value={s.id.toString()}>
                                        {s.name} ({s.class?.name ?? "-"}) — NIS: {s.nis}
                                    </option>
                                ))}
                            </NativeSelect>
                        </div>
                    </div>
                </Card>

                {/* 3. Status Kehadiran Hari Ini Card */}
                <Card
                    className={`p-6 text-center border-2 flex flex-col items-center justify-center transition-all ${
                        todayAttendance ? "border-success/30 bg-success-bg" : "border-warning/30 bg-warning-bg"
                    }`}
                >
                    <div className="flex items-center justify-between w-full max-w-md mb-4">
                        <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
                            {t("guardianDash.todayStatus")}
                        </p>
                        <StatusBadge variant={todayAttendance ? "hadir" : "alpa"} />
                    </div>

                    <div
                        className={`w-16 h-16 rounded-full flex items-center justify-center text-white mb-3.5 shadow-md ${
                            todayAttendance ? "bg-success" : "bg-warning"
                        }`}
                    >
                        {todayAttendance ? <FiCheckCircle className="w-8 h-8" /> : <FiClock className="w-8 h-8" />}
                    </div>

                    <h3 className="text-[18px] sm:text-[20px] font-bold text-text-primary mb-1">
                        {todayAttendance ? t("guardianDash.childPresent") : t("guardianDash.childNotCheckedIn")}
                    </h3>

                    <p className="text-[13px] text-text-muted max-w-md">
                        {todayAttendance?.check_in_time ? (
                            <>
                                {t("guardianDash.recordedAt")}{" "}
                                <strong className="text-text-primary font-mono font-bold">
                                    {todayAttendance.check_in_time} WIB
                                </strong>
                            </>
                        ) : (
                            t("guardianDash.schoolHours")
                        )}
                    </p>
                </Card>

                {/* 4. Action Cards Side-by-Side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card className="p-5 hover:border-primary/40 transition-all flex flex-col justify-between group">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary-light text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                <FiActivity className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-[15px] font-bold text-text-primary">{t("guardianDash.historyTitle")}</h4>
                                <p className="text-[12px] text-text-muted mt-1 leading-relaxed">
                                    {t("guardianDash.historyDesc")}
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-border flex justify-end">
                            <Link href="/guardian/history">
                                <Button variant="outline" size="sm" icon={<FiChevronRight className="w-4 h-4" />}>
                                    {t("guardianDash.historyBtn")}
                                </Button>
                            </Link>
                        </div>
                    </Card>

                    <Card className="p-5 hover:border-accent/40 transition-all flex flex-col justify-between group bg-accent/5 border-accent/20">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-accent/20 text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                <FiFileText className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-[15px] font-bold text-text-primary">{t("guardianDash.leaveTitle")}</h4>
                                <p className="text-[12px] text-text-muted mt-1 leading-relaxed">
                                    {t("guardianDash.leaveDesc")}
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-accent/20 flex justify-end">
                            <Link href="/guardian/leave-application">
                                <Button variant="primary" size="sm" icon={<FiChevronRight className="w-4 h-4" />}>
                                    {t("guardianDash.leaveBtn")}
                                </Button>
                            </Link>
                        </div>
                    </Card>
                </div>

                {/* 5. Ringkasan Semester Ini */}
                <div className="space-y-3">
                    <h3 className="text-[13px] font-bold text-text-primary uppercase tracking-wider font-inter flex items-center gap-2">
                        <FiUserCheck className="w-4 h-4 text-primary" />
                        <span>{t("guardianDash.semesterSummary")}</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <StatCard label={t("guardianDash.summaryPresent")} value={semesterStats?.present ?? 0} />
                        <StatCard label={t("guardianDash.summarySickPermit")} value={semesterStats?.sick_permit ?? 0} />
                        <StatCard label={t("guardianDash.summaryAbsent")} value={semesterStats?.absent ?? 0} />
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
