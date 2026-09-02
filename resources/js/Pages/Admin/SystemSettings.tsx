import { useState } from "react";
import { useForm, router } from "@inertiajs/react";
import AppShell from "@/Layouts/AppShell";
import PageHeader from "@/Components/ui/PageHeader";
import Input from "@/Components/ui/Input";
import Button from "@/Components/ui/Button";
import Card from "@/Components/ui/Card";
import NativeSelect from "@/Components/ui/NativeSelect";
import Toggle from "@/Components/ui/Toggle";
import TabSwitcher from "@/Components/common/TabSwitcher";
import { MapPreview } from "@/Components/common/MapPreview";
import { validateForm } from "@/utils/zodHelper";
import { locationSettingSchema } from "@/schemas/locationSetting.schema";
import { toast, getSavedToastPosition, setSavedToastPosition, type ToastPosition } from "@/Components/common/Toast";

interface SchoolLocationSetting {
    id?: number;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    radius_meters: number;
    is_active: boolean;
}

interface SystemInfo {
    appName: string;
    version: string;
    schoolName: string;
    npsn: string;
    accreditation: string;
    academicYear: string;
    principalName: string;
    address: string;
    phone: string;
    email: string;
    environment: string;
    storageDriver: string;
    waGatewayStatus: string;
    maintenanceMode: boolean;
    mfaEnforced: boolean;
    defaultPageLimit: number;
    sessionTimeoutMinutes: number;
}

interface SystemSettingsProps {
    systemInfo: SystemInfo;
    locationSetting?: SchoolLocationSetting;
}

