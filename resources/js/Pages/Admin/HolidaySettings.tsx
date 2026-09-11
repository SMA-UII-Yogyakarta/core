import { router, useForm } from "@inertiajs/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { FiCalendar, FiCheck, FiClock, FiFilter, FiPlus, FiTrash2 } from "react-icons/fi";
import {
    BottomSheet,
    Button,
    Card,
    ConfirmDialog,
    Drawer,
    EmptyState,
    FilterPopover,
    Input,
    MobileNativePagination,
    NativeSelect,
    PageHeader,
    Table,
    TableFooter,
    TabSwitcher,
    Toggle,
} from "@/Components";
import type { Column } from "@/Components/ui/Table";
import AppShell from "@/Layouts/AppShell";
import { holidaySchema } from "@/schemas";
import type { PaginatedData } from "@/types";
import { INDONESIAN_MONTHS } from "@/utils/helpers";
import { validateForm } from "@/utils/zodHelper";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TimeSetting {
    id: number;
    day: string;
    check_in_open: string;
    late_threshold: string;
    check_in_close: string;
    is_active?: boolean;
}

interface Holiday {
    id: number;
    holiday_date: string;
    description: string | null;
    is_holiday: boolean;
}

interface Filters {
    year?: string;
    month?: string;
}

interface AturWaktuLiburProps {
    timeSettings: TimeSetting[];
    holidays: PaginatedData<Holiday>;
    filters: Filters;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const dayNames: Record<string, string> = {
    Monday: "Senin",
    Tuesday: "Selasa",
    Wednesday: "Rabu",
    Thursday: "Kamis",
    Friday: "Jumat",
    Saturday: "Sabtu",
    Sunday: "Minggu",
};

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function formatIndonesianDate(dateStr: string): string {
    if (!dateStr) return "";
    try {
        const cleanDateStr = dateStr.split(" ")[0].split("T")[0];
        const date = new Date(cleanDateStr + "T00:00:00");

        if (isNaN(date.getTime())) {
            const fallbackDate = new Date(dateStr);
            if (isNaN(fallbackDate.getTime())) return dateStr;
            return fallbackDate.toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
            });
        }

        return date.toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    } catch {
        return dateStr;
    }
}

