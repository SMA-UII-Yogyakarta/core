import { useState } from "react";
import { router } from "@inertiajs/react";
import AppShell from "@/Layouts/AppShell";
import { Button, Pagination } from "@/Components";

// ─── Types ───

interface TimeSetting {
    id: number;
    day: string;
    check_in_open: string;
    late_threshold: string;
    check_in_close: string;
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

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

// ─── Page ───

export default function AturWaktuLibur({
    timeSettings,
    holidays,
    filters,
}: AturWaktuLiburProps) {
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState<
        Record<
            string,
            {
                check_in_open: string;
                late_threshold: string;
                check_in_close: string;
            }
        >
    >(() => {
        const initial: Record<
            string,
            {
                check_in_open: string;
                late_threshold: string;
                check_in_close: string;
            }
        > = {};
        for (const day of daysOfWeek) {
            const existing = timeSettings.find((ts) => ts.day === day);
            initial[day] = {
                check_in_open: existing?.check_in_open ?? "06:30",
                late_threshold: existing?.late_threshold ?? "07:00",
                check_in_close: existing?.check_in_close ?? "07:30",
            };
        }
        return initial;
    });

    const [holidayDate, setHolidayDate] = useState("");
    const [holidayDesc, setHolidayDesc] = useState("");
    const [deleteHolidayId, setDeleteHolidayId] = useState<number | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);