export default function SystemSettings({ systemInfo, locationSetting }: SystemSettingsProps) {
    const [activeTab, setActiveTab] = useState<"identity" | "location" | "integration" | "security">("identity");
    const [toastPosition, setToastPositionState] = useState<ToastPosition>(getSavedToastPosition);

    // Form 1: Identity & Security Preferences
    const { data, setData, post, processing, errors } = useForm({
        schoolName: systemInfo.schoolName,
        npsn: systemInfo.npsn,
        accreditation: systemInfo.accreditation,
        academicYear: systemInfo.academicYear,
        principalName: systemInfo.principalName,
        address: systemInfo.address,
        phone: systemInfo.phone,
        email: systemInfo.email,
        defaultPageLimit: systemInfo.defaultPageLimit,
        sessionTimeoutMinutes: systemInfo.sessionTimeoutMinutes,
        maintenanceMode: systemInfo.maintenanceMode,
        mfaEnforced: systemInfo.mfaEnforced,
    });

    // Form 2: Location & Geofence
    const [locationForm, setLocationForm] = useState<SchoolLocationSetting>({
        name: locationSetting?.name ?? "SMA UII Yogyakarta",
        address: locationSetting?.address ?? "Jl. Taman Siswa No.158, Wirogunan, Mergangsan, Yogyakarta",
        latitude: locationSetting?.latitude ?? -7.814257,
        longitude: locationSetting?.longitude ?? 110.375944,
        radius_meters: locationSetting?.radius_meters ?? 100,
        is_active: locationSetting?.is_active ?? true,
    });
    const [savingLocation, setSavingLocation] = useState(false);
    const [locationErrors, setLocationErrors] = useState<Record<string, string>>({});

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        post("/settings", {
            preserveState: true,
        });
    };

    const handleSaveLocationSettings = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setLocationErrors({});

        const valid = validateForm(locationSettingSchema, locationForm);
        if (!valid.success) {
            setLocationErrors(valid.errors as Record<string, string>);
            return;
        }

        setSavingLocation(true);
        router.post("/settings/location-settings", locationForm as unknown as Record<string, string | number | boolean>, {
            preserveState: true,
            onFinish: () => setSavingLocation(false),
        });
    };

    return (
        <AppShell title="Pengaturan Sistem Core - SMA UII Yogyakarta">
            <PageHeader
                title="Pengaturan Sistem Core Backend"
                description="Kelola konfigurasi identitas sekolah, titik lokasi geofencing presensi, integrasi API, serta preferensi keamanan SMA UII Core."
                className="shrink-0 mb-4"
            />

            {/* Navigation Tabs Row (Standard 16px Spacing) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 shrink-0 font-inter">
                <TabSwitcher
                    tabs={[
                        { key: "identity", label: "Identitas Sekolah", icon: <i className="fas fa-school text-[14px]" /> },
                        { key: "location", label: "Lokasi & Geofence", icon: <i className="fas fa-map-marker-alt text-[14px]" /> },
                        { key: "integration", label: "Integrasi & API", icon: <i className="fas fa-network-wired text-[14px]" /> },
                        { key: "security", label: "Keamanan System", icon: <i className="fas fa-shield-alt text-[14px]" /> },
                    ]}
                    activeKey={activeTab}
                    onChange={(key) => setActiveTab(key as "identity" | "location" | "integration" | "security")}
                    variant="segmented"
                />
            </div>

            {/* Tab 1: Identitas Sekolah (Full Width & Clean Grid) */}
            <div className={`w-full ${activeTab === "identity" ? "block" : "hidden"}`}>
                <Card className="p-6">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border font-inter">
                            <div>
                                <h2 className="text-[16px] font-bold text-primary flex items-center gap-2">
                                    <i className="fas fa-school text-primary text-[16px]" />
                                    Profil & Identitas Resmi Institusi Sekolah
                                </h2>
                                <p className="text-[12px] text-text-muted mt-0.5">
                                    Informasi resmi SMA UII Yogyakarta yang digunakan pada kop laporan, sertifikat, dan metadata sistem.
                                </p>
                            </div>
                            <Button type="submit" loading={processing} variant="primary" className="shrink-0">
                                <i className="fas fa-save mr-1.5" />
                                Simpan Identitas Sekolah
                            </Button>
                        </div>

                        {/* Section 1: Data Utama */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 font-inter">
                            <Input
                                label="Nama Sekolah / Institusi"
                                value={data.schoolName}
                                onChange={(e) => setData("schoolName", e.target.value)}
                                error={errors.schoolName}
                                placeholder="SMA UII Yogyakarta"
                            />
                            <Input
                                label="Nomor Pokok Sekolah Nasional (NPSN)"
                                value={data.npsn}
                                onChange={(e) => setData("npsn", e.target.value)}
                                error={errors.npsn}
                                placeholder="20403178"
                            />
                            <Input
                                label="Nama Kepala Sekolah"
                                value={data.principalName}
                                onChange={(e) => setData("principalName", e.target.value)}
                                error={errors.principalName}
                                placeholder="Drs. H. M. Suparno, M.Pd."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 font-inter">
                            <div>
                                <label className="block text-[13px] font-semibold text-text-primary mb-1.5">
                                    Akreditasi Sekolah
                                </label>
                                <NativeSelect
                                    value={data.accreditation}
                                    onChange={(e) => setData("accreditation", e.target.value)}
                                >
                                    <option value="A (Unggul)">A (Unggul)</option>
                                    <option value="B (Baik)">B (Baik)</option>
                                    <option value="C">C</option>
                                </NativeSelect>
                            </div>

                            <div>
                                <label className="block text-[13px] font-semibold text-text-primary mb-1.5">
                                    Tahun Akademik & Semester Active
                                </label>
                                <NativeSelect
                                    value={data.academicYear}
                                    onChange={(e) => setData("academicYear", e.target.value)}
                                >
                                    <option value="2025/2026 - Ganjil">2025/2026 - Semester Ganjil</option>
                                    <option value="2025/2026 - Genap">2025/2026 - Semester Genap</option>
                                    <option value="2024/2025 - Genap">2024/2025 - Semester Genap</option>
                                </NativeSelect>
                            </div>

                            <Input
                                label="Telepon Sekolah"
                                value={data.phone}
                                onChange={(e) => setData("phone", e.target.value)}
                                error={errors.phone}
                                placeholder="(0274) 555-1234"
                            />
                        </div>

                        {/* Section 2: Kontak & Alamat */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-inter pt-2 border-t border-border/60">
                            <Input
                                label="Email Resmi Kontak"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData("email", e.target.value)}
                                error={errors.email}
                                placeholder="info@smauii.sch.id"
                            />

                            <div>
                                <label className="block text-[13px] font-semibold text-text-primary mb-1.5">
                                    Alamat Lengkap Gedung Sekolah
                                </label>
                                <textarea
                                    value={data.address}
                                    onChange={(e) => setData("address", e.target.value)}
                                    rows={2}
                                    className="w-full rounded-lg border border-border bg-surface px-3.5 py-2 text-[14px] text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary font-inter resize-none"
                                    placeholder="Jl. Sorowajan Baru No. 12, Banguntapan, Bantul, DIY"
                                />
                                {errors.address && <p className="text-[12px] text-danger mt-1">{errors.address}</p>}
                            </div>
                        </div>
                    </form>
                </Card>
            </div>

            {/* Tab 2: Lokasi & Geofencing (Full Width & Responsive 2-Column Split) */}
            <div className={`w-full ${activeTab === "location" ? "block" : "hidden"}`}>
                <Card className="p-6">
                    <form onSubmit={handleSaveLocationSettings} className="flex flex-col gap-6 font-inter">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                            <div>
                                <h2 className="text-[16px] font-bold text-primary flex items-center gap-2">
                                    <i className="fas fa-map-marker-alt text-[16px] text-danger" />
                                    Titik Lokasi Utama & Radius Geofencing Presensi
                                </h2>
                                <p className="text-[12px] text-text-muted mt-0.5">
                                    Atur koordinat GPS pusat gedung sekolah dan batas jarak (radius) maksimal siswa melakukan presensi selfie.
                                </p>
                            </div>
                            <Button
                                type="submit"
                                loading={savingLocation}
                                variant="success"
                                className="shrink-0"
                            >
                                <i className="fas fa-check mr-1.5" />
                                Simpan Lokasi Presensi
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            {/* Left Column: Form Settings (6 Cols) */}
                            <div className="lg:col-span-6 flex flex-col gap-4">
                                <Input
                                    label="Nama Gedung / Lokasi Presensi"
                                    value={locationForm.name}
                                    onChange={(e) => setLocationForm({ ...locationForm, name: e.target.value })}
                                    placeholder="SMA UII Yogyakarta"
                                    error={locationErrors.name}
                                />

                                <div>
                                    <label className="block text-[13px] font-semibold text-text-primary mb-1.5">
                                        Alamat Lengkap Gedung Sekolah
                                    </label>
                                    <textarea
                                        value={locationForm.address}
                                        onChange={(e) => setLocationForm({ ...locationForm, address: e.target.value })}
                                        rows={3}
                                        className="w-full rounded-lg border border-border bg-surface px-3.5 py-2 text-[14px] text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary font-inter resize-none"
                                        placeholder="Alamat fisik lokasi presensi"
                                    />
                                    {locationErrors.address && (
                                        <p className="text-[12px] text-danger mt-1">{locationErrors.address}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="Latitude GPS"
                                        type="number"
                                        step="any"
                                        value={String(locationForm.latitude)}
                                        onChange={(e) => setLocationForm({ ...locationForm, latitude: Number(e.target.value) })}
                                        placeholder="-7.814257"
                                        error={locationErrors.latitude}
                                    />
                                    <Input
                                        label="Longitude GPS"
                                        type="number"
                                        step="any"
                                        value={String(locationForm.longitude)}
                                        onChange={(e) => setLocationForm({ ...locationForm, longitude: Number(e.target.value) })}
                                        placeholder="110.375944"
                                        error={locationErrors.longitude}
                                    />
                                </div>

                                <Input
                                    label="Radius Toleransi Geofence (Meter)"
                                    type="number"
                                    value={String(locationForm.radius_meters)}
                                    onChange={(e) => setLocationForm({ ...locationForm, radius_meters: Number(e.target.value) })}
                                    placeholder="100"
                                    error={locationErrors.radius_meters}
                                />

                                <div className="flex items-center justify-between p-4 border border-border rounded-xl bg-muted/20">
                                    <div>
                                        <div className="text-[14px] font-bold text-text-primary">Status Proteksi Geofencing</div>
                                        <div className="text-[12px] text-text-muted">Batasi presensi siswa hanya saat berada dalam radius GPS sekolah.</div>
                                    </div>
                                    <Toggle
                                        checked={locationForm.is_active}
                                        onChange={(e) => setLocationForm({ ...locationForm, is_active: e.target.checked })}
                                    />
                                </div>
                            </div>

                            {/* Right Column: Interactive Map Preview (6 Cols) */}
                            <div className="lg:col-span-6 flex flex-col gap-3">
                                <div className="text-[13px] font-bold text-text-primary flex items-center justify-between">
                                    <span>Preview Titik Peta (OpenStreetMap)</span>
                                    <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                                        Live Satellite Sync
                                    </span>
                                </div>
                                <MapPreview
                                    latitude={locationForm.latitude}
                                    longitude={locationForm.longitude}
                                    radiusMeters={locationForm.radius_meters}
                                />
                                <div className="flex items-center justify-between text-[12px] text-text-muted bg-muted/20 px-4 py-2.5 rounded-lg border border-border">
                                    <span className="flex items-center gap-2 font-medium">
                                        <i className="fas fa-crosshairs text-primary" />
                                        <span>GPS: {locationForm.latitude}, {locationForm.longitude}</span>
                                    </span>
                                    <span className="font-bold text-primary font-mono">Radius: {locationForm.radius_meters}m</span>
                                </div>
                            </div>
                        </div>
                    </form>
                </Card>
            </div>

            {/* Tab 3: Integrasi & API (Clean System Metrics & No Redundancy) */}
            <div className={`w-full ${activeTab === "integration" ? "block" : "hidden"}`}>
                <Card className="p-6 flex flex-col gap-6 font-inter">
                    <div className="flex items-center justify-between pb-4 border-b border-border">
                        <div>
                            <h2 className="text-[16px] font-bold text-primary flex items-center gap-2">
                                <i className="fas fa-server text-primary text-[16px]" />
                                System Engine & Service Health (smauii-core)
                            </h2>
                            <p className="text-[12px] text-text-muted mt-0.5">
                                Status kesehatan backend engine, penyimpanan cloud, dan gateway notifikasi.
                            </p>
                        </div>
                        <span className="px-3.5 py-1.5 rounded-full text-[12px] font-bold bg-success-bg text-success border border-success/20">
                            <i className="fas fa-check-circle mr-1.5" />
                            Engine Operational & Healthy
                        </span>
                    </div>

                    {/* System Tech Stack Info Strip (Sleek Horizontal Bar) */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="border border-border rounded-xl p-3.5 bg-muted/20 flex flex-col justify-between">
                            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Engine App</span>
                            <span className="text-[14px] font-extrabold text-primary mt-1 font-mono">{systemInfo.appName}</span>
                        </div>
                        <div className="border border-border rounded-xl p-3.5 bg-muted/20 flex flex-col justify-between">
                            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Engine Version</span>
                            <span className="text-[14px] font-extrabold text-primary mt-1 font-mono">v{systemInfo.version}</span>
                        </div>
                        <div className="border border-border rounded-xl p-3.5 bg-muted/20 flex flex-col justify-between">
                            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Environment</span>
                            <span className="text-[14px] font-extrabold text-emerald-600 mt-1 uppercase font-mono">{systemInfo.environment}</span>
                        </div>
                        <div className="border border-border rounded-xl p-3.5 bg-muted/20 flex flex-col justify-between">
                            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Storage Driver</span>
                            <span className="text-[14px] font-extrabold text-primary mt-1 uppercase font-mono">{systemInfo.storageDriver}</span>
                        </div>
                    </div>

                    {/* Integration Services List */}
                    <div className="flex flex-col gap-4 pt-2 border-t border-border">
                        <h3 className="text-[14px] font-bold text-text-primary flex items-center gap-2">
                            <i className="fab fa-whatsapp text-emerald-500 text-[16px]" />
                            Gateway Notifikasi WhatsApp (WA Orang Tua & Wali)
                        </h3>
                        <div className="flex items-center justify-between p-4 border border-border rounded-xl bg-surface shadow-xs">
                            <div>
                                <div className="text-[14px] font-bold text-text-primary">Status Gateway Notifikasi Real-time</div>
                                <div className="text-[12px] text-text-muted">Mengirimkan notifikasi presensi otomatis langsung ke WhatsApp orang tua/wali siswa.</div>
                            </div>
                            <span className="px-3.5 py-1.5 rounded-full text-[12px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-300 shrink-0">
                                {systemInfo.waGatewayStatus} (Connected)
                            </span>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Tab 4: Keamanan System (Full Width & Clean Settings Grid) */}
            <div className={`w-full ${activeTab === "security" ? "block" : "hidden"}`}>
                <Card className="p-6">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6 font-inter">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                            <div>
                                <h2 className="text-[16px] font-bold text-primary flex items-center gap-2">
                                    <i className="fas fa-lock text-primary text-[16px]" />
                                    Preferensi Keamanan & Akses Sistem Core
                                </h2>
                                <p className="text-[12px] text-text-muted mt-0.5">
                                    Pengaturan batas waktu sesi inaktif, tampilan limit data, dan mode pemeliharaan sistem.
                                </p>
                            </div>
                            <Button type="submit" loading={processing} variant="primary" className="shrink-0">
                                <i className="fas fa-shield-alt mr-1.5" />
                                Simpan Preferensi Keamanan
                            </Button>
                        </div>

                        {/* Security Toggles */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center justify-between p-4 border border-border rounded-xl bg-muted/20">
                                <div>
                                    <div className="text-[14px] font-bold text-text-primary">Mode Pemeliharaan (Maintenance)</div>
                                    <div className="text-[12px] text-text-muted">Kunci akses aplikasi web & mobile untuk perbaikan berkala.</div>
                                </div>
                                <Toggle
                                    checked={data.maintenanceMode}
                                    onChange={(e) => setData("maintenanceMode", e.target.checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 border border-border rounded-xl bg-muted/20">
                                <div>
                                    <div className="text-[14px] font-bold text-text-primary">Wajibkan Multi-Factor Authentication (MFA)</div>
                                    <div className="text-[12px] text-text-muted">Wajibkan OTP untuk akun Administrator dan Kepala Sekolah.</div>
                                </div>
                                <Toggle
                                    checked={data.mfaEnforced}
                                    onChange={(e) => setData("mfaEnforced", e.target.checked)}
                                />
                            </div>
                        </div>

                        {/* Pagination & Session Limits */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-border/60">
                            <div>
                                <label className="block text-[13px] font-semibold text-text-primary mb-1.5">
                                    Jumlah Baris Data per Halaman (Default Limit)
                                </label>
                                <NativeSelect
                                    value={String(data.defaultPageLimit)}
                                    onChange={(e) => setData("defaultPageLimit", Number(e.target.value))}
                                >
                                    <option value="10">10 Baris</option>
                                    <option value="25">25 Baris</option>
                                    <option value="50">50 Baris</option>
                                    <option value="100">100 Baris</option>
                                </NativeSelect>
                            </div>

                            <Input
                                label="Batas Waktu Sesi Inaktif (Menit)"
                                type="number"
                                value={String(data.sessionTimeoutMinutes)}
                                onChange={(e) => setData("sessionTimeoutMinutes", Number(e.target.value))}
                                error={errors.sessionTimeoutMinutes}
                            />
                        </div>

                        {/* Section 3: Preferensi Posisi Notifikasi (Toast) */}
                        <div className="flex flex-col gap-4 pt-4 border-t border-border/60">
                            <div>
                                <h3 className="text-[14px] font-bold text-text-primary flex items-center gap-2">
                                    <i className="fas fa-bell text-primary text-[14px]" />
                                    Posisi Notifikasi Sistem (Toaster Notification)
                                </h3>
                                <p className="text-[12px] text-text-muted mt-0.5">
                                    Tentukan sudut layar default untuk menampilkan pesan pop-up notifikasi (sukses, error, informasi).
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-end">
                                <div>
                                    <label className="block text-[13px] font-semibold text-text-primary mb-1.5">
                                        Pilih Posisi Pop-up Notifikasi
                                    </label>
                                    <NativeSelect
                                        value={toastPosition}
                                        onChange={(e) => {
                                            const newPos = e.target.value as ToastPosition;
                                            setToastPositionState(newPos);
                                            setSavedToastPosition(newPos);
                                            toast.success(`Posisi notifikasi diatur ke: ${newPos}`);
                                        }}
                                    >
                                        <option value="bottom-right">Pojok Kanan Bawah (Default)</option>
                                        <option value="bottom-left">Pojok Kiri Bawah</option>
                                        <option value="top-right">Pojok Kanan Atas</option>
                                        <option value="top-left">Pojok Kiri Atas</option>
                                        <option value="bottom-center">Bawah Tengah</option>
                                        <option value="top-center">Atas Tengah</option>
                                    </NativeSelect>
                                </div>

                                <div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            toast.success("Ini adalah pratinjau pesan notifikasi berhasil di posisi yang Anda pilih!");
                                        }}
                                        className="w-full sm:w-auto h-10 font-bold"
                                    >
                                        <i className="fas fa-play text-[11px] mr-1.5" />
                                        Uji Coba Posisi Notifikasi
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </form>
                </Card>
            </div>
        </AppShell>
    );
}