export default function HolidaySettings({ timeSettings, holidays, filters }: AturWaktuLiburProps) {
    const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const [activeSettingTab, setActiveSettingTab] = useState<"time" | "holiday">(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const tab = params.get("tab");
            if (tab === "time" || tab === "holiday") return tab;
        }
        return "time";
    });

    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const [isDesktopFilterOpen, setIsDesktopFilterOpen] = useState(false);

    const handleTabChange = (key: "time" | "holiday") => {
        setActiveSettingTab(key);
        if (typeof window !== "undefined") {
            const url = new URL(window.location.href);
            url.searchParams.set("tab", key);
            window.history.replaceState({ tab: key }, "", url.toString());
        }
    };

    useEffect(() => {
        const handlePopState = () => {
            if (typeof window !== "undefined") {
                const params = new URLSearchParams(window.location.search);
                const tab = params.get("tab");
                if (tab === "time" || tab === "holiday") {
                    setActiveSettingTab(tab);
                }
            }
        };
        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, []);

    const normalizeTime = (value?: string | null, fallback = "06:30") => {
        if (!value) return fallback;
        return value.length >= 5 ? value.slice(0, 5) : value;
    };

    const [form, setForm] = useState<
        Record<
            string,
            {
                check_in_open: string;
                late_threshold: string;
                check_in_close: string;
                is_active: boolean;
            }
        >
    >(() => {
        const initial: Record<
            string,
            {
                check_in_open: string;
                late_threshold: string;
                check_in_close: string;
                is_active: boolean;
            }
        > = {};
        for (const day of daysOfWeek) {
            const existing = timeSettings.find((ts) => ts.day === day);
            const isSaturday = day === "Saturday";
            initial[day] = {
                check_in_open: normalizeTime(existing?.check_in_open, isSaturday ? "07:00" : "06:30"),
                late_threshold: normalizeTime(existing?.late_threshold, isSaturday ? "07:30" : "07:00"),
                check_in_close: normalizeTime(existing?.check_in_close, isSaturday ? "08:00" : "07:30"),
                is_active: existing?.is_active !== undefined ? Boolean(existing.is_active) : isSaturday ? false : true,
            };
        }
        return initial;
    });

    const [showAddDrawer, setShowAddDrawer] = useState(false);

    const {
        data: holidayForm,
        setData: setHolidayForm,
        post: postHoliday,
        processing: holidayProcessing,
        errors: holidayErrors,
        setError: setHolidayError,
        clearErrors: clearHolidayErrors,
        reset: resetHoliday,
    } = useForm({
        holiday_date: "",
        description: "",
        is_holiday: true,
    });

    const [deleteHolidayConfirm, setDeleteHolidayConfirm] = useState<{
        open: boolean;
        id: number | null;
        name: string;
    }>({
        open: false,
        id: null,
        name: "",
    });

    // ── Auto-Save Mechanism for Operating Time Settings ───────────────────────
    const triggerAutoSave = (updatedForm: typeof form) => {
        setSaveStatus("saving");
        const settings = daysOfWeek.map((day) => ({
            day,
            check_in_open: updatedForm[day].check_in_open,
            late_threshold: updatedForm[day].late_threshold,
            check_in_close: updatedForm[day].check_in_close,
            is_active: updatedForm[day].is_active,
        }));

        router.post(
            "/operational-settings/time-settings",
            { settings },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    setSaveStatus("saved");
                    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
                    saveTimeoutRef.current = setTimeout(() => {
                        setSaveStatus("idle");
                    }, 2500);
                },
                onError: () => {
                    setSaveStatus("idle");
                },
            },
        );
    };

    const handleOpenAddDrawer = () => {
        resetHoliday();
        clearHolidayErrors();
        setShowAddDrawer(true);
    };

    const handleCloseAddDrawer = () => {
        resetHoliday();
        clearHolidayErrors();
        setShowAddDrawer(false);
    };

    const handleAddHoliday = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        clearHolidayErrors();

        const valid = validateForm(holidaySchema, holidayForm);
        if (!valid.success) {
            Object.entries(valid.errors).forEach(([field, msg]) => {
                setHolidayError(field as keyof typeof holidayForm, msg);
            });
            return;
        }

        postHoliday("/operational-settings/holidays", {
            preserveState: true,
            onSuccess: () => {
                handleCloseAddDrawer();
            },
        });
    };

    const handleDeleteHoliday = (id: number, name: string) => {
        setDeleteHolidayConfirm({ open: true, id, name });
    };

    const confirmDeleteHoliday = () => {
        if (deleteHolidayConfirm.id === null) return;
        router.delete(`/operational-settings/holidays/${deleteHolidayConfirm.id}`, {
            preserveState: true,
            onSuccess: () => {
                setDeleteHolidayConfirm({ open: false, id: null, name: "" });
            },
        });
    };

    const handleTimeChange = (
        day: string,
        field: "check_in_open" | "late_threshold" | "check_in_close",
        value: string,
    ) => {
        setForm((prev) => ({
            ...prev,
            [day]: { ...prev[day], [field]: value },
        }));
    };

    const handleTimeBlur = () => {
        triggerAutoSave(form);
    };

    const handleDayToggle = (day: string, isActive: boolean) => {
        const next = {
            ...form,
            [day]: { ...form[day], is_active: isActive },
        };
        setForm(next);
        triggerAutoSave(next);
    };

    const currentYear = new Date().getFullYear();
    const months = useMemo(() => INDONESIAN_MONTHS.map((label, idx) => ({ value: (idx + 1).toString(), label })), []);

    const timeColumns: Column<string>[] = [
        {
            key: "day",
            header: "Hari",
            className: "whitespace-nowrap font-inter font-bold text-text-primary w-36",
            render: (day) => (
                <div className="flex items-center gap-2">
                    <span
                        className={`w-2 h-2 rounded-full ${form[day].is_active ? "bg-primary" : "bg-text-muted/40"}`}
                    />
                    <span className="text-[13px]">{dayNames[day] ?? day}</span>
                </div>
            ),
        },
        {
            key: "is_active",
            header: "Status",
            className: "text-center whitespace-nowrap w-24",
            render: (day) => (
                <Toggle
                    checked={form[day].is_active}
                    onChange={(e) => handleDayToggle(day, e.target.checked)}
                    aria-label={`Buka presensi ${dayNames[day] ?? day}`}
                />
            ),
        },
        {
            key: "check_in_open",
            header: "Buka Pintu",
            className: "whitespace-nowrap text-center w-36",
            render: (day) => (
                <div className="relative max-w-[110px] w-full mx-auto">
                    <Input
                        type="time"
                        value={form[day].check_in_open}
                        disabled={!form[day].is_active}
                        onChange={(e) => handleTimeChange(day, "check_in_open", e.target.value)}
                        onBlur={handleTimeBlur}
                        inputClassName="!h-8 !text-[12px] !font-bold text-center !px-1.5 font-inter rounded-lg"
                    />
                </div>
            ),
        },
        {
            key: "late_threshold",
            header: "Batas Terlambat",
            className: "whitespace-nowrap text-center w-36",
            render: (day) => (
                <div className="relative max-w-[110px] w-full mx-auto">
                    <Input
                        type="time"
                        value={form[day].late_threshold}
                        disabled={!form[day].is_active}
                        onChange={(e) => handleTimeChange(day, "late_threshold", e.target.value)}
                        onBlur={handleTimeBlur}
                        inputClassName="!h-8 !text-[12px] !font-bold !text-amber-700 !border-amber-300 !bg-amber-50/60 text-center !px-1.5 font-inter rounded-lg"
                        style={
                            form[day].is_active
                                ? {
                                      color: "var(--color-warning)",
                                      borderColor: "var(--color-warning-light)",
                                      backgroundColor: "var(--color-warning-bg)",
                                  }
                                : undefined
                        }
                    />
                </div>
            ),
        },
        {
            key: "check_in_close",
            header: "Tutup Presensi",
            className: "whitespace-nowrap text-center w-36",
            render: (day) => (
                <div className="relative max-w-[110px] w-full mx-auto">
                    <Input
                        type="time"
                        value={form[day].check_in_close}
                        disabled={!form[day].is_active}
                        onChange={(e) => handleTimeChange(day, "check_in_close", e.target.value)}
                        onBlur={handleTimeBlur}
                        inputClassName="!h-8 !text-[12px] !font-bold !text-red-700 !border-red-300 !bg-red-50/60 text-center !px-1.5 font-inter rounded-lg"
                        style={
                            form[day].is_active
                                ? {
                                      color: "var(--color-danger)",
                                      borderColor: "var(--color-danger-light)",
                                      backgroundColor: "var(--color-danger-bg)",
                                  }
                                : undefined
                        }
                    />
                </div>
            ),
        },
    ];

    // ── Header Actions (Only shown on Libur Akademik Tab on Mobile) ───────────
    const hasActiveFilters = Boolean(filters.month) || Boolean(filters.year && filters.year !== String(currentYear));

    const mobileHeaderActions =
        activeSettingTab === "holiday" ? (
            <div className="flex items-center gap-2 sm:hidden font-inter">
                <button
                    type="button"
                    onClick={() => setIsMobileFilterOpen(true)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                        hasActiveFilters ? "bg-primary text-white" : "bg-muted/60 text-text-primary hover:bg-muted"
                    }`}
                    title="Filter Libur Akademik"
                    aria-label="Filter Libur Akademik"
                >
                    <FiFilter className="text-[14px]" />
                </button>
                <button
                    type="button"
                    onClick={handleOpenAddDrawer}
                    className="w-8 h-8 rounded-full bg-accent text-primary flex items-center justify-center hover:brightness-95 active:scale-95 transition-all cursor-pointer shadow-xs"
                    title="Tambah Libur"
                    aria-label="Tambah Libur"
                >
                    <FiPlus className="text-[15px]" />
                </button>
            </div>
        ) : undefined;

    // ── Tab Definition ───────────────────────────────────────────────────────
    const holidaySettingTabs = useMemo(
        () => [
            { key: "time", label: "Jam Operasional", icon: <FiClock className="text-[13px]" /> },
            { key: "holiday", label: "Libur Akademik", icon: <FiCalendar className="text-[13px]" /> },
        ],
        [],
    );

    return (
        <AppShell
            title="Pengaturan Presensi & Libur"
            hasTopTabs={true}
            showSearch={false}
            headerActions={mobileHeaderActions}
            showNotificationBell={true}
            showNotificationBellOnMobile={activeSettingTab !== "holiday"}
        >
            {/* Desktop PageHeader (hidden on mobile & tablet, only visible on lg+) */}
            <PageHeader
                title="Atur Jam Operasional & Libur Akademik"
                description="Kelola jadwal jam presensi harian siswa dan daftar kalender libur sekolah SMA UII Yogyakarta."
                className="hidden lg:flex shrink-0 mb-4"
            />

            {/* ── MOBILE TAB ROW (< sm) ─────────────────────────────── */}
            <div className="sm:hidden flex flex-col gap-2.5 mb-3 font-inter">
                {/* Full-width Tab Switcher */}
                <TabSwitcher
                    tabs={holidaySettingTabs}
                    activeKey={activeSettingTab}
                    onChange={(key) => handleTabChange(key as "time" | "holiday")}
                    variant="segmented"
                    fullWidth
                />
            </div>

            {/* ── TABLET & DESKTOP TOOLBAR (>= sm) ─────────────────────────── */}
            <div className="hidden sm:flex flex-row items-center justify-between gap-3 mb-4 shrink-0 font-inter w-full">
                {/* Left Side: Tab Switcher (Visible on tablet & desktop in page body) */}
                <div className="flex items-center gap-3 min-w-0">
                    <div className="min-w-0 overflow-x-auto no-scrollbar">
                        <TabSwitcher
                            tabs={holidaySettingTabs}
                            activeKey={activeSettingTab}
                            onChange={(key) => handleTabChange(key as "time" | "holiday")}
                            variant="segmented"
                        />
                    </div>
                </div>

                {/* Right Side (Pojok Kanan): Yellow Filter Popover + Action Button */}
                <div className="flex items-center gap-2.5 shrink-0 ml-auto min-w-0">
                    {activeSettingTab === "holiday" && (
                        <FilterPopover
                            open={isDesktopFilterOpen}
                            onClose={() => setIsDesktopFilterOpen(false)}
                            align="right"
                            trigger={
                                <Button
                                    variant="accent"
                                    size="sm"
                                    onClick={() => setIsDesktopFilterOpen((prev) => !prev)}
                                    icon={<FiFilter className="text-[13px]" />}
                                    className="h-10 px-4 text-[13px] font-bold rounded-xl shrink-0 whitespace-nowrap"
                                >
                                    Filter
                                    {filters.month || (filters.year && filters.year !== String(currentYear))
                                        ? " (Aktif)"
                                        : ""}
                                </Button>
                            }
                        >
                            <div className="flex flex-col gap-3 font-inter min-w-[220px]">
                                <div className="flex items-center justify-between border-b border-border pb-2">
                                    <h4 className="text-[13.5px] font-bold text-text-primary">Filter Libur Akademik</h4>
                                    {(Boolean(filters.month) ||
                                        Boolean(filters.year && filters.year !== String(currentYear))) && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                router.get(
                                                    "/operational-settings",
                                                    { tab: "holiday", year: String(currentYear), month: "" },
                                                    { preserveState: true },
                                                );
                                                setIsDesktopFilterOpen(false);
                                            }}
                                            className="text-[11.5px] font-semibold text-danger hover:underline cursor-pointer"
                                        >
                                            Reset Filter
                                        </button>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-[12px] font-bold text-text-secondary mb-1">
                                        Bulan Libur
                                    </label>
                                    <NativeSelect
                                        value={filters.month ?? ""}
                                        onChange={(e) =>
                                            router.get(
                                                "/operational-settings",
                                                { tab: "holiday", year: filters.year, month: e.target.value },
                                                { preserveState: true },
                                            )
                                        }
                                        className="h-9 text-[12.5px] rounded-xl w-full"
                                    >
                                        <option value="">Semua Bulan</option>
                                        {months.map((m) => (
                                            <option key={m.value} value={m.value}>
                                                {m.label}
                                            </option>
                                        ))}
                                    </NativeSelect>
                                </div>

                                <div>
                                    <label className="block text-[12px] font-bold text-text-secondary mb-1">
                                        Tahun Akademik
                                    </label>
                                    <NativeSelect
                                        value={filters.year ?? String(currentYear)}
                                        onChange={(e) =>
                                            router.get(
                                                "/operational-settings",
                                                { tab: "holiday", year: e.target.value, month: filters.month },
                                                { preserveState: true },
                                            )
                                        }
                                        className="h-9 text-[12.5px] rounded-xl w-full"
                                    >
                                        <option value={String(currentYear - 1)}>{currentYear - 1}</option>
                                        <option value={String(currentYear)}>{currentYear}</option>
                                        <option value={String(currentYear + 1)}>{currentYear + 1}</option>
                                    </NativeSelect>
                                </div>
                            </div>
                        </FilterPopover>
                    )}

                    {/* Action Button: + Tambah Libur */}
                    {activeSettingTab === "holiday" && (
                        <Button
                            variant="primary"
                            size="md"
                            icon={<FiPlus className="text-[14px]" />}
                            onClick={handleOpenAddDrawer}
                            className="h-10 px-4 font-bold text-[13px] shadow-xs shrink-0"
                        >
                            Tambah Libur
                        </Button>
                    )}
                </div>
            </div>

            {/* ── MOBILE NATIVE CARD STACK (< sm) ─────────────────────────────── */}
            <div className="sm:hidden flex flex-col font-inter">
                {/* 1. Mobile Time Settings Card Stack */}
                {activeSettingTab === "time" && (
                    <div className="flex flex-col gap-2.5">
                        {/* Auto-save Status Strip */}
                        <div className="flex items-center justify-between px-1 text-[11.5px]">
                            <span className="text-text-muted">7 Hari Operasional</span>
                            {saveStatus === "saving" ? (
                                <span className="text-primary font-bold flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                    Menyimpan...
                                </span>
                            ) : saveStatus === "saved" ? (
                                <span className="text-emerald-600 font-bold flex items-center gap-1">
                                    <FiCheck className="text-[12px]" />
                                    Tersimpan
                                </span>
                            ) : (
                                <span className="text-text-muted/80 flex items-center gap-1">
                                    <FiCheck className="text-[11px] text-emerald-600" />
                                    Auto-save aktif
                                </span>
                            )}
                        </div>

                        {daysOfWeek.map((day) => {
                            const isActive = form[day].is_active;
                            return (
                                <div
                                    key={day}
                                    className="p-4 rounded-2xl border border-border bg-surface shadow-xs transition-all flex flex-col gap-3"
                                >
                                    {/* Header: Day Name + Toggle */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <span
                                                className={`w-2.5 h-2.5 rounded-full ${
                                                    isActive ? "bg-primary" : "bg-slate-300"
                                                }`}
                                            />
                                            <span
                                                className={`text-[14.5px] ${isActive ? "font-bold text-text-primary" : "font-semibold text-text-primary/70"}`}
                                            >
                                                {dayNames[day] ?? day}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`text-[11px] ${isActive ? "font-bold text-emerald-600" : "font-semibold text-text-muted"}`}
                                            >
                                                {isActive ? "Buka" : "Tutup"}
                                            </span>
                                            <Toggle
                                                checked={isActive}
                                                onChange={(e) => handleDayToggle(day, e.target.checked)}
                                                aria-label={`Buka presensi ${dayNames[day] ?? day}`}
                                            />
                                        </div>
                                    </div>

                                    {/* Body: 3 Time Fields in 3-Columns Grid */}
                                    {isActive ? (
                                        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/60">
                                            <div className="flex flex-col gap-1 min-w-0">
                                                <label className="text-[10.5px] font-extrabold text-text-muted uppercase tracking-wider text-center">
                                                    Mulai
                                                </label>
                                                <Input
                                                    type="time"
                                                    value={form[day].check_in_open}
                                                    onChange={(e) =>
                                                        handleTimeChange(day, "check_in_open", e.target.value)
                                                    }
                                                    onBlur={handleTimeBlur}
                                                    inputClassName="!h-10 text-[12.5px] font-bold text-center !px-1.5 !py-0 bg-surface border-border/80 rounded-xl font-inter flex items-center justify-center tracking-tight"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1 min-w-0">
                                                <label className="text-[10.5px] font-extrabold text-amber-700 uppercase tracking-wider text-center">
                                                    Terlambat
                                                </label>
                                                <Input
                                                    type="time"
                                                    value={form[day].late_threshold}
                                                    onChange={(e) =>
                                                        handleTimeChange(day, "late_threshold", e.target.value)
                                                    }
                                                    onBlur={handleTimeBlur}
                                                    inputClassName="!h-10 text-[12.5px] font-bold text-center !px-1.5 !py-0 !text-amber-700 !border-amber-300/80 !bg-amber-50/60 rounded-xl font-inter flex items-center justify-center tracking-tight"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1 min-w-0">
                                                <label className="text-[10.5px] font-extrabold text-red-700 uppercase tracking-wider text-center">
                                                    Tutup
                                                </label>
                                                <Input
                                                    type="time"
                                                    value={form[day].check_in_close}
                                                    onChange={(e) =>
                                                        handleTimeChange(day, "check_in_close", e.target.value)
                                                    }
                                                    onBlur={handleTimeBlur}
                                                    inputClassName="!h-10 text-[12.5px] font-bold text-center !px-1.5 !py-0 !text-red-700 !border-red-300/80 !bg-red-50/60 rounded-xl font-inter flex items-center justify-center tracking-tight"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="py-2.5 px-3 text-center text-[12px] font-medium text-slate-500 bg-slate-50/90 rounded-xl border border-dashed border-slate-200">
                                            Presensi libur / nonaktif
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* 2. Mobile Holiday List Card Stack */}
                {activeSettingTab === "holiday" && (
                    <div className="flex flex-col gap-3">
                        {holidays.data.length === 0 ? (
                            <div className="w-full py-16 px-4 flex flex-col items-center justify-center text-center bg-surface rounded-2xl border border-dashed border-border my-auto">
                                <FiCalendar className="w-12 h-12 text-text-muted mb-3 opacity-60" />
                                <p className="font-bold text-text-primary text-[15px]">Belum Ada Hari Libur</p>
                                <p className="text-[12px] text-text-muted mt-1 max-w-xs">
                                    Tidak ada jadwal libur yang terdaftar pada bulan atau tahun yang dipilih.
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2.5">
                                {holidays.data.map((h) => (
                                    <div
                                        key={h.id}
                                        className="p-4 rounded-2xl border border-border bg-surface shadow-xs flex items-center justify-between gap-3"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <h4 className="text-[14px] font-bold text-text-primary truncate">
                                                {h.description ?? "Hari Libur"}
                                            </h4>
                                            <div className="flex items-center gap-1.5 text-[12px] text-text-secondary mt-1">
                                                <FiCalendar className="text-primary text-[12px] shrink-0" />
                                                <span className="truncate">{formatIndonesianDate(h.holiday_date)}</span>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteHoliday(h.id, h.description ?? "Hari Libur")}
                                            className="w-8 h-8 rounded-xl bg-danger-bg text-danger border border-danger/20 flex items-center justify-center hover:bg-danger hover:text-white transition-colors shrink-0 cursor-pointer"
                                            aria-label="Hapus hari libur"
                                            title="Hapus hari libur"
                                        >
                                            <FiTrash2 className="text-[13px]" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Mobile Pagination */}
                        {holidays.total > holidays.per_page && (
                            <div className="pt-2 font-inter">
                                <MobileNativePagination
                                    currentPage={holidays.current_page}
                                    totalPages={holidays.last_page}
                                    totalItems={holidays.total}
                                    perPage={holidays.per_page}
                                    onPageChange={(page) =>
                                        router.get(
                                            "/operational-settings",
                                            { tab: "holiday", page, year: filters.year, month: filters.month },
                                            { preserveState: true },
                                        )
                                    }
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── TABLET & DESKTOP TAB 1: JAM OPERASIONAL (>= sm) ──────────── */}
            <div
                className={`w-full flex-1 min-h-0 hidden ${activeSettingTab === "time" ? "sm:flex" : "sm:hidden"} flex-col`}
            >
                <Table
                    dense
                    columns={timeColumns}
                    data={daysOfWeek}
                    keyExtractor={(day) => day}
                    containerClassName="flex-1 min-h-0 overflow-auto bg-surface"
                />
                <TableFooter
                    info="7 Hari Operasional"
                    pagination={
                        saveStatus === "saving" ? (
                            <span className="text-primary font-bold flex items-center gap-1.5 animate-pulse text-[12px]">
                                <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
                                Menyimpan...
                            </span>
                        ) : saveStatus === "saved" ? (
                            <span className="text-emerald-700 font-bold flex items-center gap-1.5 text-[12px]">
                                <FiCheck className="text-[13px] text-emerald-600" />
                                Tersimpan otomatis
                            </span>
                        ) : (
                            <span className="text-text-muted flex items-center gap-1 text-[12px]">
                                <FiCheck className="text-[12px] text-emerald-600" />
                                Perubahan tersimpan otomatis
                            </span>
                        )
                    }
                />
            </div>

            {/* ── TABLET & DESKTOP TAB 2: LIBUR AKADEMIK (>= sm) ──────────── */}
            <div
                className={`w-full flex-1 min-h-0 hidden ${activeSettingTab === "holiday" ? "sm:flex" : "sm:hidden"} flex-col gap-3`}
            >
                <div className="flex-1 min-h-0 flex flex-col justify-between gap-3">
                    {holidays.data.length === 0 ? (
                        <Card className="flex-1 min-h-0 flex flex-col items-center justify-center p-8 text-center bg-surface border border-border shadow-card rounded-2xl">
                            <EmptyState
                                variant="no-data"
                                description="Belum ada hari libur yang ditambahkan pada periode ini."
                            />
                        </Card>
                    ) : (
                        <Table
                            dense
                            columns={[
                                {
                                    key: "description",
                                    header: "Keterangan Hari Libur",
                                    className: "font-inter font-bold text-text-primary text-[14px]",
                                    render: (h) => h.description ?? "Hari Libur",
                                },
                                {
                                    key: "holiday_date",
                                    header: "Tanggal Pelaksanaan",
                                    className: "font-inter text-text-secondary text-[13px]",
                                    render: (h) => (
                                        <div className="flex items-center gap-2">
                                            <FiCalendar className="text-primary text-[13px]" />
                                            <span className="font-medium">{formatIndonesianDate(h.holiday_date)}</span>
                                        </div>
                                    ),
                                },
                                {
                                    key: "actions",
                                    header: <div className="text-center w-full">Aksi</div>,
                                    className: "w-20 text-center",
                                    render: (h) => (
                                        <button
                                            onClick={() => handleDeleteHoliday(h.id, h.description ?? "Hari Libur")}
                                            className="inline-flex items-center justify-center w-8 h-8 rounded-md text-danger hover:text-danger/90 hover:bg-danger-bg active:bg-danger-light border border-transparent hover:border-danger-light transition-colors cursor-pointer"
                                            type="button"
                                            aria-label="Hapus hari libur"
                                            title="Hapus hari libur"
                                        >
                                            <FiTrash2 className="text-[14px]" />
                                        </button>
                                    ),
                                },
                            ]}
                            data={holidays.data}
                            keyExtractor={(h) => h.id}
                            containerClassName="flex-1 min-h-0 overflow-auto bg-surface"
                        />
                    )}

                    <TableFooter
                        info={`Total ${holidays.total} hari libur terdaftar pada periode ini.`}
                        currentPage={holidays.current_page}
                        totalPages={holidays.last_page}
                        totalItems={holidays.total}
                        perPage={holidays.per_page}
                        onPageChange={(page) =>
                            router.get(
                                "/operational-settings",
                                { tab: "holiday", page, year: filters.year, month: filters.month },
                                { preserveState: true },
                            )
                        }
                    />
                </div>
            </div>

            {/* ── UNIFIED ADD HOLIDAY DRAWER (Bottom Sheet on Mobile, Side Drawer on Tablet/Desktop) ── */}
            <Drawer
                open={showAddDrawer}
                onClose={handleCloseAddDrawer}
                title="Tambah Hari Libur Sekolah"
                description="Tentukan tanggal pelaksanaan dan keterangan hari libur atau cuti bersama kalender akademik SMA UII."
                onSubmit={handleAddHoliday}
                onCancel={handleCloseAddDrawer}
                submitLabel="Simpan Libur"
                cancelLabel="Batal"
                submitVariant="primary"
                loading={holidayProcessing}
                width="md"
            >
                <div className="flex flex-col gap-4 font-inter py-1">
                    <Input
                        label="Tanggal Hari Libur"
                        type="date"
                        value={holidayForm.holiday_date}
                        onChange={(e) => setHolidayForm("holiday_date", e.target.value)}
                        error={holidayErrors.holiday_date}
                        placeholder="Pilih tanggal"
                        required
                    />
                    <Input
                        label="Keterangan Hari Libur"
                        type="text"
                        value={holidayForm.description}
                        onChange={(e) => setHolidayForm("description", e.target.value)}
                        placeholder="Contoh: Libur Nasional Idul Fitri / Cuti Bersama"
                        error={holidayErrors.description}
                        required
                    />
                </div>
            </Drawer>

            {/* Delete Confirmation Modal */}
            <ConfirmDialog
                open={deleteHolidayConfirm.open}
                onClose={() => setDeleteHolidayConfirm({ open: false, id: null, name: "" })}
                onConfirm={confirmDeleteHoliday}
                title="Hapus Hari Libur"
                message={`Apakah Anda yakin ingin menghapus hari libur "${deleteHolidayConfirm.name}"?`}
                variant="danger"
            />

            {/* 📱 MOBILE FILTER BOTTOM SHEET */}
            <BottomSheet
                open={isMobileFilterOpen}
                onClose={() => setIsMobileFilterOpen(false)}
                title="Filter Libur Akademik"
                subtitle="Filter kalender libur berdasarkan bulan dan tahun"
            >
                <div className="flex flex-col gap-4 font-inter pb-2">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[12px] font-bold text-text-secondary">Pilih Bulan</label>
                        <NativeSelect
                            value={filters.month ?? ""}
                            onChange={(e) =>
                                router.get(
                                    "/operational-settings",
                                    { tab: "holiday", year: filters.year, month: e.target.value },
                                    { preserveState: true },
                                )
                            }
                            className="h-10 text-[13px] rounded-xl"
                        >
                            <option value="">Semua Bulan</option>
                            {months.map((m) => (
                                <option key={m.value} value={m.value}>
                                    {m.label}
                                </option>
                            ))}
                        </NativeSelect>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[12px] font-bold text-text-secondary">Pilih Tahun</label>
                        <NativeSelect
                            value={filters.year ?? String(currentYear)}
                            onChange={(e) =>
                                router.get(
                                    "/operational-settings",
                                    { tab: "holiday", year: e.target.value, month: filters.month },
                                    { preserveState: true },
                                )
                            }
                            className="h-10 text-[13px] rounded-xl"
                        >
                            <option value={String(currentYear - 1)}>{currentYear - 1}</option>
                            <option value={String(currentYear)}>{currentYear}</option>
                            <option value={String(currentYear + 1)}>{currentYear + 1}</option>
                        </NativeSelect>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        {hasActiveFilters && (
                            <Button
                                variant="secondary"
                                onClick={() =>
                                    router.get("/operational-settings", { tab: "holiday" }, { preserveState: true })
                                }
                                className="flex-1 h-10 text-[13px] font-bold rounded-xl"
                            >
                                Reset Filter
                            </Button>
                        )}
                        <Button
                            variant="primary"
                            onClick={() => setIsMobileFilterOpen(false)}
                            className="flex-1 h-10 text-[13px] font-bold rounded-xl"
                        >
                            Terapkan
                        </Button>
                    </div>
                </div>
            </BottomSheet>
        </AppShell>
    );
}
