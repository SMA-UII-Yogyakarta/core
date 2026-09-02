import { useState, useRef } from "react";
import { FaFileUpload, FaCheckCircle, FaExclamationCircle, FaDownload, FaKey } from "react-icons/fa";
import Modal from "@/Components/common/Modal";
import Button from "@/Components/ui/Button";
import Input from "@/Components/ui/Input";

interface ImportResult {
    success_count: number;
    error_count: number;
    errors: string[];
    success: string[];
}

export type ImportEntityType = "students" | "teachers" | "classes" | "guardians";

interface ImportModalProps {
    open: boolean;
    onClose: () => void;
    entity: ImportEntityType;
}

export default function ImportModal({ open, onClose, entity }: ImportModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [defaultPassword, setDefaultPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ImportResult | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const entityLabels: Record<ImportEntityType, string> = {
        students: "Siswa",
        teachers: "Guru",
        classes: "Kelas",
        guardians: "Wali Murid",
    };

    const entityLabel = entityLabels[entity] ?? "Data";
    const supportsPassword = entity !== "classes";

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const dropped = e.dataTransfer.files[0];
        if (
            dropped &&
            (dropped.name.endsWith(".xlsx") ||
                dropped.name.endsWith(".xls") ||
                dropped.name.endsWith(".csv") ||
                dropped.name.endsWith(".txt"))
        ) {
            setFile(dropped);
        }
    };

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
                errors: ["Gagal mengunggah file ke server. Periksa koneksi dan coba lagi."],
                success: [],
            });
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setFile(null);
        setDefaultPassword("");
        setResult(null);
        setLoading(false);
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    const canImport = file && !loading && !result;

    return (
        <Modal open={open} onClose={handleClose} title={`Import Data ${entityLabel}`} width="md">
            {!result ? (
                <>
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[13px] text-text-secondary font-inter">
                            Unggah berkas spreadsheet (.xlsx, .xls, .csv)
                        </span>
                        <a
                            href={`/master-data/import/template/${entity}`}
                            download
                            className="inline-flex items-center gap-1.5 text-[12px] font-bold text-primary hover:underline"
                        >
                            <FaDownload className="text-[11px]" />
                            Unduh Template
                        </a>
                    </div>

                    <div
                        onDrop={handleDrop}
                        onDragOver={(e) => e.preventDefault()}
                        onClick={() => inputRef.current?.click()}
                        className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary transition-colors bg-surface-raised/50"
                    >
                        {file ? (
                            <div className="flex flex-col items-center gap-2">
                                <FaFileUpload className="w-8 h-8 text-primary" />
                                <p className="text-[14px] font-medium text-text-primary">{file.name}</p>
                                <p className="text-[12px] text-text-inactive">{(file.size / 1024).toFixed(1)} KB</p>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setFile(null);
                                    }}
                                    className="text-[12px] text-danger hover:underline mt-1 cursor-pointer"
                                    type="button"
                                >
                                    Hapus file
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2">
                                <FaFileUpload className="w-10 h-10 text-text-inactive" />
                                <p className="text-[14px] font-medium text-text-primary">
                                    Seret file ke sini atau klik untuk memilih
                                </p>
                                <p className="text-[12px] text-text-inactive">Format: .xlsx, .xls, .csv (maks 10MB)</p>
                            </div>
                        )}
                        <input
                            ref={inputRef}
                            type="file"
                            accept=".xlsx,.xls,.csv,.txt"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                    </div>

                    {supportsPassword && (
                        <div className="mt-4 p-3.5 bg-muted/20 border border-border rounded-xl space-y-1.5 font-inter">
                            <label className="text-[12px] font-bold text-text-primary flex items-center gap-1.5">
                                <FaKey className="text-primary text-[11px]" />
                                Default Kata Sandi Akun Baru (Opsional)
                            </label>
                            <Input
                                type="text"
                                value={defaultPassword}
                                onChange={(e) => setDefaultPassword(e.target.value)}
                                placeholder="Biarkan kosong untuk default sistem (cth: SmaUii@2024)"
                                className="h-9 text-[13px]"
                            />
                            <p className="text-[11px] text-text-muted">
                                Kolom kata sandi pada file spreadsheet akan diprioritaskan. Jika kosong, kata sandi ini yang akan diterapkan.
                            </p>
                        </div>
                    )}

                    <div className="mt-4 p-3.5 bg-surface-raised border border-border rounded-xl text-[12px] text-text-secondary font-inter">
                        <p className="font-bold text-text-primary mb-1">Format kolom yang didukung:</p>
                        {entity === "students" && (
                            <p>
                                <code>nis, nisn, name, class, birth_date, phone, address, enrollment_year, email, password</code>
                            </p>
                        )}
                        {entity === "teachers" && (
                            <p>
                                <code>teacher_code, name, email, teacher_type, password</code>
                            </p>
                        )}
                        {entity === "classes" && (
                            <p>
                                <code>name, level, academic_year, capacity, teacher_code</code>
                            </p>
                        )}
                        {entity === "guardians" && (
                            <p>
                                <code>name, phone, address, email, username, password</code>
                            </p>
                        )}
                        <p className="mt-1.5 text-[11px] text-text-inactive">
                            Baris pertama harus berisi judul kolom di atas.
                        </p>
                    </div>

                    <div className="flex items-center justify-end gap-3 mt-5 pt-4 border-t border-border">
                        <Button variant="ghost" onClick={handleClose}>
                            Batal
                        </Button>
                        <Button onClick={handleImport} loading={loading} disabled={!canImport}>
                            Mulai Import
                        </Button>
                    </div>
                </>
            ) : (
                <div className="text-center py-4 font-inter">
                    {result.error_count === 0 ? (
                        <FaCheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
                    ) : (
                        <FaExclamationCircle className="w-12 h-12 text-warning mx-auto mb-3" />
                    )}
                    <p className="text-[16px] font-bold text-text-primary">
                        {result.success_count} data berhasil diimport
                    </p>
                    {result.error_count > 0 && (
                        <p className="text-[14px] text-danger mt-1">{result.error_count} data gagal</p>
                    )}
                    {result.errors.length > 0 && (
                        <div className="mt-4 text-left">
                            <p className="text-[13px] font-bold text-danger mb-1.5">Rincian Error:</p>
                            <div className="max-h-36 overflow-y-auto bg-danger-bg border border-danger/20 rounded-lg p-3">
                                {result.errors.map((err, i) => (
                                    <p key={i} className="text-[12px] text-danger mb-1">
                                        • {err}
                                    </p>
                                ))}
                            </div>
                        </div>
                    )}
                    {result.success.length > 0 && (
                        <div className="mt-4 text-left">
                            <p className="text-[13px] font-bold text-success mb-1.5">Data Berhasil Diimport:</p>
                            <div className="max-h-36 overflow-y-auto bg-success-bg border border-success/20 rounded-lg p-3">
                                {result.success.map((s, i) => (
                                    <p key={i} className="text-[12px] text-success mb-0.5">
                                        ✓ {s}
                                    </p>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="mt-6 flex justify-end">
                        <Button
                            onClick={() => {
                                reset();
                                onClose();
                                window.location.reload();
                            }}
                        >
                            Selesai & Muat Ulang
                        </Button>
                    </div>
                </div>
            )}
        </Modal>
    );
}
