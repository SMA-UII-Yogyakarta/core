import { router, useForm, usePage } from "@inertiajs/react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import {
    FiBell,
    FiBookOpen,
    FiCheck,
    FiChevronRight,
    FiCpu,
    FiCrosshair,
    FiLock,
    FiMapPin,
    FiMessageCircle,
    FiPlay,
    FiSave,
    FiServer,
    FiShield,
} from "react-icons/fi";
import { MapPreview } from "@/Components/common/MapPreview";
import MobileSectionHeader from "@/Components/common/MobileSectionHeader";
import TabSwitcher from "@/Components/common/TabSwitcher";
import { getSavedToastPosition, setSavedToastPosition, type ToastPosition, toast } from "@/Components/common/Toast";
import Button from "@/Components/ui/Button";
import Card from "@/Components/ui/Card";
import Input from "@/Components/ui/Input";
import NativeSelect from "@/Components/ui/NativeSelect";
import PageHeader from "@/Components/ui/PageHeader";
import Toggle from "@/Components/ui/Toggle";
import AppShell from "@/Layouts/AppShell";
import { locationSettingSchema } from "@/schemas/locationSetting.schema";
import { validateForm } from "@/utils/zodHelper";
import AgentIntegrationSection from "./Sections/AgentIntegrationSection";

// ─── Types ────────────────────────────────────────────────────────────────────

type SettingTab = "identity" | "location" | "integration" | "security";

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

// ─── Shared Styles & Helper Mappings ──────────────────────────────────────────

const textareaClass =
    "w-full rounded-lg border border-border bg-surface px-3.5 py-2 text-[14px] text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary font-inter resize-none";

const VALID_TABS: Record<string, SettingTab> = {
    identity: "identity",
    location: "location",
    integration: "integration",
    security: "security",
};

const getInitialTabFromUrl = (): SettingTab | null => {
    if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get("tab");
        if (tab && VALID_TABS[tab]) {
            return VALID_TABS[tab];
        }
    }
    return null;
};

// ─── Sub-Components ───────────────────────────────────────────────────────────