    const handleSaveTimeSettings = () => {
        setSaving(true);
        const settings = daysOfWeek.map((day) => ({
            day,
            check_in_open: form[day].check_in_open,
            late_threshold: form[day].late_threshold,
            check_in_close: form[day].check_in_close,
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
        if (!holidayDate) return;

        router.post(
            "/settings/holidays",
            { holiday_date: holidayDate, description: holidayDesc },
            {
                preserveState: true,
                onSuccess: () => {
                    setHolidayDate("");
                    setHolidayDesc("");
                    setShowAddForm(false);
                },
            },
        );
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

    const handleTimeChange = (day: string, field: string, value: string) => {
        setForm((prev) => ({
            ...prev,
            [day]: { ...prev[day], [field]: value },
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

    return (
        <AppShell title="Konfigurasi Jadwal & Waktu">
            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-[24px] font-bold text-text-primary font-inter leading-tight">
                    Konfigurasi Jadwal & Waktu
                </h1>
                <p className="text-[14px] text-text-secondary font-inter mt-1">
                    Atur parameter gerbang digital presensi dan tetapkan hari libur akademik.
                </p>
            </div>

            {/* Split Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
                
                {/* Column 1: Jam Operasional Harian (Left) */}
                <div className="lg:col-span-3">
                    <div className="bg-surface border border-border rounded-xl p-6 shadow-card flex flex-col gap-6">
                        <h2 className="text-[16px] font-bold text-primary font-inter border-b border-border pb-3 flex items-center gap-2">
                            <i className="fas fa-business-time text-[15px] text-text-inactive" />
                            Jam Operasional Harian
                        </h2>

                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse font-inter">
                                <thead>
                                    <tr className="bg-muted/40 border-b border-border">
                                        <th className="px-4 py-3.5 text-left text-[13px] font-semibold text-text-muted">
                                            Hari
                                        </th>
                                        <th className="px-4 py-3.5 text-center text-[13px] font-semibold text-text-muted w-20">
                                            Buka
                                        </th>
                                        <th className="px-4 py-3.5 text-left text-[13px] font-semibold text-text-muted">
                                            Mulai Presensi
                                        </th>
                                        <th className="px-4 py-3.5 text-left text-[13px] font-semibold text-text-muted">
                                            Terlambat
                                        </th>
                                        <th className="px-4 py-3.5 text-left text-[13px] font-semibold text-text-muted">
                                            Tutup Akses
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {daysOfWeek.map((day) => (
                                        <tr
                                            key={day}
                                            className="border-b border-border last:border-b-0 hover:bg-muted/10 transition-colors"
                                        >
                                            <td className="px-4 py-4 text-[14px] font-bold text-text-primary">
                                                {dayNames[day] ?? day}
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                {/* Green CSS toggle switch */}
                                                <label className="relative inline-flex items-center cursor-pointer select-none">
                                                    <input
                                                        type="checkbox"
                                                        defaultChecked
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-success relative cursor-pointer" />
                                                </label>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="relative max-w-[100px]">
                                                    <input
                                                        type="time"
                                                        value={form[day].check_in_open}
                                                        onChange={(e) =>
                                                            handleTimeChange(
                                                                day,
                                                                "check_in_open",
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="border border-border rounded-lg pl-3 pr-8 py-1.5 text-[13px] font-semibold font-inter text-text-primary bg-surface w-full focus:outline-none focus:ring-1 focus:ring-primary/20"
                                                    />
                                                    <i className="far fa-clock absolute right-2.5 top-1/2 -translate-y-1/2 text-text-inactive text-[11px] pointer-events-none" />
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="relative max-w-[100px]">
                                                    <input
                                                        type="time"
                                                        value={form[day].late_threshold}
                                                        onChange={(e) =>
                                                            handleTimeChange(
                                                                day,
                                                                "late_threshold",
                                                                e.target.value,
                                                            )
                                                        }
                                                        className={`border border-border rounded-lg pl-3 pr-8 py-1.5 text-[13px] font-bold font-inter bg-surface w-full focus:outline-none focus:ring-1 focus:ring-primary/20 ${
                                                            day === "Friday" ? "text-[#D97706]" : "text-warning"
                                                        }`}
                                                    />
                                                    <i className="far fa-clock absolute right-2.5 top-1/2 -translate-y-1/2 text-text-inactive text-[11px] pointer-events-none" />
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="relative max-w-[100px]">
                                                    <input
                                                        type="time"
                                                        value={form[day].check_in_close}
                                                        onChange={(e) =>
                                                            handleTimeChange(
                                                                day,
                                                                "check_in_close",
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="border border-border rounded-lg pl-3 pr-8 py-1.5 text-[13px] font-bold font-inter text-danger bg-surface w-full focus:outline-none focus:ring-1 focus:ring-primary/20"
                                                    />
                                                    <i className="far fa-clock absolute right-2.5 top-1/2 -translate-y-1/2 text-text-inactive text-[11px] pointer-events-none" />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4 border-t border-border pt-4">
                            <button
                                onClick={handleSaveTimeSettings}
                                disabled={saving}
                                className="flex items-center gap-1.5 bg-success hover:bg-success/90 text-white rounded-lg px-4 py-2.5 text-[13px] font-bold transition-colors cursor-pointer"
                                type="button"
                            >
                                <i className="fas fa-check text-[12px]" />
                                <span>{saving ? "Menyimpan..." : "Simpan Aturan Waktu"}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Column 2: Libur Akademik (Right) */}
                <div className="lg:col-span-2 flex flex-col gap-6">
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
                                        value={holidayDate}
                                        onChange={(e) => setHolidayDate(e.target.value)}
                                        required
                                        className="w-full border border-border rounded-lg px-3 py-1.5 text-[13px] font-inter text-text-primary bg-surface focus:outline-none focus:ring-1 focus:ring-primary/20"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] text-text-muted font-inter mb-1">
                                        Keterangan
                                    </label>
                                    <input
                                        type="text"
                                        value={holidayDesc}
                                        onChange={(e) => setHolidayDesc(e.target.value)}
                                        placeholder="Contoh: Libur Nasional"
                                        required
                                        className="w-full border border-border rounded-lg px-3 py-1.5 text-[13px] font-inter text-text-primary placeholder:text-text-placeholder bg-surface focus:outline-none focus:ring-1 focus:ring-primary/20"
                                    />
                                </div>
                                <div className="flex gap-2 justify-end mt-1">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddForm(false)}
                                        className="px-3 py-1.5 text-[12px] font-bold text-text-secondary hover:bg-slate-200/50 rounded-lg transition-colors cursor-pointer"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-primary hover:bg-primary/95 text-white px-4 py-1.5 rounded-lg text-[12px] font-bold transition-colors cursor-pointer"
                                    >
                                        Simpan
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Month / Year Filters for Holidays */}
                        <div className="flex gap-3 mb-5 select-none">
                            <select
                                value={filters.year ?? currentYear.toString()}
                                onChange={(e) =>
                                    router.get(
                                        "/settings",
                                        { year: e.target.value, month: filters.month },
                                        { preserveState: true },
                                    )
                                }
                                className="border border-border rounded-lg px-3 py-1.5 text-[12px] font-bold font-inter text-text-primary bg-surface focus:outline-none focus:ring-1 focus:ring-primary/20"
                            >
                                {Array.from(
                                    { length: 5 },
                                    (_, i) => currentYear - 2 + i,
                                ).map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={filters.month ?? ""}
                                onChange={(e) =>
                                    router.get(
                                        "/settings",
                                        { year: filters.year, month: e.target.value },
                                        { preserveState: true },
                                    )
                                }
                                className="border border-border rounded-lg px-3 py-1.5 text-[12px] font-bold font-inter text-text-primary bg-surface focus:outline-none focus:ring-1 focus:ring-primary/20"
                            >
                                <option value="">Semua Bulan</option>
                                {months.map((m) => (
                                    <option key={m.value} value={m.value}>
                                        {m.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Holiday List rendered as Cards (as per Figma) */}
                        <div className="flex-1 flex flex-col gap-3.5">
                            {holidays.data.length === 0 ? (
                                <div className="py-12 text-center text-text-inactive font-inter text-[13px]">
                                    Belum ada hari libur.
                                </div>
                            ) : (
                                holidays.data.map((h, index) => {
                                    // border left alternating colors like Figma (red, blue, green etc.)
                                    const borderColors = ["border-l-danger", "border-l-primary", "border-l-success", "border-l-warning"];
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
                                                    <span>{h.holiday_date}</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteHoliday(h.id)}
                                                className="text-danger hover:text-danger/80 p-1.5 cursor-pointer transition-transform hover:scale-110"
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
                    <div
                        className="fixed inset-0 bg-black/50"
                        onClick={() => setDeleteHolidayId(null)}
                    />
                    <div className="relative bg-surface rounded-xl shadow-modal w-full max-w-sm p-6 text-center">
                        <h3 className="text-[16px] font-bold text-text-primary mb-2">
                            Konfirmasi Hapus
                        </h3>
                        <p className="text-[13px] text-text-muted mb-6">
                            Apakah Anda yakin ingin menghapus hari libur ini?
                        </p>
                        <div className="flex gap-3 justify-center">
                            <Button
                                variant="ghost"
                                onClick={() => setDeleteHolidayId(null)}
                            >
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
