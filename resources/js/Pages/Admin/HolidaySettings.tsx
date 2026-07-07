import { useState } from "react";
import { router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Button, Table, Pagination } from "@/Components";
import type { Column } from "@/Components/ui/Table";

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

    const handleSaveTimeSettings = () => {
        setSaving(true);
        const settings = daysOfWeek.map((day) => ({
            day,
            check_in_open: form[day].check_in_open,
            late_threshold: form[day].late_threshold,
            check_in_close: form[day].check_in_close,
        }));

        router.post(
            "/admin/settings/time-settings",
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
            "/admin/settings/holidays",
            { holiday_date: holidayDate, description: holidayDesc },
            {
                preserveState: true,
                onSuccess: () => {
                    setHolidayDate("");
                    setHolidayDesc("");
                },
            },
        );
    };

    const handleDeleteHoliday = (id: number) => {
        setDeleteHolidayId(id);
    };

    const confirmDeleteHoliday = () => {
        if (deleteHolidayId === null) return;
        router.delete(`/admin/settings/holidays/${deleteHolidayId}`, {
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

    const holidayColumns: Column<Holiday>[] = [
        {
            key: "date",
            header: "Tanggal",
            render: (h) => h.holiday_date,
        },
        {
            key: "description",
            header: "Keterangan",
            render: (h) => h.description ?? "-",
        },
        {
            key: "actions",
            header: "Aksi",
            render: (h) => (
                <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteHoliday(h.id)}
                >
                    <i className="fas fa-trash mr-1" />
                    Hapus
                </Button>
            ),
        },
    ];

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
        <AdminLayout
            title="Pengaturan Waktu & Libur"
            activeMenu="Atur Waktu & Libur"
        >
            {/* Time Settings Section */}
            <section className="bg-surface border border-border rounded-lg p-4 lg:p-6 mb-6">
                <h2 className="text-[16px] font-bold text-text-primary font-inter mb-4">
                    Pengaturan Waktu Presensi
                </h2>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse font-inter">
                        <thead>
                            <tr className="bg-muted border-b border-border">
                                <th className="px-4 py-3 text-left text-[13px] font-semibold text-text-muted uppercase">
                                    Hari
                                </th>
                                <th className="px-4 py-3 text-left text-[13px] font-semibold text-text-muted uppercase">
                                    Check-in Buka
                                </th>
                                <th className="px-4 py-3 text-left text-[13px] font-semibold text-text-muted uppercase">
                                    Batas Terlambat
                                </th>
                                <th className="px-4 py-3 text-left text-[13px] font-semibold text-text-muted uppercase">
                                    Check-in Tutup
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {daysOfWeek.map((day) => (
                                <tr
                                    key={day}
                                    className="border-b border-border last:border-b-0"
                                >
                                    <td className="px-4 py-3 text-[14px] font-semibold text-text-primary">
                                        {dayNames[day] ?? day}
                                    </td>
                                    <td className="px-4 py-3">
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
                                            className="border border-border rounded-lg px-3 py-1.5 text-[14px] font-inter text-text-primary focus:ring-2 focus:ring-primary/40 focus:outline-none"
                                        />
                                    </td>
                                    <td className="px-4 py-3">
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
                                            className="border border-border rounded-lg px-3 py-1.5 text-[14px] font-inter text-text-primary focus:ring-2 focus:ring-primary/40 focus:outline-none"
                                        />
                                    </td>
                                    <td className="px-4 py-3">
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
                                            className="border border-border rounded-lg px-3 py-1.5 text-[14px] font-inter text-text-primary focus:ring-2 focus:ring-primary/40 focus:outline-none"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-4">
                    <Button onClick={handleSaveTimeSettings} loading={saving}>
                        <i className="fas fa-save mr-2" />
                        Simpan Pengaturan Waktu
                    </Button>
                </div>
            </section>

            {/* Add Holiday Section */}
            <section className="bg-surface border border-border rounded-lg p-4 lg:p-6 mb-6">
                <h2 className="text-[16px] font-bold text-text-primary font-inter mb-4">
                    Tambah Hari Libur
                </h2>
                <form
                    onSubmit={handleAddHoliday}
                    className="flex flex-wrap gap-4 items-end"
                >
                    <div>
                        <label className="block text-[13px] text-text-muted font-inter mb-1">
                            Tanggal Libur
                        </label>
                        <input
                            type="date"
                            value={holidayDate}
                            onChange={(e) => setHolidayDate(e.target.value)}
                            required
                            className="border border-border rounded-lg px-3 py-2 text-[14px] font-inter text-text-primary focus:ring-2 focus:ring-primary/40 focus:outline-none"
                        />
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-[13px] text-text-muted font-inter mb-1">
                            Keterangan (opsional)
                        </label>
                        <input
                            type="text"
                            value={holidayDesc}
                            onChange={(e) => setHolidayDesc(e.target.value)}
                            placeholder="Contoh: Libur Nasional"
                            className="w-full border border-border rounded-lg px-3 py-2 text-[14px] font-inter text-text-primary placeholder:text-text-inactive focus:ring-2 focus:ring-primary/40 focus:outline-none"
                        />
                    </div>
                    <Button type="submit" variant="primary">
                        <i className="fas fa-plus mr-2" /> Tambah
                    </Button>
                </form>
            </section>

            {/* Holiday List */}
            <section className="bg-surface border border-border rounded-lg p-4 lg:p-6">
                <h2 className="text-[16px] font-bold text-text-primary font-inter mb-4">
                    Daftar Hari Libur
                </h2>

                <div className="flex gap-4 mb-4">
                    <select
                        value={filters.year ?? currentYear.toString()}
                        onChange={(e) =>
                            router.get(
                                "/admin/settings",
                                { year: e.target.value, month: filters.month },
                                { preserveState: true },
                            )
                        }
                        className="border border-border rounded-lg px-3 py-1.5 text-[13px] font-inter text-text-primary focus:ring-2 focus:ring-primary/40 focus:outline-none"
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
                                "/admin/settings",
                                { year: filters.year, month: e.target.value },
                                { preserveState: true },
                            )
                        }
                        className="border border-border rounded-lg px-3 py-1.5 text-[13px] font-inter text-text-primary focus:ring-2 focus:ring-primary/40 focus:outline-none"
                    >
                        <option value="">Semua Bulan</option>
                        {months.map((m) => (
                            <option key={m.value} value={m.value}>
                                {m.label}
                            </option>
                        ))}
                    </select>
                </div>

                <Table
                    columns={holidayColumns}
                    data={holidays.data}
                    keyExtractor={(h) => h.id}
                    emptyMessage="Belum ada hari libur."
                />

                <Pagination
                    currentPage={holidays.current_page}
                    totalPages={holidays.last_page}
                    totalItems={holidays.total}
                    perPage={holidays.per_page}
                    onPageChange={(page) =>
                        router.get(
                            "/admin/settings",
                            { page, year: filters.year, month: filters.month },
                            { preserveState: true },
                        )
                    }
                />
            </section>

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
                            <Button
                                variant="danger"
                                onClick={confirmDeleteHoliday}
                            >
                                Hapus
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
