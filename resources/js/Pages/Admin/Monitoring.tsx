import { router } from "@inertiajs/react";
import { useEffect, useRef, useState } from "react";
import { FiBarChart2, FiFilter, FiSearch } from "react-icons/fi";
import { BottomSheet, Button, Card, Input, PageHeader, SelectInput, StatCard, StatusBadge, Table } from "@/Components";
import EmptyState from "@/Components/common/EmptyState";
import { useLanguage } from "@/Contexts/LanguageContext";
import type { Column } from "@/Components/ui/Table";
import AppShell from "@/Layouts/AppShell";

// ─── Types ───

interface SchoolClass {
    id: number;
    name: string;
    teacher: { id: number; name: string } | null;
}

interface Stats {
    total: number;
    present: number;
    late: number;
    absent: number;
    sick_permission: number;
}

interface AttendanceStudent {
    student: {
        id: number;
        nisn: string;
        name: string;
        user: { id: number; name: string } | null;
        class: { id: number; name: string } | null;
    };
    attendance: {
        id: number;
        check_in_time: string;
        status: string;
        latitude: string;
        longitude: string;
        photo_url: string;
    } | null;
    status: string;
}

interface MonitoringProps {
    classes: SchoolClass[];
    selectedClassId: number | null;
    stats: Stats | null;
    students: AttendanceStudent[];
}

// ─── Page ───

