import { useState, useRef } from "react";
import { FaFileUpload, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import Modal from "@/Components/Modal";
import Button from "@/Components/ui/Button";

interface ImportResult {
    success_count: number;
    error_count: number;
    errors: string[];
    success: string[];
}

interface ImportModalProps {
    open: boolean;
    onClose: () => void;
    entity: "students" | "teachers";
}

export default function ImportModal({ open, onClose, entity }: ImportModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ImportResult | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const entityLabel = entity === "students" ? "Siswa" : "Guru";

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const dropped = e.dataTransfer.files[0];
        if (dropped && (dropped.name.endsWith(".xlsx") || dropped.name.endsWith(".xls") || dropped.name.endsWith(".csv"))) {
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

        const token = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;

        try {
            const res = await fetch(`/api/import/${entity}`, {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    ...(token ? { "X-CSRF-TOKEN": token } : {}),
                },
                body: formData,
                credentials: "same-origin",
            });

            const data = await res.json();
            setResult(data);
        } catch {
            setResult({
                success_count: 0,
                error_count: 1,
                errors: ["Gagal mengunggah file. Coba lagi."],
                success: [],
            });
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setFile(null);
        setResult(null);
        setLoading(false);
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    const canImport = file && !loading && !result;

    return (
        <Modal open={open} onClose={handleClose} title={`Import ${entityLabel}`} width="md">
            {!result ? (
                <>
                    <div
                        onDrop={handleDrop}
                        onDragOver={(e) => e.preventDefault()}
                        onClick={() => inputRef.current?.click()}
                        className="border-2 border-dashed border-[#e2e8f0] rounded-lg p-8 text-center cursor-pointer hover:border-[#2e3391] transition-colors"
                    >
                        {file ? (
                            <div className="flex flex-col items-center gap-2">
                                <FaFileUpload className="w-8 h-8 text-[#2e3391]" />
                                <p className="text-[14px] font-medium text-[#1e293b]">{file.name}</p>
                                <p className="text-[12px] text-[#94a3b8]">{(file.size / 1024).toFixed(1)} KB</p>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                    className="text-[12px] text-[#ef4444] hover:underline mt-1"
                                    type="button"
                                >
                                    Hapus file
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2">
                                <FaFileUpload className="w-10 h-10 text-[#94a3b8]" />
                                <p className="text-[14px] text-[#64748b]">
                                    Seret file ke sini atau klik untuk memilih
                                </p>
                                <p className="text-[12px] text-[#94a3b8]">
                                    Format: .xlsx, .xls, .csv (maks 5MB)
                                </p>
                            </div>
                        )}
                        <input
                            ref={inputRef}
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                    </div>

                    <div className="mt-4 p-3 bg-[#f8fafc] rounded-lg text-[12px] text-[#64748b]">
                        <p className="font-medium mb-1">Format kolom yang didukung:</p>
                        {entity === "students" ? (
                            <p>nis, nisn, name/nama, class/kelas, email, phone/telepon, address/alamat, birth_date/tanggal lahir, enrollment_year/tahun masuk</p>
                        ) : (
                            <p>teacher_code/kode, name/nama, email</p>
                        )}
                        <p className="mt-1 text-[#94a3b8]">Baris pertama akan dibaca sebagai header.</p>
                    </div>

                    <div className="flex items-center justify-end gap-3 mt-5 pt-4 border-t border-[#e2e8f0]">
                        <Button variant="ghost" onClick={handleClose}>Batal</Button>
                        <Button onClick={handleImport} loading={loading} disabled={!canImport}>
                            Import Data
                        </Button>
                    </div>
                </>
            ) : (
                <div className="text-center py-4">
                    {result.error_count === 0 ? (
                        <FaCheckCircle className="w-12 h-12 text-[#22c55e] mx-auto mb-3" />
                    ) : (
                        <FaExclamationCircle className="w-12 h-12 text-[#f59e0b] mx-auto mb-3" />
                    )}
                    <p className="text-[16px] font-bold text-[#1e293b]">
                        {result.success_count} data berhasil diimport
                    </p>
                    {result.error_count > 0 && (
                        <p className="text-[14px] text-[#ef4444] mt-1">
                            {result.error_count} gagal
                        </p>
                    )}
                    {result.errors.length > 0 && (
                        <div className="mt-4 text-left">
                            <p className="text-[13px] font-medium text-[#64748b] mb-2">Error details:</p>
                            <div className="max-h-32 overflow-y-auto bg-[#fef2f2] rounded-lg p-3">
                                {result.errors.map((err, i) => (
                                    <p key={i} className="text-[12px] text-[#dc2626] mb-1">{err}</p>
                                ))}
                            </div>
                        </div>
                    )}
                    {result.success.length > 0 && (
                        <div className="mt-4 text-left">
                            <p className="text-[13px] font-medium text-[#64748b] mb-2">Berhasil:</p>
                            <div className="max-h-32 overflow-y-auto bg-[#f0fdf4] rounded-lg p-3">
                                {result.success.map((s, i) => (
                                    <p key={i} className="text-[12px] text-[#16a34a] mb-0.5">{s}</p>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="mt-6">
                        <Button onClick={() => { reset(); onClose(); }}>Tutup</Button>
                    </div>
                </div>
            )}
        </Modal>
    );
}
