import { Head, usePage } from "@inertiajs/react";
import { useLanguage } from "@/Contexts/LanguageContext";
import {
    PageHeader,
    Card,
    StatCard,
    AttendanceChart,
} from "@/Components";
import AppShell from "@/Layouts/AppShell";
import { FiVideo, FiCheckCircle, FiFile, FiClock, FiHome, FiList, FiBookOpen, FiSend, FiCamera } from "react-icons/fi";

interface OverviewProps {
    overview: {
        date: string;
        total_students: number;
        verified_present: number;
        present: number;
        late: number;
        sick_permission: number;
        absent: number;
        classes: Array<{
            id: number;
            name: string;
            total: number;
            present: number;
            late: number;
        }>;
    };
    monthlyTrend: { year: number; months: Array<{ label: string; present: number; late: number }> };
    weeklyTrend: Array<{ label: string; total: number; present: number; late: number }>;
    selectedDate: string;
}

export default function Overview({ overview, monthlyTrend, weeklyTrend, selectedDate }: OverviewProps) {
    const { t } = useLanguage();
    const page = usePage<{ auth: { user: { role: string; teacher?: { teacher_type?: string } | null } } }>();
    const user = page.props.auth?.user;

    const isAdmin = user?.role === "admin";
    const isTeacher = user?.role === "teacher";
    const isGuardian = user?.role === "guardian";
    const isStudent = user?.role === "student";

    const teacherType = user?.teacher?.teacher_type;
    const isPiket = teacherType === "piket" || teacherType === "both";
    const isWali = teacherType === "wali" || teacherType === "both";

    return (
        <AppShell title="Overview">
            <Head>
                <title>Overview - SMART Presensi</title>
            </Head>

            <div className="space-y-6">
                {/* Header with Date Selector */}
                <PageHeader title={t("overview.title")}>
                    <div className="relative">
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => window.location.href = `/overview?date=${e.target.value}`}
                            className="bg-surface border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>
                </PageHeader>

                {/* Adaptive Widgets by Role */}
                <div className="space-y-6">
                    {/* Admin & Guru Piket & Wali Kelas: KPI Cards */}
                    {(isAdmin || isTeacher) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                            <StatCard
                                label={t("overview.totalStudents")}
                                value={overview.total_students.toLocaleString("id-ID")}
                                color="blue"
                                subtitle={t("overview.schoolWide")}
                            />
                            <StatCard
                                label={t("overview.presentToday")}
                                value={overview.present.toLocaleString("id-ID")}
                                color="green"
                                subtitle={t("overview.lateCount").replace("{count}", overview.late.toString())}
                            />
                            <StatCard
                                label={t("overview.sickPermission")}
                                value={overview.sick_permission.toLocaleString("id-ID")}
                                color="amber"
                            />
                            <StatCard
                                label={t("overview.absent")}
                                value={overview.absent.toLocaleString("id-ID")}
                                color="red"
                            />
                        </div>
                    )}

                    {/* Guardian: Children Status Cards */}
                    {isGuardian && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard
                                label={t("overview.myChildren")}
                                value="2"
                                color="blue"
                                subtitle={t("overview.activeToday")}
                            />
                            <StatCard
                                label={t("overview.pendingLeaves")}
                                value="0"
                                color="amber"
                            />
                            <StatCard
                                label={t("overview.todayAttendance")}
                                value="2/2"
                                color="green"
                            />
                            <StatCard
                                label={t("overview.pendingActions")}
                                value="0"
                                color="blue"
                            />
                        </div>
                    )}

                    {/* Student: Today Status Card */}
                    {isStudent && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <StatCard
                                label={t("overview.todayStatus")}
                                value="Present"
                                color="green"
                                subtitle={t("overview.checkedInAt").replace("{time}", "07:15")}
                            />
                            <StatCard
                                label={t("overview.thisWeek")}
                                value="5/5"
                                color="blue"
                            />
                            <StatCard
                                label={t("overview.thisMonth")}
                                value="95%"
                                color="green"
                            />
                        </div>
                    )}

                    {/* Quick Actions / Links by Role */}
                    <Card>
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-text mb-4">
                                {t("overview.quickActions")}
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                {(isAdmin || isPiket) && (
                                    <>
                                        <a
                                            href="/monitoring"
                                            className="flex items-center gap-3 p-4 bg-surface border border-border rounded-xl hover:bg-background transition-colors"
                                        >
                                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                                <FiVideo className="text-primary text-xl" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-text">{t("overview.monitoring")}</p>
                                                <p className="text-sm text-text-inactive">{t("overview.monitoringDesc")}</p>
                                            </div>
                                        </a>
                                    </>
                                )}

                                {(isAdmin || isWali) && (
                                    <a
                                        href="/leave-requests"
                                        className="flex items-center gap-3 p-4 bg-surface border border-border rounded-xl hover:bg-background transition-colors"
                                    >
                                        <div className="w-10 h-10 bg-blue/10 rounded-lg flex items-center justify-center">
                                            <FiClock className="text-blue text-xl" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-text">{t("overview.leaveVerification")}</p>
                                            <p className="text-sm text-text-inactive">{t("overview.leaveVerificationDesc")}</p>
                                        </div>
                                    </a>
                                )}

                                {isTeacher && isPiket && (
                                    <a
                                        href="/teacher/duty"
                                        className="flex items-center gap-3 p-4 bg-primary/10 border border-primary/20 rounded-xl hover:bg-primary/5 transition-colors"
                                    >
                                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                            <FiList className="text-primary text-xl" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-text">{t("overview.dutyDashboard")}</p>
                                            <p className="text-sm text-text-inactive">{t("overview.dutyDashboardDesc")}</p>
                                        </div>
                                    </a>
                                )}

                                {isTeacher && isWali && (
                                    <>
                                        <a
                                            href="/teacher/homeroom"
                                            className="flex items-center gap-3 p-4 bg-primary/10 border border-primary/20 rounded-xl hover:bg-primary/5 transition-colors"
                                        >
                                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                                <FiBookOpen className="text-primary text-xl" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-text">{t("overview.homeroomDashboard")}</p>
                                                <p className="text-sm text-text-inactive">{t("overview.homeroomDashboardDesc")}</p>
                                            </div>
                                        </a>
                                        <a
                                            href="/leave-requests"
                                            className="flex items-center gap-3 p-4 bg-surface border border-border rounded-xl hover:bg-background transition-colors"
                                        >
                                            <div className="w-10 h-10 bg-amber/10 rounded-lg flex items-center justify-center">
                                                <FiCheckCircle className="text-amber text-xl" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-text">{t("overview.leaveVerification")}</p>
                                                <p className="text-sm text-text-inactive">{t("overview.leaveVerificationDesc")}</p>
                                            </div>
                                        </a>
                                        <a
                                            href="/reports/daily"
                                            className="flex items-center gap-3 p-4 bg-surface border border-border rounded-xl hover:bg-background transition-colors"
                                        >
                                            <div className="w-10 h-10 bg-blue/10 rounded-lg flex items-center justify-center">
                                                <FiFile className="text-blue text-xl" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-text">{t("overview.dailyReport")}</p>
                                                <p className="text-sm text-text-inactive">{t("overview.dailyReportDesc")}</p>
                                            </div>
                                        </a>
                                        <a
                                            href="/reports/monthly"
                                            className="flex items-center gap-3 p-4 bg-surface border border-border rounded-xl hover:bg-background transition-colors"
                                        >
                                            <div className="w-10 h-10 bg-green/10 rounded-lg flex items-center justify-center">
                                                <FiFile className="text-green text-xl" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-text">{t("overview.monthlyReport")}</p>
                                                <p className="text-sm text-text-inactive">{t("overview.monthlyReportDesc")}</p>
                                            </div>
                                        </a>
                                    </>
                                )}

                                {isGuardian && (
                                    <>
                                        <a
                                            href="/guardian/leave-application"
                                            className="flex items-center gap-3 p-4 bg-primary/10 border border-primary/20 rounded-xl hover:bg-primary/5 transition-colors"
                                        >
                                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                                <FiSend className="text-primary text-xl" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-text">{t("overview.leaveApplication")}</p>
                                                <p className="text-sm text-text-inactive">{t("overview.leaveApplicationDesc")}</p>
                                            </div>
                                        </a>
                                        <a
                                            href="/guardian/history"
                                            className="flex items-center gap-3 p-4 bg-surface border border-border rounded-xl hover:bg-background transition-colors"
                                        >
                                            <div className="w-10 h-10 bg-blue/10 rounded-lg flex items-center justify-center">
                                                <FiClock className="text-blue text-xl" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-text">{t("overview.history")}</p>
                                                <p className="text-sm text-text-inactive">{t("overview.historyDesc")}</p>
                                            </div>
                                        </a>
                                    </>
                                )}

                                {isStudent && (
                                    <>
                                        <a
                                            href="/student/attendance"
                                            className="flex items-center gap-3 p-4 bg-primary/10 border border-primary/20 rounded-xl hover:bg-primary/5 transition-colors"
                                        >
                                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                                <FiCamera className="text-primary text-xl" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-text">{t("overview.attendance")}</p>
                                                <p className="text-sm text-text-inactive">{t("overview.attendanceDesc")}</p>
                                            </div>
                                        </a>
                                        <a
                                            href="/student/history"
                                            className="flex items-center gap-3 p-4 bg-surface border border-border rounded-xl hover:bg-background transition-colors"
                                        >
                                            <div className="w-10 h-10 bg-blue/10 rounded-lg flex items-center justify-center">
                                                <FiClock className="text-blue text-xl" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-text">{t("overview.history")}</p>
                                                <p className="text-sm text-text-inactive">{t("overview.historyDesc")}</p>
                                            </div>
                                        </a>
                                    </>
                                )}

                                {/* Profile - all roles */}
                                <a
                                    href="/profile"
                                    className="flex items-center gap-3 p-4 bg-surface border border-border rounded-xl hover:bg-background transition-colors"
                                >
                                    <div className="w-10 h-10 bg-surface border border-border rounded-lg flex items-center justify-center">
                                        <FiHome className="text-text-primary text-xl" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-text">{t("overview.profile")}</p>
                                        <p className="text-sm text-text-inactive">{t("overview.profileDesc")}</p>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </Card>

                    {/* Charts - Admin & Guru Piket & Wali Kelas */}
                    {(isAdmin || isTeacher) && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <div className="p-6">
                                    <h3 className="text-lg font-semibold text-text mb-4">
                                        {t("overview.monthlyTrend")}
                                    </h3>
                                    <AttendanceChart
                                        data={monthlyTrend.months}
                                        type="bar"
                                        height={300}
                                    />
                                </div>
                            </Card>

                            <Card>
                                <div className="p-6">
                                    <h3 className="text-lg font-semibold text-text mb-4">
                                        {t("overview.weeklyTrend")}
                                    </h3>
                                    <AttendanceChart
                                        data={weeklyTrend}
                                        type="line"
                                        height={300}
                                    />
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* Class Breakdown - Admin only */}
                    {isAdmin && (
                        <Card>
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-text mb-4">
                                    {t("overview.classBreakdown")}
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="text-left text-text-inactive text-sm border-b border-border">
                                                <th className="pb-3 font-medium">{t("overview.class")}</th>
                                                <th className="pb-3 font-medium text-center">{t("overview.total")}</th>
                                                <th className="pb-3 font-medium text-center">{t("overview.present")}</th>
                                                <th className="pb-3 font-medium text-center">{t("overview.late")}</th>
                                                <th className="pb-3 font-medium text-center">{t("overview.absent")}</th>
                                                <th className="pb-3 font-medium text-center">{t("overview.rate")}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {overview.classes.map((cls) => {
                                                const rate = cls.total > 0
                                                    ? ((cls.present + cls.late) / cls.total * 100).toFixed(1)
                                                    : "0.0";
                                                return (
                                                    <tr key={cls.id} className="border-b border-border/50 hover:bg-primary/5">
                                                        <td className="py-3 font-medium">{cls.name}</td>
                                                        <td className="py-3 text-center text-text-inactive">{cls.total}</td>
                                                        <td className="py-3 text-center text-green-600">{cls.present}</td>
                                                        <td className="py-3 text-center text-amber-600">{cls.late}</td>
                                                        <td className="py-3 text-center text-red-600">
                                                            {cls.total - cls.present - cls.late}
                                                        </td>
                                                        <td className="py-3 text-center font-medium">
                                                            {rate}%
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </AppShell>
    );
}