export default function Monitoring({
    classes,
    selectedClassId,
    stats: initialStats,
    students: initialStudents,
}: MonitoringProps) {
    const { t } = useLanguage();
    const [classId, setClassId] = useState<string>(selectedClassId?.toString() ?? "");
    const [studentsState, setStudentsState] = useState(initialStudents);
    const [statsState, setStatsState] = useState(initialStats);

    // Keep studentsState and statsState in sync when Inertia reloads props
    useEffect(() => {
        setStudentsState(initialStudents);
    }, [initialStudents]);

    useEffect(() => {
        setStatsState(initialStats);
    }, [initialStats]);

    // Use a ref to always access latest studentsState in Echo callback without stale closure
    const studentsRef = useRef(studentsState);
    useEffect(() => {
        studentsRef.current = studentsState;
    }, [studentsState]);

    // Real-time monitoring with Laravel Echo
    useEffect(() => {
        if (typeof window !== "undefined" && window.Echo && classId) {
            window.Echo.channel(`monitoring.${classId}`).listen(
                ".attendance.created",
                (data: {
                    student_id: number;
                    student_name: string;
                    status: string;
                    check_in_time: string;
                    id: number;
                    latitude: string;
                    longitude: string;
                }) => {
                    const currentStudents = studentsRef.current;
                    const existingStudent = currentStudents.find((s) => s.student.id === data.student_id);
                    const oldStatus = existingStudent?.status;

                    setStudentsState((prev) =>
                        prev.map((s) =>
                            s.student.id === data.student_id
                                ? {
                                      ...s,
                                      attendance: {
                                          id: data.id,
                                          check_in_time: data.check_in_time,
                                          status: data.status,
                                          latitude: data.latitude,
                                          longitude: data.longitude,
                                          photo_url: s.attendance?.photo_url ?? "",
                                      },
                                      status: data.status,
                                  }
                                : s,
                        ),
                    );

                    setStatsState((prev) => {
                        if (!prev) return prev;
                        const counts = { ...prev };

                        const normalizeStatusKey = (st: string): keyof Stats | null => {
                            const lower = st.toLowerCase();
                            if (lower === "permission" || lower === "sick") return "sick_permission";
                            if (lower === "present" || lower === "late" || lower === "absent")
                                return lower as keyof Stats;
                            return null;
                        };

                        if (oldStatus) {
                            const oldKey = normalizeStatusKey(oldStatus);
                            if (oldKey && counts[oldKey] > 0) {
                                counts[oldKey]--;
                            }
                        }

                        const newKey = normalizeStatusKey(data.status);
                        if (newKey && typeof counts[newKey] === "number") {
                            counts[newKey]++;
                        }

                        return counts;
                    });
                },
            );
        }
        return () => {
            if (typeof window !== "undefined" && window.Echo && classId) {
                window.Echo.leaveChannel(`monitoring.${classId}`);
            }
        };
    }, [classId]);

    const handleFilter = () => {
        router.get("/monitoring", { class_id: classId || undefined }, { preserveState: true });
    };

    const columns: Column<AttendanceStudent>[] = [
        { key: "nisn", header: t("monitoring.colNisn"), render: (s) => s.student.nisn },
        { key: "name", header: t("monitoring.colName"), render: (s) => s.student.name },
        {
            key: "class",
            header: t("monitoring.colClass"),
            render: (s) => s.student.class?.name ?? "-",
        },
        {
            key: "status",
            header: t("monitoring.colStatus"),
            render: (s) => <StatusBadge variant={s.status} />,
        },
        {
            key: "time",
            header: t("monitoring.colTime"),
            render: (s) => (s.attendance?.check_in_time ? `${s.attendance.check_in_time} WIB` : "-"),
        },
    ];

    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const hasActiveFilters = Boolean(classId);

    const mobileHeaderActions = (
        <div className="flex items-center gap-2 sm:hidden font-inter">
            <button
                type="button"
                onClick={() => setIsMobileFilterOpen(true)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                    hasActiveFilters ? "bg-primary text-white" : "bg-muted/60 text-text-primary hover:bg-muted"
                }`}
                title={t("monitoring.filterTitle")}
                aria-label={t("monitoring.filterTitle")}
            >
                <FiFilter className="text-[14px]" />
            </button>
        </div>
    );

    const today = new Date().toISOString().split("T")[0];

    return (
        <AppShell title={t("monitoring.title")} hasTopCard={true} headerActions={mobileHeaderActions}>
            <PageHeader
                title={t("monitoring.pageTitle")}
                description={t("monitoring.pageDesc")}
                className="hidden lg:flex shrink-0 mb-4"
            />
            {/* Filter Section (Desktop & Tablet) */}
            <Card className="mb-6 hidden sm:block">
                <Card.Body className="p-4 lg:p-5 flex flex-col sm:flex-row flex-wrap gap-4 items-stretch sm:items-end">
                    <SelectInput
                        label={t("monitoring.filterClass")}
                        value={classId}
                        onChange={(val) => {
                            const newId = String(val);
                            setClassId(newId);
                            router.get("/monitoring", { class_id: newId || undefined }, { preserveState: true });
                        }}
                        options={[
                            { label: t("monitoring.selectClassPlaceholder"), value: "" },
                            ...classes.map((c) => ({
                                label: `${c.name} ${c.teacher ? `(${c.teacher.name})` : ""}`,
                                value: c.id.toString(),
                            })),
                        ]}
                        className="w-full sm:w-[280px]"
                    />
                </Card.Body>
            </Card>

            {/* Stats Cards */}
            {statsState && (
                <section className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
                    <StatCard label={t("monitoring.studentCount")} value={statsState.total} color="grey" />
                    <StatCard label={t("monitoring.present")} value={statsState.present} color="green" />
                    <StatCard label={t("monitoring.late")} value={statsState.late} color="amber" />
                    <StatCard label={t("monitoring.sickPermission")} value={statsState.sick_permission} color="blue" />
                    <StatCard label={t("monitoring.absent")} value={statsState.absent} color="red" />
                </section>
            )}

            {/* Students Table */}
            {selectedClassId && (
                <section>
                    <h2 className="text-[16px] font-bold text-text-primary font-inter mb-4">
                        {t("monitoring.listTitle")}
                    </h2>
                    <Table
                        columns={columns}
                        data={studentsState}
                        keyExtractor={(s) => s.student.id}
                        emptyMessage={t("monitoring.emptyClassData")}
                    />
                </section>
            )}

            {!selectedClassId && (
                <Card className="p-8">
                    <EmptyState
                        variant="no-data"
                        icon={<FiBarChart2 className="text-4xl text-text-inactive" />}
                        title={t("monitoring.noClassTitle")}
                        description={t("monitoring.noClassDesc")}
                        className="py-4"
                    />
                </Card>
            )}

            {/* 📱 MOBILE FILTER BOTTOM SHEET */}
            <BottomSheet
                open={isMobileFilterOpen}
                onClose={() => setIsMobileFilterOpen(false)}
                title={t("monitoring.filterTitle")}
                subtitle={t("monitoring.filterSubtitle")}
            >
                <div className="flex flex-col gap-4 font-inter pb-2">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[12px] font-bold text-text-secondary">{t("monitoring.filterClass")}</label>
                        <SelectInput
                            value={classId}
                            onChange={(val) => setClassId(String(val))}
                            options={[
                                { label: t("monitoring.selectClassPlaceholder"), value: "" },
                                ...classes.map((c) => ({
                                    label: `${c.name} ${c.teacher ? `(${c.teacher.name})` : ""}`,
                                    value: c.id.toString(),
                                })),
                            ]}
                            className="h-10 text-[13px]"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[12px] font-bold text-text-secondary">{t("monitoring.labelDate")}</label>
                        <Input type="date" defaultValue={today} className="h-10 text-[13px]" />
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        {hasActiveFilters && (
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setClassId("");
                                    router.get("/monitoring", {}, { preserveState: true });
                                    setIsMobileFilterOpen(false);
                                }}
                                className="flex-1 h-10 text-[13px] font-bold rounded-xl"
                            >
                                {t("monitoring.resetFilter")}
                            </Button>
                        )}
                        <Button
                            variant="primary"
                            onClick={() => {
                                handleFilter();
                                setIsMobileFilterOpen(false);
                            }}
                            className="flex-1 h-10 text-[13px] font-bold rounded-xl"
                        >
                            {t("monitoring.show")}
                        </Button>
                    </div>
                </div>
            </BottomSheet>
        </AppShell>
    );
}
