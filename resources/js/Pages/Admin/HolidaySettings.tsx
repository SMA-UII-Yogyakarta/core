import { useState } from "react";
import { router, useForm } from "@inertiajs/react";
import AppShell from "@/Layouts/AppShell";
import { Button, Pagination, Table, PageHeader, NativeSelect, StickyContainer } from "@/Components";
import type { Column } from "@/Components/ui/Table";
import { holidaySchema } from "@/schemas";
import { validateForm } from "@/utils/zodHelper";

// ─── Types ───

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

interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
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

// ─── Helpers ───

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
                day: "numeric",
                month: "long",
                year: "numeric",
            });
        }

        return date.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    } catch {
        return dateStr;
    }
}

// ─── Page ───

export default function AturWaktuLibur({ timeSettings, holidays, filters }: AturWaktuLiburProps) {
    const [saving, setSaving] = useState(false);
    const [activeSettingTab, setActiveSettingTab] = useState<"time" | "holiday">("time");
    const normalizeTime = (value?: string | null, fallback = "06:30") => {
        if (!value) return fallback;
        // Backend may cast as H:i:s
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
                is_active: existing?.is_active !== undefined ? Boolean(existing.is_active) : (isSaturday ? false : true),
            };
        }
        return initial;
    });

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
    const [deleteHolidayId, setDeleteHolidayId] = useState<number | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);

    const handleSaveTimeSettings = () => {
        setSaving(true);
        const settings = daysOfWeek.map((day) => ({
            day,
            check_in_open: form[day].check_in_open,
            late_threshold: form[day].late_threshold,
            check_in_close: form[day].check_in_close,
            is_active: form[day].is_active,
        }));

        router.post(
            "/settings/time-settings",
            { settings },
            {
                preserveState: true,
                onFinish: () => setSaving(false),
            },
        );
    };

    const handleAddHoliday = (e: React.FormEvent) => {
        e.preventDefault();
        clearHolidayErrors();

        const valid = validateForm(holidaySchema, holidayForm);
        if (!valid.success) {
            (Object.keys(valid.errors) as (keyof typeof holidayForm)[]).forEach((key) => {
                const msg = valid.errors[key];
                if (msg) setHolidayError(key, msg);
            });
            return;
        }

        postHoliday("/settings/holidays", {
            preserveState: true,
            onSuccess: () => {
                resetHoliday();
                setShowAddForm(false);
            },
        });
    };

    const handleDeleteHoliday = (id: number) => {
        setDeleteHolidayId(id);
    };

    const confirmDeleteHoliday = () => {
        if (deleteHolidayId === null) return;
        router.delete(`/settings/holidays/${deleteHolidayId}`, {
            preserveState: true,
            onSuccess: () => setDeleteHolidayId(null),
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

    const handleDayToggle = (day: string, isActive: boolean) => {
        setForm((prev) => ({
            ...prev,
            [day]: { ...prev[day], is_active: isActive },
        }));
    };

    const currentYear = new Date().getFullYear();
    const months = [
        { value: "1", label: "Januari" },
        { value: "2", label: "Februari" },
        { value: "3", label: "Maret" },
        { value: "4", label: "April" },
        { value: "5", label: "Mei" },
        { value: "6", label: "Juni" },
        { value: "7", label: "Juli" },
        { value: "8", label: "Agustus" },
        { value: "9", label: "September" },
        { value: "10", label: "Oktober" },
        { value: "11", label: "November" },
        { value: "12", label: "Desember" },
    ];

    const timeColumns: Column<string>[] = [
        {
            key: "day",
            header: "Hari",
            className: "whitespace-nowrap",
            render: (day) => <span className="font-bold text-text-primary">{dayNames[day] ?? day}</span>,
        },
        {
            key: "is_active",
            header: "Buka",
            className: "text-center justify-center md:justify-center whitespace-nowrap",
            render: (day) => (
                <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                        type="checkbox"
                        checked={form[day].is_active}
                        onChange={(e) => handleDayToggle(day, e.target.checked)}
                        className="sr-only peer"
                        aria-label={`Buka presensi ${dayNames[day] ?? day}`}
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-success relative cursor-pointer" />
                </label>
            ),
        },
        {
            key: "check_in_open",
            header: "Mulai Presensi",
            className: "whitespace-nowrap",
            render: (day) => (
                <div className="relative max-w-[130px] w-full">
                    <input
                        type="time"
                        value={form[day].check_in_open}
                        disabled={!form[day].is_active}
                        onChange={(e) => handleTimeChange(day, "check_in_open", e.target.value)}
                        className="border border-border rounded-lg px-3 py-1.5 text-[13px] font-semibold font-inter text-text-primary bg-surface w-full focus:outline-none focus:ring-1 focus:ring-primary/20 disabled:bg-muted disabled:cursor-not-allowed"
                    />
                </div>
            ),
        },
        {
            key: "late_threshold",
            header: "Terlambat",
            className: "whitespace-nowrap",
            render: (day) => (
                <div className="relative max-w-[130px] w-full">
                    <input
                        type="time"
                        value={form[day].late_threshold}
                        disabled={!form[day].is_active}
                        onChange={(e) => handleTimeChange(day, "late_threshold", e.target.value)}
                        className={`border border-border rounded-lg px-3 py-1.5 text-[13px] font-bold font-inter bg-surface w-full focus:outline-none focus:ring-1 focus:ring-primary/20 disabled:bg-muted disabled:cursor-not-allowed ${
                            day === "Friday" ? "text-[#D97706]" : "text-warning"
                        }`}
                    />
                </div>
            ),
        },
        {
            key: "check_in_close",
            header: "Tutup Akses",
            className: "whitespace-nowrap",
            render: (day) => (
                <div className="relative max-w-[130px] w-full">
                    <input
                        type="time"
                        value={form[day].check_in_close}
                        disabled={!form[day].is_active}
                        onChange={(e) => handleTimeChange(day, "check_in_close", e.target.value)}
                        className="border border-border rounded-lg px-3 py-1.5 text-[13px] font-bold font-inter text-danger bg-surface w-full focus:outline-none focus:ring-1 focus:ring-primary/20 disabled:bg-muted disabled:cursor-not-allowed"
                    />
                </div>
            ),
        },
    ];

    return (
        <AppShell title="Konfigurasi Jadwal & Waktu">
            {/* Page Header */}
            <PageHeader
                title="Konfigurasi Jadwal & Waktu"
                description="Atur parameter gerbang digital presensi dan tetapkan hari libur akademik."
            />

            {/* Mobile & Tablet Tab Switcher (Sticky On Top) */}
            <StickyContainer className="lg:hidden">
                <div className="flex border border-border bg-surface rounded-xl p-1 shadow-xs">
                    <button
                        type="button"
                        onClick={() => setActiveSettingTab("time")}
                        className={`flex-1 py-2.5 px-4 text-[13px] font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            activeSettingTab === "time"
                                ? "bg-primary text-white shadow-sm font-bold"
                                : "text-text-muted hover:text-text-primary hover:bg-muted/60"
                        }`}
                    >
                        <i className="fas fa-business-time text-[14px]" />
                        <span>Jam Operasional</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveSettingTab("holiday")}
                        className={`flex-1 py-2.5 px-4 text-[13px] font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            activeSettingTab === "holiday"
                                ? "bg-primary text-white shadow-sm font-bold"
                                : "text-text-muted hover:text-text-primary hover:bg-muted/60"
                        }`}
                    >
                        <i className="far fa-calendar-times text-[14px]" />
                        <span>Libur Akademik</span>
                    </button>
                </div>
            </StickyContainer>

            {/* Split Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
                {/* Column 1: Jam Operasional Harian (Left) */}
                <div className={`lg:col-span-3 ${activeSettingTab === "time" ? "block" : "hidden lg:block"}`}>
                    <section className="flex flex-col gap-6">
                        <div className="flex items-center justify-between border-b border-border pb-3">
                            <h2 className="text-[16px] font-bold text-primary font-inter flex items-center gap-2">
                                <i className="fas fa-business-time text-[15px] text-text-inactive" />
                                Jam Operasional Harian
                            </h2>
                            <button
                                onClick={handleSaveTimeSettings}
                                disabled={saving}
                                className="flex items-center gap-1.5 bg-success hover:bg-success/90 text-white rounded-lg px-4 py-2 text-[13px] font-bold transition-colors cursor-pointer"
                                type="button"
                            >
                                <i className="fas fa-check text-[12px]" />
                                <span>{saving ? "Menyimpan..." : "Simpan Aturan Waktu"}</span>
                            </button>
                        </div>

                        <Table columns={timeColumns} data={daysOfWeek} keyExtractor={(day) => day} />
                    </section>
                </div>

                {/* Column 2: Libur Akademik (Right) */}
                <div className={`lg:col-span-2 flex flex-col gap-6 ${activeSettingTab === "holiday" ? "block" : "hidden lg:flex"}`}>
                    <div className="bg-surface border border-border rounded-xl p-6 shadow-card flex flex-col min-h-[440px]">
                        {/* Card Header */}
                        <div className="flex items-center justify-between mb-6 pb-2 border-b border-border/60">
                            <h2 className="text-[16px] font-bold text-text-primary font-inter flex items-center gap-2">
                                <i className="far fa-calendar-times text-[15px] text-text-inactive" />
                                Libur Akademik
                            </h2>
                            <button
                                onClick={() => setShowAddForm((prev) => !prev)}
                                className="flex items-center gap-1 bg-primary hover:bg-primary/95 text-white rounded-lg px-3 py-1.5 text-[13px] font-bold transition-colors cursor-pointer"
                                type="button"
                            >
                                <i className="fas fa-plus text-[11px]" />
                                <span>Tambah</span>
                            </button>
                        </div>

                        {/* Inline Form Add Holiday */}
                        {showAddForm && (
                            <form
                                onSubmit={handleAddHoliday}
                                className="border border-border/80 rounded-xl p-4 bg-slate-50 flex flex-col gap-3 mb-5"
                            >
                                <h3 className="text-[13px] font-bold text-text-primary font-inter">
                                    Tambah Hari Libur Baru
                                </h3>
                                <div>
                                    <label className="block text-[11px] text-text-muted font-inter mb-1">
                                        Tanggal Libur
                                    </label>
                                    <input
                                        type="date"
                                        value={holidayForm.holiday_date}
                                        onChange={(e) => setHolidayForm("holiday_date", e.target.value)}
                                        className="w-full border border-border rounded-lg px-3 py-1.5 text-[13px] font-inter text-text-primary bg-surface focus:outline-none focus:ring-1 focus:ring-primary/20"
                                    />
                                    {holidayErrors.holiday_date && (
                                        <p className="text-[11px] text-danger mt-1 font-medium font-inter">
                                            {holidayErrors.holiday_date}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-[11px] text-text-muted font-inter mb-1">
                                        Keterangan
                                    </label>
                                    <input
                                        type="text"
                                        value={holidayForm.description}
                                        onChange={(e) => setHolidayForm("description", e.target.value)}
                                        placeholder="Contoh: Libur Nasional"
                                        className="w-full border border-border rounded-lg px-3 py-1.5 text-[13px] font-inter text-text-primary placeholder:text-text-placeholder bg-surface focus:outline-none focus:ring-1 focus:ring-primary/20"
                                    />
                                    {holidayErrors.description && (
                                        <p className="text-[11px] text-danger mt-1 font-medium font-inter">
                                            {holidayErrors.description}
                                        </p>
                                    )}
                                </div>
                                <div className="flex gap-2 justify-end mt-1">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            resetHoliday();
                                            setShowAddForm(false);
                                        }}
                                        className="px-3 py-1.5 text-[12px] font-bold text-text-secondary hover:bg-slate-200/50 rounded-lg transition-colors cursor-pointer"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={holidayProcessing}
                                        className="bg-primary hover:bg-primary/95 text-white px-4 py-1.5 rounded-lg text-[12px] font-bold transition-colors cursor-pointer disabled:opacity-60"
                                    >
                                        {holidayProcessing ? "Menyimpan..." : "Simpan"}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Month / Year Filters for Holidays */}
                        <div className="flex gap-3 mb-5 select-none">
                            <NativeSelect
                                className="w-1/2 sm:w-[140px]"
                                value={filters.year ?? currentYear.toString()}
                                onChange={(e) =>
                                    router.get(
                                        "/settings",
                                        { year: e.target.value, month: filters.month },
                                        { preserveState: true },
                                    )
                                }
                            >
                                {Array.from({ length: 5 }, (_, i) => currentYear - 2 + i).map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </NativeSelect>
                            <NativeSelect
                                className="w-1/2 sm:w-[140px]"
                                value={filters.month ?? ""}
                                onChange={(e) =>
                                    router.get(
                                        "/settings",
                                        { year: filters.year, month: e.target.value },
                                        { preserveState: true },
                                    )
                                }
                            >
                                <option value="">Semua Bulan</option>
                                {months.map((m) => (
                                    <option key={m.value} value={m.value}>
                                        {m.label}
                                    </option>
                                ))}
                            </NativeSelect>
                        </div>

                        {/* Holiday List rendered as Cards (as per Figma) */}
                        <div className="flex-1 flex flex-col gap-3.5 max-h-[380px] overflow-y-auto pr-1.5 scrollbar-thin">
                            {holidays.data.length === 0 ? (
                                <div className="py-12 text-center text-text-inactive font-inter text-[13px]">
                                    Belum ada hari libur.
                                </div>
                            ) : (
                                holidays.data.map((h, index) => {
                                    // border left alternating colors like Figma (red, blue, green etc.)
                                    const borderColors = [
                                        "border-l-danger",
                                        "border-l-primary",
                                        "border-l-success",
                                        "border-l-warning",
                                    ];
                                    const borderColor = borderColors[index % borderColors.length];
                                    return (
                                        <div
                                            key={h.id}
                                            className={`flex items-center justify-between p-4 bg-surface border border-border border-l-4 ${borderColor} rounded-xl shadow-sm hover:shadow-md transition-shadow`}
                                        >
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[13px] font-bold text-text-primary font-inter leading-tight">
                                                    {h.description ?? "Hari Libur"}
                                                </span>
                                                <div className="flex items-center gap-1.5 text-[11px] text-text-secondary font-medium font-inter">
                                                    <i className="far fa-calendar text-text-inactive" />
                                                    <span>{formatIndonesianDate(h.holiday_date)}</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteHoliday(h.id)}
                                                className="inline-flex items-center justify-center w-8 h-8 rounded-md text-danger hover:text-danger/90 hover:bg-danger-bg active:bg-danger-light border border-transparent hover:border-danger-light transition-colors cursor-pointer"
                                                type="button"
                                                aria-label="Hapus hari libur"
                                            >
                                                <i className="far fa-trash-alt text-[14px]" />
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Pagination */}
                        {holidays.total > holidays.per_page && (
                            <div className="mt-5 pt-3 border-t border-border/60">
                                <Pagination
                                    currentPage={holidays.current_page}
                                    totalPages={holidays.last_page}
                                    totalItems={holidays.total}
                                    perPage={holidays.per_page}
                                    onPageChange={(page) =>
                                        router.get(
                                            "/settings",
                                            { page, year: filters.year, month: filters.month },
                                            { preserveState: true },
                                        )
                                    }
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteHolidayId !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setDeleteHolidayId(null)} />
                    <div className="relative bg-surface rounded-xl shadow-modal w-full max-w-sm p-6 text-center">
                        <h3 className="text-[16px] font-bold text-text-primary mb-2">Konfirmasi Hapus</h3>
                        <p className="text-[13px] text-text-muted mb-6">
                            Apakah Anda yakin ingin menghapus hari libur ini?
                        </p>
                        <div className="flex gap-3 justify-center">
                            <Button variant="ghost" onClick={() => setDeleteHolidayId(null)}>
                                Batal
                            </Button>
                            <Button variant="danger" onClick={confirmDeleteHoliday}>
                                Hapus
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </AppShell>
    );
}
