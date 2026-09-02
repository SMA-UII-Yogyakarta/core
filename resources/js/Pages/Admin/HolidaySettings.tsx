import { useState } from "react";
import { router, useForm } from "@inertiajs/react";
import AppShell from "@/Layouts/AppShell";
import { Pagination, Table, PageHeader, NativeSelect, Toggle, Input, ConfirmDialog, EmptyState, Card, Button, TabSwitcher } from "@/Components";
import type { Column } from "@/Components/ui/Table";
import { holidaySchema } from "@/schemas";
import { validateForm } from "@/utils/zodHelper";
import {
    FiClock,
    FiCalendar,
    FiCheck,
    FiPlus,
    FiTrash2,
} from "react-icons/fi";

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
    const [saving, setSaving] = useState(false);
    const [activeSettingTab, setActiveSettingTab] = useState<"time" | "holiday">("time");

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

    const [deleteHolidayConfirm, setDeleteHolidayConfirm] = useState<{ open: boolean; id: number | null; name: string }>({
        open: false,
        id: null,
        name: "",
    });
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
            "/operational-settings/time-settings",
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
            Object.entries(valid.errors).forEach(([field, msg]) => {
                setHolidayError(field as keyof typeof holidayForm, msg);
            });
            return;
        }

        postHoliday("/operational-settings/holidays", {
            preserveState: true,
            onSuccess: () => {
                resetHoliday();
                setShowAddForm(false);
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

    const handleTimeChange = (day: string, field: "check_in_open" | "late_threshold" | "check_in_close", value: string) => {
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
            header: "Hari Operasional",
            className: "whitespace-nowrap font-inter font-bold text-text-primary w-48",
            render: (day) => (
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    <span>{dayNames[day] ?? day}</span>
                </div>
            ),
        },
        {
            key: "is_active",
            header: "Status Buka Presensi",
            className: "text-center whitespace-nowrap w-44",
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
            header: "Mulai Presensi (Buka Pintu)",
            className: "whitespace-nowrap min-w-[160px]",
            render: (day) => (
                <div className="relative max-w-[140px] w-full">
                    <Input
                        type="time"
                        value={form[day].check_in_open}
                        disabled={!form[day].is_active}
                        onChange={(e) => handleTimeChange(day, "check_in_open", e.target.value)}
                        inputClassName="!font-bold text-center font-inter"
                    />
                </div>
            ),
        },
        {
            key: "late_threshold",
            header: "Batas Waktu Terlambat",
            className: "whitespace-nowrap min-w-[160px]",
            render: (day) => (
                <div className="relative max-w-[140px] w-full">
                    <Input
                        type="time"
                        value={form[day].late_threshold}
                        disabled={!form[day].is_active}
                        onChange={(e) => handleTimeChange(day, "late_threshold", e.target.value)}
                        inputClassName="!font-bold !text-amber-600 !border-amber-300 !bg-amber-50/60 text-center font-inter"
                        style={form[day].is_active ? { color: "#d97706", borderColor: "#fcd34d", backgroundColor: "rgba(254, 243, 199, 0.5)" } : undefined}
                    />
                </div>
            ),
        },
        {
            key: "check_in_close",
            header: "Tutup Akses Presensi",
            className: "whitespace-nowrap min-w-[160px]",
            render: (day) => (
                <div className="relative max-w-[140px] w-full">
                    <Input
                        type="time"
                        value={form[day].check_in_close}
                        disabled={!form[day].is_active}
                        onChange={(e) => handleTimeChange(day, "check_in_close", e.target.value)}
                        inputClassName="!font-bold !text-red-600 !border-red-300 !bg-red-50/60 text-center font-inter"
                        style={form[day].is_active ? { color: "#dc2626", borderColor: "#fca5a5", backgroundColor: "rgba(254, 226, 226, 0.5)" } : undefined}
                    />
                </div>
            ),
        },
    ];

    return (
        <AppShell title="Atur Waktu & Libur - SMA UII Yogyakarta">
            <PageHeader
                title="Atur Jam Operasional & Libur Akademik"
                description="Kelola jadwal jam presensi harian siswa dan daftar kalender libur sekolah SMA UII Yogyakarta."
                className="shrink-0 mb-4"
            >
                {activeSettingTab === "time" ? (
                    <Button
                        onClick={handleSaveTimeSettings}
                        loading={saving}
                        variant="success"
                        className="shrink-0 font-bold h-10 shadow-xs"
                    >
                        <FiCheck className="mr-1.5" />
                        Simpan Aturan Waktu
                    </Button>
                ) : (
                    <Button
                        onClick={() => setShowAddForm((prev) => !prev)}
                        variant="primary"
                        className="shrink-0 font-bold h-10 shadow-xs"
                    >
                        <FiPlus className="mr-1.5" />
                        Tambah Libur
                    </Button>
                )}
            </PageHeader>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 shrink-0 font-inter">
                <TabSwitcher
                    tabs={[
                        { key: "time", label: "Jam Operasional", icon: <FiClock className="text-[14px]" /> },
                        { key: "holiday", label: "Libur Akademik", icon: <FiCalendar className="text-[14px]" /> },
                    ]}
                    activeKey={activeSettingTab}
                    onChange={(key) => setActiveSettingTab(key as "time" | "holiday")}
                    variant="segmented"
                />

                {activeSettingTab === "holiday" && (
                    <div className="flex items-center gap-2.5 shrink-0">
                        <div className="w-36">
                            <NativeSelect
                                value={filters.month ?? ""}
                                onChange={(e) =>
                                    router.get(
                                        "/operational-settings",
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
                        <div className="w-28">
                            <NativeSelect
                                value={filters.year ?? String(currentYear)}
                                onChange={(e) =>
                                    router.get(
                                        "/operational-settings",
                                        { year: e.target.value, month: filters.month },
                                        { preserveState: true },
                                    )
                                }
                            >
                                <option value={String(currentYear - 1)}>{currentYear - 1}</option>
                                <option value={String(currentYear)}>{currentYear}</option>
                                <option value={String(currentYear + 1)}>{currentYear + 1}</option>
                            </NativeSelect>
                        </div>
                    </div>
                )}
            </div>

            <div className={`w-full flex-1 min-h-0 flex flex-col ${activeSettingTab === "time" ? "flex" : "hidden"}`}>
                <Table
                    columns={timeColumns}
                    data={daysOfWeek}
                    keyExtractor={(day) => day}
                    containerClassName="flex-1 min-h-0 overflow-auto bg-surface"
                />
            </div>

            <div className={`w-full flex-1 min-h-0 flex flex-col gap-3 ${activeSettingTab === "holiday" ? "flex" : "hidden"}`}>
                {showAddForm && (
                    <Card className="p-4 sm:p-5 shrink-0 border-border shadow-card">
                        <form onSubmit={handleAddHoliday} className="flex flex-col gap-4 font-inter">
                            <div className="flex items-center justify-between gap-4 pb-3 border-b border-border">
                                <h3 className="text-[14px] font-bold text-text-primary flex items-center gap-2">
                                    <FiPlus className="text-primary text-[14px]" />
                                    Form Tambah Hari Libur Sekolah
                                </h3>
                                <div className="flex gap-2 items-center">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => {
                                            resetHoliday();
                                            setShowAddForm(false);
                                        }}
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        type="submit"
                                        loading={holidayProcessing}
                                        variant="primary"
                                        size="sm"
                                    >
                                        Simpan Libur
                                    </Button>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Tanggal Hari Libur"
                                    type="date"
                                    value={holidayForm.holiday_date}
                                    onChange={(e) => setHolidayForm("holiday_date", e.target.value)}
                                    error={holidayErrors.holiday_date}
                                />
                                <Input
                                    label="Keterangan Hari Libur"
                                    type="text"
                                    value={holidayForm.description}
                                    onChange={(e) => setHolidayForm("description", e.target.value)}
                                    placeholder="Contoh: Libur Nasional / Cuti Bersama"
                                    error={holidayErrors.description}
                                />
                            </div>
                        </form>
                    </Card>
                )}

                <div className="flex-1 min-h-0 flex flex-col justify-between gap-3">
                    {holidays.data.length === 0 ? (
                        <Card className="flex-1 min-h-0 flex flex-col items-center justify-center p-8 text-center bg-surface border border-border shadow-card">
                            <EmptyState variant="no-data" description="Belum ada hari libur yang ditambahkan pada periode ini." />
                        </Card>
                    ) : (
                        <Table
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

                    {holidays.total > holidays.per_page && (
                        <div className="pt-2 shrink-0 mt-auto font-inter">
                            <Pagination
                                currentPage={holidays.current_page}
                                totalPages={holidays.last_page}
                                totalItems={holidays.total}
                                perPage={holidays.per_page}
                                onPageChange={(page) =>
                                    router.get(
                                        "/operational-settings",
                                        { page, year: filters.year, month: filters.month },
                                        { preserveState: true },
                                    )
                                }
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <ConfirmDialog
                open={deleteHolidayConfirm.open}
                onClose={() => setDeleteHolidayConfirm({ open: false, id: null, name: "" })}
                onConfirm={confirmDeleteHoliday}
                title="Hapus Hari Libur"
                message={`Apakah Anda yakin ingin menghapus hari libur "${deleteHolidayConfirm.name}"?`}
                variant="danger"
            />
        </AppShell>
    );
}


