import { useState, useRef } from "react";
import { router } from "@inertiajs/react";
import AppShell from "@/Layouts/AppShell";
import { Button, Input } from "@/Components";
import {
    FiUploadCloud,
    FiCheckCircle,
    FiAlertCircle,
    FiDownload,
    FiKey,
    FiFileText,
    FiX,
} from "react-icons/fi";
import type { ImportEntityType } from "@/Components/features/ImportModal";

interface MobileImportPageProps {
    tab: "students" | "teachers" | "class" | "guardians";
}

export default function MobileImportPage({ tab }: MobileImportPageProps) {
    const entityMap: Record<string, ImportEntityType> = {
        students: "students",
        teachers: "teachers",
        class: "classes",
        guardians: "guardians",
    };

    const entity = entityMap[tab] ?? "students";

    const entityLabels: Record<ImportEntityType, string> = {
        students: "Siswa",
        teachers: "Guru",
        classes: "Kelas",
        guardians: "Wali Murid",
    };

    const entityLabel = entityLabels[entity] ?? "Data";
    const supportsPassword = entity !== "classes";

    const [file, setFile] = useState<File | null>(null);
    const [defaultPassword, setDefaultPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{
        success_count: number;
        error_count: number;
        errors: string[];
        success: string[];
    } | null>(null);

    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected) setFile(selected);
    };

    const handleImport = async () => {
        if (!file) return;

        setLoading(true);
        setResult(null);

        const formData = new FormData();
        formData.append("file", file);
        if (supportsPassword && defaultPassword.trim()) {
            formData.append("default_password", defaultPassword.trim());
        }

        const token = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;

        try {
            const res = await fetch(`/master-data/import/${entity}`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    ...(token ? { "X-CSRF-TOKEN": token } : {}),
                },
                body: formData,
                credentials: "same-origin",
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                setResult({
                    success_count: 0,
                    error_count: 1,
                    errors: [errData.message || "Gagal memproses file import. Pastikan format kolom sesuai."],
                    success: [],
                });
                return;
            }

            const data = await res.json();
            setResult(data);
        } catch {
            setResult({
                success_count: 0,
                error_count: 1,
                errors: ["Gagal mengunggah file ke server. Periksa koneksi internet Anda."],
                success: [],
            });
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setFile(null);
        setDefaultPassword("");
        setResult(null);
        setLoading(false);
    };

    const handleBack = () => {
        router.visit(`/master-data?tab=${tab}`);
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const supportedColumns: Record<ImportEntityType, string[]> = {
        students: [
            "nis",
            "nisn",
            "name",
            "class",
            "birth_date",
            "phone",
            "address",
            "enrollment_year",
            "email",
            "password",
        ],
        teachers: ["teacher_code", "name", "email", "password", "teacher_type"],
        classes: ["name", "level", "capacity", "homeroom_teacher"],
        guardians: ["name", "phone", "address", "email", "password"],
    };

    return (
        <AppShell
            title={`Import Data ${entityLabel}`}
            onBack={handleBack}
            showNotificationBellOnMobile={false}
            showBottomNav={false}
        >
            <div className="w-full font-inter max-w-xl mx-auto space-y-4 pb-24">
                {/* Result Summary Screen */}
                {result ? (
                    <div className="space-y-4 pt-2">
                        <div className="p-6 bg-surface border border-border rounded-2xl shadow-xs text-center space-y-3">
                            {result.success_count > 0 ? (
                                <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                                    <FiCheckCircle className="w-9 h-9" />
                                </div>
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-danger/10 text-danger flex items-center justify-center mx-auto">
                                    <FiAlertCircle className="w-9 h-9" />
                                </div>
                            )}

                            <div>
                                <h3 className="text-[16px] font-bold text-text-primary">
                                    {result.success_count > 0
                                        ? `Import Data ${entityLabel} Berhasil`
                                        : "Gagal Mengimport Data"}
                                </h3>
                                <p className="text-[12.5px] text-text-muted mt-1">
                                    {result.success_count > 0
                                        ? `${result.success_count} data ${entityLabel.toLowerCase()} berhasil dimasukkan ke sistem.`
                                        : "Terjadi kesalahan saat memproses data spreadsheet."}
                                </p>
                            </div>

                            {/* Stat Badge Pair */}
                            <div className="grid grid-cols-2 gap-2 pt-2">
                                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                                    <span className="block text-[10.5px] font-bold text-emerald-700 uppercase tracking-wide">
                                        Berhasil
                                    </span>
                                    <span className="text-[18px] font-extrabold text-emerald-600">
                                        {result.success_count}
                                    </span>
                                </div>
                                <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-center">
                                    <span className="block text-[10.5px] font-bold text-danger uppercase tracking-wide">
                                        Gagal
                                    </span>
                                    <span className="text-[18px] font-extrabold text-danger">
                                        {result.error_count}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Errors Details Box */}
                        {result.errors.length > 0 && (
                            <div className="p-4 rounded-2xl border border-danger/30 bg-danger/5 space-y-2">
                                <div className="flex items-center gap-2 text-danger font-bold text-[13px]">
                                    <FiAlertCircle className="text-[15px]" />
                                    <span>Rincian Kesalahan ({result.errors.length})</span>
                                </div>
                                <ul className="text-[12px] text-danger space-y-1 pl-4 list-disc max-h-48 overflow-y-auto">
                                    {result.errors.map((err, idx) => (
                                        <li key={idx}>{err}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex flex-col gap-2 pt-2">
                            <Button variant="primary" onClick={handleBack} className="w-full h-12 text-[14px] font-bold rounded-xl shadow-md">
                                Selesai & Kembali ke Master Data
                            </Button>
                            <Button variant="secondary" onClick={handleReset} className="w-full h-11 text-[13px] font-bold rounded-xl">
                                Import File Lainnya
                            </Button>
                        </div>
                    </div>
                ) : (
                    /* Main Upload Form Screen */
                    <div className="space-y-4 pt-1">
                        {/* Download Template Action Card */}
                        <div className="p-3.5 bg-surface border border-border rounded-2xl flex items-center justify-between gap-3 shadow-xs">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                    <FiDownload className="text-[17px]" />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="text-[13px] font-bold text-text-primary leading-snug">
                                        Template Spreadsheet
                                    </h4>
                                    <p className="text-[11px] text-text-muted">Unduh format kolom {entityLabel.toLowerCase()}</p>
                                </div>
                            </div>
                            <a
                                href={`/master-data/import/template/${entity}`}
                                download
                                className="h-8 px-3 rounded-lg bg-primary/10 text-primary text-[11.5px] font-bold hover:bg-primary/20 transition-all flex items-center gap-1 shrink-0 border border-primary/20 active:scale-95"
                            >
                                <FiDownload className="text-[12px]" />
                                <span>Unduh</span>
                            </a>
                        </div>

                        {/* Touch File Upload Section */}
                        <div className="space-y-1.5">
                            <label className="text-[11.5px] font-bold text-text-secondary uppercase tracking-wider px-0.5">
                                File Spreadsheet (.xlsx, .csv) <span className="text-danger">*</span>
                            </label>
                            <input
                                ref={inputRef}
                                type="file"
                                accept=".xlsx,.xls,.csv,.txt"
                                onChange={handleFileSelect}
                                className="hidden"
                            />

                            {!file ? (
                                <div
                                    onClick={() => inputRef.current?.click()}
                                    className="p-5 bg-surface border-2 border-dashed border-primary/30 hover:border-primary/60 hover:bg-primary/5 rounded-2xl text-center cursor-pointer transition-all active:scale-[0.99] flex flex-col items-center justify-center gap-2 select-none"
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                                        <FiUploadCloud className="text-[22px]" />
                                    </div>
                                    <div>
                                        <p className="text-[13.5px] font-bold text-text-primary">
                                            Pilih File Dari Perangkat
                                        </p>
                                        <p className="text-[11px] text-text-muted mt-0.5">
                                            Format .xlsx, .csv (Maks 10MB)
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-3.5 bg-surface border border-primary/30 rounded-2xl flex items-center justify-between gap-3 shadow-xs">
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shrink-0">
                                            <FiFileText className="text-[18px]" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[13px] font-bold text-text-primary truncate">
                                                {file.name}
                                            </p>
                                            <p className="text-[11px] text-text-muted">
                                                {formatFileSize(file.size)}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFile(null)}
                                        className="w-8 h-8 rounded-full hover:bg-danger/10 text-text-muted hover:text-danger flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                                        title="Hapus berkas"
                                    >
                                        <FiX className="text-[16px]" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Default Password Option Input */}
                        {supportsPassword && (
                            <div className="space-y-1.5 pt-1">
                                <label className="text-[11.5px] font-bold text-text-secondary uppercase tracking-wider px-0.5 flex items-center gap-1">
                                    <FiKey className="text-primary text-[13px]" />
                                    Default Kata Sandi Akun Baru (Opsional)
                                </label>
                                <Input
                                    type="text"
                                    value={defaultPassword}
                                    onChange={(e) => setDefaultPassword(e.target.value)}
                                    placeholder="Biarkan kosong untuk default sistem (SmaUii@2024)"
                                    className="h-11 text-[13px] rounded-xl bg-surface border border-border"
                                />
                                <p className="text-[11px] text-text-muted px-0.5 leading-relaxed">
                                    Diisi jika kata sandi di file kosong.
                                </p>
                            </div>
                        )}

                        {/* Supported Column Format Info List */}
                        <div className="space-y-2 pt-2">
                            <span className="text-[11.5px] font-bold text-text-muted uppercase tracking-wider px-0.5">
                                Kolom yang didukung:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                                {(supportedColumns[entity] || []).map((col) => (
                                    <span
                                        key={col}
                                        className="px-2.5 py-0.5 rounded-lg text-[11px] font-mono bg-muted font-bold text-text-secondary border border-border"
                                    >
                                        {col}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Single Full-Width Mobile Action Bar */}
                        <div className="fixed bottom-0 left-0 right-0 p-3 bg-surface/95 backdrop-blur-md border-t border-border/80 z-30 font-inter">
                            <div className="max-w-xl mx-auto">
                                <Button
                                    type="button"
                                    variant="primary"
                                    disabled={!file || loading}
                                    onClick={handleImport}
                                    className="w-full h-12 text-[14px] font-bold rounded-xl shadow-md"
                                >
                                    {loading ? "Memproses Import..." : `Import Data ${entityLabel}`}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppShell>
    );
}
