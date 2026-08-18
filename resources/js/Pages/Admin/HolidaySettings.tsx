import { useState } from "react";
import { router, useForm } from "@inertiajs/react";
import AppShell from "@/Layouts/AppShell";
import { Button, Pagination, Table, PageHeader, NativeSelect } from "@/Components";
import type { Column } from "@/Components/ui/Table";
import { holidaySchema, locationSettingSchema } from "@/schemas";
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

interface LocationSetting {
    id: number;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    radius_meters: number;
    is_active: boolean;
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
    locationSetting?: LocationSetting;
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

export default function HolidaySettings({ timeSettings, holidays, locationSetting, filters }: AturWaktuLiburProps) {
    const [saving, setSaving] = useState(false);
    const [savingLocation, setSavingLocation] = useState(false);
    const [activeSettingTab, setActiveSettingTab] = useState<"time" | "location" | "holiday">("time");

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

    const [locationForm, setLocationForm] = useState({
        name: locationSetting?.name ?? "SMA UII Yogyakarta",
        address: locationSetting?.address ?? "Jl. Taman Siswa No.158, Wirogunan, Kec. Mergangsan, Kota Yogyakarta, D.I. Yogyakarta 55151",
        latitude: locationSetting?.latitude ?? -7.814257,
        longitude: locationSetting?.longitude ?? 110.375944,
        radius_meters: locationSetting?.radius_meters ?? 100,
        is_active: locationSetting?.is_active ?? true,
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

    const [locationErrors, setLocationErrors] = useState<Record<string, string>>({});

    const handleSaveLocationSettings = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setLocationErrors({});

        const valid = validateForm(locationSettingSchema, locationForm);
        if (!valid.success) {
            setLocationErrors(valid.errors);
            return;
        }

        setSavingLocation(true);
        router.post("/settings/location-settings", locationForm, {
            preserveState: true,
            onFinish: () => setSavingLocation(false),
        });
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
                        className="border border-border rounded-lg px-3 py-1.5 text-[13px] font-semibold font-inter text-danger bg-surface w-full focus:outline-none focus:ring-1 focus:ring-primary/20 disabled:bg-muted disabled:cursor-not-allowed"
                    />
                </div>
            ),
        },
    ];

