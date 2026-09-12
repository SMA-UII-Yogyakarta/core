import { useForm } from "@inertiajs/react";
import { useRef, useState } from "react";
import { FiCheck, FiCheckCircle, FiSend, FiUploadCloud } from "react-icons/fi";
import { Button, FormError, Input, NativeSelect } from "@/Components";
import { leaveApplicationSchema } from "@/schemas";
import { validateForm } from "@/utils/zodHelper";

export interface StudentOption {
    id: number;
    name: string;
    class?: { id: number; name: string } | null;
}

interface LeaveFormProps {
    formId?: string;
    students: StudentOption[];
    onSuccess?: () => void;
    showSubmitButton?: boolean;
}

const CATEGORY_OPTIONS = [
    { value: "Sick", label: "Sakit" },
    { value: "Event", label: "Kegiatan Keluarga" },
    { value: "Competition", label: "Lomba / Kejuaraan" },
    { value: "Other", label: "Lainnya" },
];

export default function LeaveForm({
    formId = "leave-application-form",
    students = [],
    onSuccess,
    showSubmitButton = true,
}: LeaveFormProps) {
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors, setError, clearErrors, reset } = useForm({
        student_id: students[0]?.id.toString() ?? "",
        category: "Sick",
        start_date: "",
        end_date: "",
        description: "",
        document: null as File | null,
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setData("document", file);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        clearErrors();
        setSuccessMsg(null);

        // 1. Zod client validation
        const valid = validateForm(leaveApplicationSchema, data);
        if (!valid.success) {
            Object.entries(valid.errors).forEach(([key, msg]) => {
                if (msg) setError(key as keyof typeof data, msg);
            });
            return;
        }

        // 2. Submit to server
        post("/guardian/leave-application", {
            preserveState: true,
            forceFormData: true,
            onSuccess: () => {
                reset("start_date", "end_date", "description", "document");
                if (fileInputRef.current) fileInputRef.current.value = "";
                setSuccessMsg("Pengajuan izin berhasil dikirim ke Wali Kelas.");
                if (onSuccess) onSuccess();
            },
        });
    };

    return (
        <form id={formId} onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5 font-inter">
            {/* Success Alert Banner */}
            {successMsg && (
                <div className="px-4 py-3 bg-success-bg border border-success/30 rounded-xl text-[13px] text-success font-medium flex items-center gap-2.5 animate-fadeIn">
                    <FiCheckCircle className="w-5 h-5 text-success shrink-0" />
                    <span>{successMsg}</span>
                </div>
            )}

            {/* Pilih Anak */}
            <div>
                <label className="block text-[12px] font-bold text-text-primary uppercase tracking-wide mb-1.5 font-inter">
                    Pilih Anak <span className="text-danger">*</span>
                </label>
                <NativeSelect value={data.student_id} onChange={(e) => setData("student_id", e.target.value)}>
                    {students.map((s) => (
                        <option key={s.id} value={s.id.toString()}>
                            {s.name} {s.class?.name ? `(${s.class.name})` : ""}
                        </option>
                    ))}
                </NativeSelect>
                <FormError message={errors?.student_id} />
            </div>

            {/* Kategori Izin */}
            <div>
                <label className="block text-[12px] font-bold text-text-primary uppercase tracking-wide mb-1.5 font-inter">
                    Kategori Izin <span className="text-danger">*</span>
                </label>
                <NativeSelect value={data.category} onChange={(e) => setData("category", e.target.value)}>
                    {CATEGORY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </NativeSelect>
                <FormError message={errors?.category} />
            </div>

            {/* Tanggal Mulai & Selesai */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                    label="Tanggal Mulai *"
                    type="date"
                    value={data.start_date}
                    onChange={(e) => setData("start_date", e.target.value)}
                    error={errors?.start_date}
                    required
                />
                <Input
                    label="Tanggal Selesai (Opsional)"
                    type="date"
                    value={data.end_date}
                    onChange={(e) => setData("end_date", e.target.value)}
                    error={errors?.end_date}
                />
            </div>

            {/* Keterangan */}
            <div>
                <label className="block text-[12px] font-bold text-text-primary uppercase tracking-wide mb-1.5 font-inter">
                    Keterangan / Alasan
                </label>
                <textarea
                    value={data.description}
                    onChange={(e) => setData("description", e.target.value)}
                    placeholder="Tulis rincian alasan sakit atau kegiatan..."
                    rows={3}
                    className="w-full border border-border rounded-xl p-3 text-[13px] text-text-primary bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors resize-none placeholder:text-text-muted/60 font-inter"
                />
                <FormError message={errors?.description} />
            </div>

            {/* Unggah Bukti */}
            <div>
                <label className="block text-[12px] font-bold text-text-primary uppercase tracking-wide mb-1.5 font-inter">
                    Unggah Surat Dokter / Dokumen Pendukung
                </label>
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full flex flex-col items-center justify-center gap-2 py-5 rounded-xl transition-all cursor-pointer border-2 border-dashed ${
                        data.document
                            ? "bg-success-bg border-success/40 text-success"
                            : "bg-primary-light/30 border-primary/30 text-primary hover:bg-primary-light/50"
                    }`}
                >
                    {data.document ? (
                        <>
                            <FiCheck className="w-7 h-7 text-success" />
                            <span className="text-[13px] font-bold">{data.document.name}</span>
                            <span className="text-[11px] text-text-muted">Klik untuk mengganti file</span>
                        </>
                    ) : (
                        <>
                            <FiUploadCloud className="w-7 h-7 text-primary" />
                            <span className="text-[13px] font-bold">Ambil Foto Surat / Lampirkan PDF</span>
                            <span className="text-[11px] text-text-muted">
                                Maksimal ukuran file 2MB (JPG, PNG, PDF)
                            </span>
                        </>
                    )}
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    capture="environment"
                    onChange={handleFileChange}
                    className="hidden"
                />
                <FormError message={errors?.document} />
            </div>

            {/* Desktop Submit Button (Optional inside form) */}
            {showSubmitButton && (
                <div className="hidden sm:flex justify-end pt-2">
                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        className="font-bold shadow-md"
                        loading={processing}
                        icon={<FiSend className="w-4 h-4" />}
                    >
                        Kirim Permohonan Izin ke Wali Kelas
                    </Button>
                </div>
            )}
        </form>
    );
}