function SettingToggleRow({
    label,
    description,
    checked,
    onChange,
}: {
    label: string;
    description: string;
    checked: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
    return (
        <div className="flex items-center justify-between p-4 border border-border rounded-xl bg-muted/20">
            <div className="mr-4">
                <div className="text-[14px] font-bold text-text-primary">{label}</div>
                <div className="text-[12px] text-text-muted mt-0.5">{description}</div>
            </div>
            <Toggle checked={checked} onChange={onChange} />
        </div>
    );
}

function CardSectionHeader({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
    return (
        <div className="pb-4 border-b border-border font-inter hidden sm:block">
            <h2 className="text-[16px] font-bold text-primary flex items-center gap-2">
                {icon}
                {title}
            </h2>
            <p className="text-[12px] text-text-muted mt-0.5">{description}</p>
        </div>
    );
}

// ─── Hub Menu Items (Mobile view) ─────────────────────────────────────────────

const SETTING_MENU: {
    key: SettingTab;
    label: string;
    description: string;
    icon: (className?: string) => ReactNode;
    iconColor: string;
    iconBg: string;
}[] = [
    {
        key: "identity",
        label: "Identitas Sekolah",
        description: "Profil resmi institusi, NPSN, akreditasi & kontak",
        icon: (cls = "") => <FiBookOpen className={cls} />,
        iconColor: "text-primary",
        iconBg: "bg-primary/10",
    },
    {
        key: "location",
        label: "Lokasi & Geofence",
        description: "Koordinat GPS & radius toleransi presensi siswa",
        icon: (cls = "") => <FiMapPin className={cls} />,
        iconColor: "text-danger",
        iconBg: "bg-danger/10",
    },
    {
        key: "integration",
        label: "Integrasi & API",
        description: "Status engine, storage driver & gateway WhatsApp",
        icon: (cls = "") => <FiCpu className={cls} />,
        iconColor: "text-emerald-600",
        iconBg: "bg-emerald-500/10",
    },
    {
        key: "security",
        label: "Keamanan System",
        description: "MFA, session timeout, maintenance mode & notifikasi",
        icon: (cls = "") => <FiShield className={cls} />,
        iconColor: "text-amber-600",
        iconBg: "bg-amber-500/10",
    },
];

const SETTING_TABS = SETTING_MENU.map((item) => ({
    key: item.key,
    label: item.label,
    icon: item.icon("text-[14px]"),
}));

const TAB_TITLE: Record<SettingTab, string> = {
    identity: "Identitas Sekolah",
    location: "Lokasi & Geofence",
    integration: "Integrasi & API",
    security: "Keamanan System",
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SystemSettings({ systemInfo, locationSetting }: SystemSettingsProps) {
    const { url } = usePage();
    const initialUrlTab = getInitialTabFromUrl();
    const [desktopTab, setDesktopTab] = useState<SettingTab>(initialUrlTab ?? "identity");
    const [mobileSubPage, setMobileSubPage] = useState<SettingTab | null>(initialUrlTab);
    const [toastPosition, setToastPositionState] = useState<ToastPosition>(getSavedToastPosition);

    const [prevUrl, setPrevUrl] = useState(url);
    if (url !== prevUrl) {
        setPrevUrl(url);
        const query = url.includes("?") ? url.split("?")[1] : "";
        const params = new URLSearchParams(query);
        const tab = params.get("tab");
        if (tab && VALID_TABS[tab]) {
            const mapped = VALID_TABS[tab];
            setMobileSubPage(mapped);
            setDesktopTab(mapped);
        } else if (!tab) {
            setMobileSubPage(null);
        }
    }

    useEffect(() => {
        const handlePopState = () => {
            if (typeof window !== "undefined") {
                const params = new URLSearchParams(window.location.search);
                const tab = params.get("tab");
                if (tab && VALID_TABS[tab]) {
                    const mapped = VALID_TABS[tab];
                    setMobileSubPage(mapped);
                    setDesktopTab(mapped);
                } else {
                    setMobileSubPage(null);
                }
            }
        };

        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, []);

    const handleDesktopTabChange = (key: SettingTab) => {
        setDesktopTab(key);
        if (typeof window !== "undefined") {
            window.history.replaceState({ tab: key }, "", `/settings?tab=${key}`);
        }
    };

    const handleOpenMobileSubPage = (key: SettingTab) => {
        setMobileSubPage(key);
        setDesktopTab(key);
        if (typeof window !== "undefined") {
            window.history.pushState({ tab: key }, "", `/settings?tab=${key}`);
        }
    };

    const handleMobileBackToHub = () => {
        setMobileSubPage(null);
        if (typeof window !== "undefined") {
            window.history.pushState({ tab: null }, "", "/settings");
        }
    };

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
        post("/settings", { preserveState: true, preserveScroll: true });
    };

    const handleSaveLocation = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setLocationErrors({});
        const valid = validateForm(locationSettingSchema, locationForm);
        if (!valid.success) {
            setLocationErrors(valid.errors as Record<string, string>);
            return;
        }
        setSavingLocation(true);
        router.post(
            "/settings/location-settings",
            locationForm as unknown as Record<string, string | number | boolean>,
            { preserveState: true, preserveScroll: true, onFinish: () => setSavingLocation(false) },
        );
    };

    // Mobile AppShell title
    const mobileTitle = mobileSubPage ? TAB_TITLE[mobileSubPage] : "Pengaturan Sistem";

    // ── Tab Content Panels ────────────────────────────────────────────────────

    const IdentityPanel = (
        <Card className="max-sm:border-0 max-sm:bg-transparent max-sm:p-0 max-sm:shadow-none max-sm:rounded-none p-5 sm:p-6 font-inter">
            <form id="mobile-settings-identity-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
                <CardSectionHeader
                    icon={<FiBookOpen className="text-primary text-[16px]" />}
                    title="Profil & Identitas Resmi Institusi Sekolah"
                    description="Informasi resmi SMA UII Yogyakarta yang digunakan pada kop laporan, sertifikat, dan metadata sistem."
                />

                <MobileSectionHeader
                    title="Profil & Identitas Resmi"
                    description="Informasi resmi SMA UII Yogyakarta yang digunakan pada kop laporan, sertifikat, dan cetak dokumen."
                />

                <div className="bg-surface border border-border rounded-2xl p-4 sm:p-0 sm:border-0 sm:bg-transparent shadow-card sm:shadow-none flex flex-col gap-4 font-inter">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
                                Tahun Akademik & Semester Aktif
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3 border-t border-border/60">
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
                                className={textareaClass}
                                placeholder="Jl. Sorowajan Baru No. 12, Banguntapan, Bantul, DIY"
                            />
                            {errors.address && <p className="text-[12px] text-danger mt-1">{errors.address}</p>}
                        </div>
                    </div>
                </div>

                {/* Single Bottom Save Button */}
                <div className="hidden sm:flex items-center justify-end pt-4 border-t border-border/60">
                    <Button
                        type="submit"
                        loading={processing}
                        variant="primary"
                        className="w-full sm:w-auto h-10 px-6 font-bold text-[13px] shadow-xs rounded-xl"
                    >
                        <FiSave className="mr-2 text-[14px]" />
                        Simpan Identitas Sekolah
                    </Button>
                </div>
            </form>
        </Card>
    );

    const LocationPanel = (
        <Card className="max-sm:border-0 max-sm:bg-transparent max-sm:p-0 max-sm:shadow-none max-sm:rounded-none p-5 sm:p-6 font-inter">
            <form id="mobile-settings-location-form" onSubmit={handleSaveLocation} className="flex flex-col gap-5">
                <CardSectionHeader
                    icon={<FiMapPin className="text-[16px] text-danger" />}
                    title="Titik Lokasi Utama & Radius Geofencing Presensi"
                    description="Atur koordinat GPS pusat gedung sekolah dan batas jarak (radius) maksimal siswa melakukan presensi selfie."
                />

                <MobileSectionHeader
                    title="Titik Lokasi & Radius Geofence"
                    description="Atur koordinat GPS pusat gedung sekolah dan radius maksimal siswa dapat melakukan presensi."
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-6 flex flex-col gap-4 bg-surface border border-border rounded-2xl p-4 sm:p-0 sm:border-0 sm:bg-transparent shadow-card sm:shadow-none">
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
                                className={textareaClass}
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
                                onChange={(e) =>
                                    setLocationForm({ ...locationForm, longitude: Number(e.target.value) })
                                }
                                placeholder="110.375944"
                                error={locationErrors.longitude}
                            />
                        </div>
                        <Input
                            label="Radius Toleransi Geofence (Meter)"
                            type="number"
                            value={String(locationForm.radius_meters)}
                            onChange={(e) =>
                                setLocationForm({ ...locationForm, radius_meters: Number(e.target.value) })
                            }
                            placeholder="100"
                            error={locationErrors.radius_meters}
                        />
                        <SettingToggleRow
                            label="Status Proteksi Geofencing"
                            description="Batasi presensi siswa hanya saat berada dalam radius GPS sekolah."
                            checked={locationForm.is_active}
                            onChange={(e) => setLocationForm({ ...locationForm, is_active: e.target.checked })}
                        />
                    </div>

                    <div className="lg:col-span-6 flex flex-col gap-3 bg-surface border border-border rounded-2xl p-4 sm:p-0 sm:border-0 sm:bg-transparent shadow-card sm:shadow-none">
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
                                <FiCrosshair className="text-primary text-[14px]" />
                                <span>
                                    GPS: {locationForm.latitude}, {locationForm.longitude}
                                </span>
                            </span>
                            <span className="font-bold text-primary font-mono">
                                Radius: {locationForm.radius_meters}m
                            </span>
                        </div>
                    </div>
                </div>

                {/* Single Bottom Save Button */}
                <div className="hidden sm:flex items-center justify-end pt-4 border-t border-border/60">
                    <Button
                        type="submit"
                        loading={savingLocation}
                        variant="success"
                        className="w-full sm:w-auto h-10 px-6 font-bold text-[13px] shadow-xs rounded-xl"
                    >
                        <FiCheck className="mr-2 text-[14px]" />
                        Simpan Lokasi Presensi
                    </Button>
                </div>
            </form>
        </Card>
    );

    const IntegrationPanel = (
        <Card className="max-sm:border-0 max-sm:bg-transparent max-sm:p-0 max-sm:shadow-none max-sm:rounded-none p-5 sm:p-6 flex flex-col gap-5 font-inter">
            <CardSectionHeader
                icon={<FiServer className="text-primary text-[16px]" />}
                title="System Engine & Service Health (smauii-core)"
                description="Status kesehatan backend engine, penyimpanan cloud, dan gateway notifikasi."
            />

            <MobileSectionHeader
                title="System Engine & Service Health"
                description="Status kesehatan backend engine, storage driver, dan gateway WhatsApp."
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                {[
                    { label: "Engine App", value: systemInfo.appName, color: "text-primary" },
                    { label: "Engine Version", value: `v${systemInfo.version}`, color: "text-primary" },
                    { label: "Environment", value: systemInfo.environment, color: "text-emerald-600" },
                    { label: "Storage Driver", value: systemInfo.storageDriver, color: "text-primary" },
                ].map((item) => (
                    <div
                        key={item.label}
                        className="border border-border rounded-2xl p-3.5 bg-surface sm:bg-muted/20 shadow-xs sm:shadow-none flex flex-col gap-1"
                    >
                        <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
                            {item.label}
                        </span>
                        <span className={`text-[14px] font-extrabold mt-0.5 uppercase font-mono ${item.color}`}>
                            {item.value}
                        </span>
                    </div>
                ))}
            </div>

            <div className="flex flex-col gap-3.5 pt-2 border-t border-border/60">
                <h3 className="text-[14px] font-bold text-text-primary flex items-center gap-2">
                    <FiMessageCircle className="text-emerald-500 text-[16px]" />
                    Gateway Notifikasi WhatsApp (WA Orang Tua & Wali)
                </h3>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-border rounded-2xl bg-surface shadow-card sm:shadow-xs gap-3">
                    <div>
                        <div className="text-[14px] font-bold text-text-primary">
                            Status Gateway Notifikasi Real-time
                        </div>
                        <div className="text-[12px] text-text-muted mt-0.5">
                            Mengirimkan notifikasi presensi otomatis langsung ke WhatsApp orang tua/wali siswa.
                        </div>
                    </div>
                    <span className="px-3.5 py-1.5 rounded-full text-[12px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-300 shrink-0 self-start sm:self-auto">
                        {systemInfo.waGatewayStatus} (Connected)
                    </span>
                </div>
            </div>

            {/* Universal AI Agent Integration & Onboarding (Hermes Agent / OpenClaw) */}
            <AgentIntegrationSection />
        </Card>
    );

    const SecurityPanel = (
        <Card className="max-sm:border-0 max-sm:bg-transparent max-sm:p-0 max-sm:shadow-none max-sm:rounded-none p-5 sm:p-6 font-inter">
            <form id="mobile-settings-security-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
                <CardSectionHeader
                    icon={<FiLock className="text-primary text-[16px]" />}
                    title="Preferensi Keamanan & Akses Sistem Core"
                    description="Pengaturan batas waktu sesi inaktif, tampilan limit data, dan mode pemeliharaan sistem."
                />

                <MobileSectionHeader
                    title="Preferensi Keamanan System"
                    description="Pengaturan batas waktu sesi inaktif, limit data per halaman, dan mode pemeliharaan sistem."
                />

                <div className="bg-surface border border-border rounded-2xl p-4 sm:p-0 sm:border-0 sm:bg-transparent shadow-card sm:shadow-none flex flex-col gap-4 font-inter">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SettingToggleRow
                            label="Mode Pemeliharaan (Maintenance)"
                            description="Kunci akses aplikasi web & mobile untuk perbaikan berkala."
                            checked={data.maintenanceMode}
                            onChange={(e) => setData("maintenanceMode", e.target.checked)}
                        />
                        <SettingToggleRow
                            label="Wajibkan Multi-Factor Authentication (MFA)"
                            description="Wajibkan OTP untuk akun Administrator dan Kepala Sekolah."
                            checked={data.mfaEnforced}
                            onChange={(e) => setData("mfaEnforced", e.target.checked)}
                        />
                    </div>

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

                    <div className="flex flex-col gap-4 pt-4 border-t border-border/60">
                        <div>
                            <h3 className="text-[14px] font-bold text-text-primary flex items-center gap-2">
                                <FiBell className="text-primary text-[14px]" />
                                Posisi Notifikasi Sistem (Toaster Notification)
                            </h3>
                            <p className="text-[12px] text-text-muted mt-0.5">
                                Tentukan sudut layar default untuk menampilkan pesan pop-up notifikasi.
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
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                    toast.success(
                                        "Ini adalah pratinjau pesan notifikasi berhasil di posisi yang Anda pilih!",
                                    )
                                }
                                className="w-full sm:w-auto h-10 font-bold"
                            >
                                <FiPlay className="text-[12px] mr-1.5" />
                                Uji Coba Posisi Notifikasi
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Single Bottom Save Button */}
                <div className="hidden sm:flex items-center justify-end pt-4 border-t border-border/60">
                    <Button
                        type="submit"
                        loading={processing}
                        variant="primary"
                        className="w-full sm:w-auto h-10 px-6 font-bold text-[13px] shadow-xs rounded-xl"
                    >
                        <FiShield className="mr-2 text-[14px]" />
                        Simpan Preferensi Keamanan
                    </Button>
                </div>
            </form>
        </Card>
    );

    const PANELS: Record<SettingTab, ReactNode> = {
        identity: IdentityPanel,
        location: LocationPanel,
        integration: IntegrationPanel,
        security: SecurityPanel,
    };

    return (
        <AppShell
            title={mobileTitle}
            onBack={mobileSubPage ? handleMobileBackToHub : undefined}
            showNotificationBell={mobileSubPage === null}
            showBottomNav={mobileSubPage === null}
        >
            {/* ── MOBILE LAYOUT (< sm) ─────────────────────────────────────── */}

            {/* Mobile Hub — shown when no subpage selected */}
            {!mobileSubPage && (
                <div className="sm:hidden flex flex-col font-inter">
                    <p className="text-[13px] text-text-muted mb-4 leading-relaxed">
                        Kelola konfigurasi identitas sekolah, titik lokasi presensi GPS, status integrasi engine, serta
                        preferensi keamanan sistem SMA UII Core.
                    </p>
                    <div className="flex flex-col rounded-2xl border border-border bg-surface overflow-hidden shadow-xs divide-y divide-border">
                        {SETTING_MENU.map((item) => (
                            <button
                                key={item.key}
                                type="button"
                                onClick={() => handleOpenMobileSubPage(item.key)}
                                className="flex items-center gap-4 px-4 py-4 text-left hover:bg-muted/30 active:bg-muted/50 transition-colors cursor-pointer w-full group"
                            >
                                <div
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.iconBg} transition-transform group-active:scale-95`}
                                >
                                    {item.icon(`${item.iconColor} text-[18px]`)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-[14px] font-bold text-text-primary">{item.label}</div>
                                    <div className="text-[12px] text-text-muted mt-0.5 truncate">
                                        {item.description}
                                    </div>
                                </div>
                                <FiChevronRight className="text-text-muted text-[18px] shrink-0 group-hover:text-primary transition-colors" />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Mobile Subpage — dedicated full page when tab is chosen */}
            {mobileSubPage && (
                <div className={`sm:hidden font-inter ${mobileSubPage !== "integration" ? "pb-24" : "pb-8"}`}>
                    {PANELS[mobileSubPage]}
                </div>
            )}

            {/* 📱 Sticky Mobile Bottom Action Bar (Docked at bottom of screen, only in form subpages) */}
            {mobileSubPage === "identity" && (
                <div className="fixed bottom-0 left-0 right-0 p-3 bg-surface/95 backdrop-blur-md border-t border-border/80 z-30 sm:hidden">
                    <div className="max-w-xl mx-auto">
                        <Button
                            type="submit"
                            form="mobile-settings-identity-form"
                            loading={processing}
                            variant="primary"
                            size="lg"
                            className="w-full justify-center font-bold text-[14.5px] shadow-sm py-3"
                            icon={<FiSave className="text-[17px]" />}
                        >
                            Simpan Identitas Sekolah
                        </Button>
                    </div>
                </div>
            )}

            {mobileSubPage === "location" && (
                <div className="fixed bottom-0 left-0 right-0 p-3 bg-surface/95 backdrop-blur-md border-t border-border/80 z-30 sm:hidden">
                    <div className="max-w-xl mx-auto">
                        <Button
                            type="submit"
                            form="mobile-settings-location-form"
                            loading={savingLocation}
                            variant="success"
                            size="lg"
                            className="w-full justify-center font-bold text-[14.5px] shadow-sm py-3"
                            icon={<FiCheck className="text-[17px]" />}
                        >
                            Simpan Lokasi Presensi
                        </Button>
                    </div>
                </div>
            )}

            {mobileSubPage === "security" && (
                <div className="fixed bottom-0 left-0 right-0 p-3 bg-surface/95 backdrop-blur-md border-t border-border/80 z-30 sm:hidden">
                    <div className="max-w-xl mx-auto">
                        <Button
                            type="submit"
                            form="mobile-settings-security-form"
                            loading={processing}
                            variant="primary"
                            size="lg"
                            className="w-full justify-center font-bold text-[14.5px] shadow-sm py-3"
                            icon={<FiShield className="text-[17px]" />}
                        >
                            Simpan Preferensi Keamanan
                        </Button>
                    </div>
                </div>
            )}

            {/* ── DESKTOP / TABLET LAYOUT (>= sm) ─────────────────────────── */}
            <div className="hidden sm:block">
                {/* Page Header */}
                <PageHeader
                    title="Pengaturan Sistem Core Backend"
                    description="Kelola konfigurasi identitas sekolah, titik lokasi geofencing presensi, integrasi API, serta preferensi keamanan SMA UII Core."
                    className="hidden lg:flex shrink-0 mb-4"
                />

                {/* Tab Navigation (>= sm: Tablet & Desktop) */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 shrink-0 font-inter">
                    <div className="min-w-0 overflow-x-auto no-scrollbar">
                        <TabSwitcher
                            tabs={SETTING_TABS}
                            activeKey={desktopTab}
                            onChange={(key) => handleDesktopTabChange(key as SettingTab)}
                            variant="segmented"
                        />
                    </div>
                </div>

                {/* Tab Panels */}
                {(["identity", "location", "integration", "security"] as SettingTab[]).map((tab) => (
                    <div key={tab} className={desktopTab === tab ? "block" : "hidden"}>
                        {PANELS[tab]}
                    </div>
                ))}
            </div>
        </AppShell>
    );
}