    return (
        <AppShell title="Atur Waktu, Lokasi & Libur - SMA UII Yogyakarta">
            <PageHeader
                title="Pengaturan Presensi & Geofencing"
                description="Kelola jam operasional presensi harian, titik lokasi GPS sekolah, radius geofence, dan kalender libur akademik SMA UII."
            />

            {/* Desktop & Mobile Tab Selection */}
            <div className="mb-6">
                <div className="flex border border-border bg-surface rounded-xl p-1 shadow-xs max-w-2xl">
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
                        onClick={() => setActiveSettingTab("location")}
                        className={`flex-1 py-2.5 px-4 text-[13px] font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            activeSettingTab === "location"
                                ? "bg-primary text-white shadow-sm font-bold"
                                : "text-text-muted hover:text-text-primary hover:bg-muted/60"
                        }`}
                    >
                        <i className="fas fa-map-marker-alt text-[14px]" />
                        <span>Lokasi & Geofence</span>
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
            </div>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
                {/* Section 1: Jam Operasional Harian */}
                <div className={`lg:col-span-3 ${activeSettingTab === "time" ? "block" : "hidden"}`}>
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

                {/* Section 2: Titik Lokasi & Geofencing Presensi */}
                <div className={`lg:col-span-5 ${activeSettingTab === "location" ? "block" : "hidden"}`}>
                    <div className="bg-surface border border-border rounded-xl p-6 shadow-card">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-3 border-b border-border">
                            <div>
                                <h2 className="text-[16px] font-bold text-primary font-inter flex items-center gap-2">
                                    <i className="fas fa-map-marker-alt text-[16px] text-danger" />
                                    Titik Lokasi Utama & Radius Geofencing SMA UII Yogyakarta
                                </h2>
                                <p className="text-[12px] text-text-muted mt-1">
                                    Atur koordinat GPS pusat gedung sekolah dan batas jarak (radius) maksimal siswa melakukan presensi selfie.
                                </p>
                            </div>
                            <button
                                onClick={() => handleSaveLocationSettings()}
                                disabled={savingLocation}
                                className="flex items-center gap-1.5 bg-success hover:bg-success/90 text-white rounded-lg px-4 py-2 text-[13px] font-bold transition-colors cursor-pointer disabled:opacity-60 shrink-0"
                                type="button"
                            >
                                <i className="fas fa-check text-[12px]" />
                                <span>{savingLocation ? "Menyimpan..." : "Simpan Lokasi Presensi"}</span>
                            </button>
                        </div>

                        <form onSubmit={handleSaveLocationSettings} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-4">
                                <div>
                                    <label className="block text-[12px] font-bold text-text-primary mb-1">
                                        Nama Gedung / Lokasi Presensi
                                    </label>
                                    <input
                                        type="text"
                                        value={locationForm.name}
                                        onChange={(e) => setLocationForm({ ...locationForm, name: e.target.value })}
                                        className="w-full border border-border rounded-lg px-3 py-2 text-[13px] font-inter text-text-primary bg-surface focus:outline-none focus:ring-1 focus:ring-primary/20"
                                        placeholder="SMA UII Yogyakarta"
                                        required
                                    />
                                    {locationErrors.name && (
                                        <span className="text-[11px] text-danger font-medium mt-1 block">{locationErrors.name}</span>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-[12px] font-bold text-text-primary mb-1">
                                        Alamat Lengkap Sekolah
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={locationForm.address}
                                        onChange={(e) => setLocationForm({ ...locationForm, address: e.target.value })}
                                        className="w-full border border-border rounded-lg px-3 py-2 text-[13px] font-inter text-text-primary bg-surface focus:outline-none focus:ring-1 focus:ring-primary/20"
                                        placeholder="Jl. Taman Siswa No.158..."
                                        required
                                    />
                                    {locationErrors.address && (
                                        <span className="text-[11px] text-danger font-medium mt-1 block">{locationErrors.address}</span>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[12px] font-bold text-text-primary mb-1">
                                            Latitude (Garis Lintang)
                                        </label>
                                        <input
                                            type="number"
                                            step="any"
                                            value={locationForm.latitude}
                                            onChange={(e) => setLocationForm({ ...locationForm, latitude: parseFloat(e.target.value) || 0 })}
                                            className="w-full border border-border rounded-lg px-3 py-2 text-[13px] font-mono text-text-primary bg-surface focus:outline-none focus:ring-1 focus:ring-primary/20"
                                            required
                                        />
                                        {locationErrors.latitude && (
                                            <span className="text-[11px] text-danger font-medium mt-1 block">{locationErrors.latitude}</span>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-[12px] font-bold text-text-primary mb-1">
                                            Longitude (Garis Bujur)
                                        </label>
                                        <input
                                            type="number"
                                            step="any"
                                            value={locationForm.longitude}
                                            onChange={(e) => setLocationForm({ ...locationForm, longitude: parseFloat(e.target.value) || 0 })}
                                            className="w-full border border-border rounded-lg px-3 py-2 text-[13px] font-mono text-text-primary bg-surface focus:outline-none focus:ring-1 focus:ring-primary/20"
                                            required
                                        />
                                        {locationErrors.longitude && (
                                            <span className="text-[11px] text-danger font-medium mt-1 block">{locationErrors.longitude}</span>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[12px] font-bold text-text-primary mb-1">
                                        Radius Toleransi Geofence (Meter)
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="number"
                                            min={10}
                                            max={5000}
                                            value={locationForm.radius_meters}
                                            onChange={(e) => setLocationForm({ ...locationForm, radius_meters: parseInt(e.target.value) || 100 })}
                                            className="w-32 border border-border rounded-lg px-3 py-2 text-[13px] font-mono font-bold text-text-primary bg-surface focus:outline-none focus:ring-1 focus:ring-primary/20"
                                            required
                                        />
                                        <span className="text-[12px] text-text-muted">Meter (Disarankan: 100 - 150 meter)</span>
                                    </div>
                                    {locationErrors.radius_meters && (
                                        <span className="text-[11px] text-danger font-medium mt-1 block">{locationErrors.radius_meters}</span>
                                    )}
                                </div>

                                <div className="pt-2 flex flex-wrap items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setLocationForm({
                                            name: "SMA UII Yogyakarta",
                                            address: "Jl. Taman Siswa No.158, Wirogunan, Kec. Mergangsan, Kota Yogyakarta, D.I. Yogyakarta 55151",
                                            latitude: -7.814257,
                                            longitude: 110.375944,
                                            radius_meters: 100,
                                            is_active: true,
                                        })}
                                        className="text-[12px] font-semibold text-primary hover:underline flex items-center gap-1.5 cursor-pointer"
                                    >
                                        <i className="fas fa-crosshairs text-[11px]" />
                                        <span>Set Preset SMA UII Taman Siswa (-7.814257, 110.375944)</span>
                                    </button>
                                </div>
                            </div>

                            {/* Visual Preview Box */}
                            <div className="bg-slate-50 border border-border rounded-xl p-5 flex flex-col justify-between">
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[12px] font-bold uppercase tracking-wider text-text-muted">Preview Peta & Status</span>
                                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-success/15 text-success border border-success/30 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                                            Geofencing Active ({locationForm.radius_meters}m)
                                        </span>
                                    </div>

                                    <div className="bg-surface border border-border rounded-lg p-4 shadow-sm flex flex-col gap-2">
                                        <div className="flex items-start gap-2.5">
                                            <i className="fas fa-school text-primary text-[16px] mt-0.5" />
                                            <div>
                                                <h4 className="text-[14px] font-bold text-text-primary">{locationForm.name}</h4>
                                                <p className="text-[12px] text-text-secondary leading-snug mt-0.5">{locationForm.address}</p>
                                            </div>
                                        </div>
                                        <div className="mt-2 pt-2 border-t border-border/60 flex items-center justify-between text-[11px] font-mono text-text-muted">
                                            <span>Lat: {locationForm.latitude}</span>
                                            <span>Lng: {locationForm.longitude}</span>
                                        </div>
                                    </div>

                                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[12px] text-amber-900 flex items-start gap-2">
                                        <i className="fas fa-info-circle text-amber-600 text-[14px] mt-0.5" />
                                        <span>Siswa hanya dapat melakukan check-in jika posisi GPS HP berada di dalam lingkaran radius <strong>{locationForm.radius_meters} meter</strong> dari titik koordinat pusat SMA UII Yogyakarta.</span>
                                    </div>
                                </div>

                                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                                    <a
                                        href={`https://www.google.com/maps?q=${locationForm.latitude},${locationForm.longitude}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-border hover:bg-slate-100 text-text-primary text-[12px] font-bold rounded-lg transition-colors cursor-pointer"
                                    >
                                        <i className="fas fa-external-link-alt text-[11px] text-primary" />
                                        <span>Buka di Google Maps</span>
                                    </a>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Section 3: Libur Akademik */}
                <div className={`lg:col-span-5 ${activeSettingTab === "holiday" ? "block" : "hidden"}`}>
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
                                        {holidayProcessing ? "Menyimpan..." : "Simpan Libur"}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Filter Bar */}
                        <div className="flex gap-3 mb-5 items-center">
                            <div className="w-40">
                                <NativeSelect
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
                            <div className="w-32">
                                <NativeSelect
                                    value={filters.year ?? String(currentYear)}
                                    onChange={(e) =>
                                        router.get(
                                            "/settings",
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

                        {/* Holidays List */}
                        <div className="flex flex-col gap-3 flex-1">
                            {holidays.data.length === 0 ? (
                                <div className="flex-1 flex items-center justify-center text-text-muted text-[13px] py-12">
                                    Belum ada hari libur.
                                </div>
                            ) : (
                                holidays.data.map((h, index) => {
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
