import { useState, useRef } from "react";
import { router, usePage, Link } from "@inertiajs/react";
import AppShell from "@/Layouts/AppShell";

interface Student {
    id: number;
    name: string;
    class: { id: number; name: string } | null;
}

interface LeaveRequestRecord {
    id: number;
    category: string;
    start_date: string;
    end_date: string;
    approval_status: string;
    student: { id: number; name: string };
}

interface PageProps {
    guardian: { id: number; name: string };
    students: Student[];
    leaveRequests: {
        data: LeaveRequestRecord[];
        current_page: number;
        last_page: number;
        total: number;
    };
}

const CATEGORY_OPTIONS = [
    { value: "Sick", label: "Sakit" },
    { value: "Event", label: "Kegiatan Keluarga" },
    { value: "Competition", label: "Lomba" },
    { value: "Other", label: "Lainnya" },
];

function approvalColor(status: string): string {
    const s = status.toLowerCase();
    if (s === "approved") return "#10B981";
    if (s === "rejected") return "#EF4444";
    return "#F59E0B";
}

function approvalLabel(status: string): string {
    const s = status.toLowerCase();
    if (s === "approved") return "Disetujui";
    if (s === "rejected") return "Ditolak";
    return "Menunggu";
}

const inputCls =
    "w-full border border-border rounded-lg px-3 py-2.5 text-[13px] text-text-primary bg-white focus:outline-none focus:ring-2 focus:ring-primary/20";

export default function LeaveApplication({
    students,
    leaveRequests,
}: PageProps) {
    const [studentId, setStudentId] = useState(
        students[0]?.id.toString() ?? "",
    );
    const [category, setCategory] = useState("Sick");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [description, setDescription] = useState("");
    const [document, setDocument] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { errors } = usePage().props as { errors?: Record<string, string> };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setDocument(file);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSuccessMsg(null);

        const formData = new FormData();
        formData.append("student_id", studentId);
        formData.append("category", category);
        formData.append("start_date", startDate);
        if (endDate) formData.append("end_date", endDate);
        formData.append("description", description);
        if (document) formData.append("document", document);

        router.post("/guardian/leave-application", formData, {
            preserveState: true,
            headers: { "Content-Type": "multipart/form-data" },
            onSuccess: () => {
                setStartDate("");
                setEndDate("");
                setDescription("");
                setDocument(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
                setSuccessMsg("Pengajuan izin berhasil dikirim ke wali kelas.");
                setLoading(false);
            },
            onError: () => setLoading(false),
        });
    };

    return (
        <AppShell title="Pengajuan Izin">
            {/* Page header */}
            <div className="mb-6 flex items-center gap-3">
                <Link
                    href="/guardian"
                    className="lg:hidden text-white/80 hover:text-white"
                    aria-label="Kembali"
                >
                    <i className="fas fa-arrow-left text-text-muted text-[16px]" />
                </Link>
                <div>
                    <h1 className="text-[22px] font-bold text-text-primary font-inter">
                        Pengajuan Izin
                    </h1>
                    <p className="text-[13px] text-text-muted font-inter mt-0.5">
                        Ajukan izin ketidakhadiran anak Anda.
                    </p>
                </div>
            </div>

            {/* ── Success banner ── */}
            {successMsg && (
                <div className="mb-5 px-4 py-3 bg-success-bg border border-success-light rounded-lg text-[13px] text-success flex items-center gap-2">
                    <i className="fas fa-check-circle" />
                    <span>{successMsg}</span>
                </div>
            )}

            {/* ── FORM INLINE (bukan modal) ── */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-8">

                {/* Pilih Anak */}
                <div>
                    <label className="block text-[12px] font-bold text-text-muted uppercase tracking-wide mb-2 font-inter">
                        Pilih Anak
                    </label>
                    <div className="relative">
                        <select
                            value={studentId}
                            onChange={(e) => setStudentId(e.target.value)}
                            className="w-full appearance-none rounded-lg px-3 py-2.5 text-[13px] font-bold font-inter focus:outline-none focus:ring-2 focus:ring-primary/20 pr-8"
                            style={{
                                border: "1px solid #2E3391",
                                color: "#2E3391",
                                background: "#FFFFFF",
                                boxShadow: "0px 2px 5px rgba(46,51,145,0.05)",
                            }}
                            required
                        >
                            {students.map((s) => (
                                <option key={s.id} value={s.id.toString()}>
                                    {s.name} ({s.class?.name ?? "-"})
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                            <i className="fas fa-chevron-down text-[12px]" style={{ color: "#94A3B8" }} />
                        </div>
                    </div>
                    {errors?.student_id && (
                        <p className="text-[11px] text-danger mt-1">{errors.student_id}</p>
                    )}
                </div>

                {/* Kategori Izin */}
                <div>
                    <label className="block text-[12px] font-bold text-text-muted uppercase tracking-wide mb-2 font-inter">
                        Kategori Izin
                    </label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className={inputCls}
                        required
                    >
                        {CATEGORY_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    {errors?.category && (
                        <p className="text-[11px] text-danger mt-1">{errors.category}</p>
                    )}
                </div>

                {/* Tanggal — 2 kolom */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-[12px] font-bold text-text-muted uppercase tracking-wide mb-2 font-inter">
                            Tgl Mulai
                        </label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className={inputCls}
                            required
                        />
                        {errors?.start_date && (
                            <p className="text-[11px] text-danger mt-1">{errors.start_date}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-[12px] font-bold text-text-muted uppercase tracking-wide mb-2 font-inter">
                            Selesai (Opsional)
                        </label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className={inputCls}
                        />
                    </div>
                </div>

                {/* Keterangan */}
                <div>
                    <label className="block text-[12px] font-bold text-text-muted uppercase tracking-wide mb-2 font-inter">
                        Keterangan
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Tulis alasan sakit/izin..."
                        rows={3}
                        className={`${inputCls} resize-none`}
                        style={{ color: description ? "#1E293B" : "#757575" }}
                    />
                    {errors?.description && (
                        <p className="text-[11px] text-danger mt-1">{errors.description}</p>
                    )}
                </div>

                {/* Unggah Bukti — dashed border navy */}
                <div>
                    <label className="block text-[12px] font-bold text-text-muted uppercase tracking-wide mb-2 font-inter">
                        Unggah Bukti
                    </label>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex flex-col items-center justify-center gap-2 py-5 rounded-xl transition-colors"
                        style={{
                            background: "#EFF6FF",
                            border: "2px dashed #2E3391",
                        }}
                    >
                        {document ? (
                            <>
                                <i
                                    className="fas fa-file-check text-[28px]"
                                    style={{ color: "#10B981" }}
                                />
                                <span
                                    className="text-[13px] font-bold font-inter"
                                    style={{ color: "#10B981" }}
                                >
                                    {document.name}
                                </span>
                                <span className="text-[11px] text-text-muted">
                                    Klik untuk ganti file
                                </span>
                            </>
                        ) : (
                            <>
                                <i
                                    className="fas fa-camera text-[28px]"
                                    style={{ color: "#2E3391" }}
                                />
                                <span
                                    className="text-[13px] font-bold font-inter"
                                    style={{ color: "#2E3391" }}
                                >
                                    Ambil Foto Surat
                                </span>
                                <span className="text-[11px] text-text-muted">
                                    Maks. 2MB (Langsung via Kamera HP)
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
                    {errors?.document && (
                        <p className="text-[11px] text-danger mt-1">{errors.document}</p>
                    )}
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-lg font-bold text-[15px] text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                    style={{ background: "#10B981" }}
                >
                    {loading ? (
                        <>
                            <i className="fas fa-spinner fa-spin" />
                            <span>Mengirim...</span>
                        </>
                    ) : (
                        <>
                            <i className="fas fa-paper-plane" />
                            <span>KIRIM KE WALI KELAS</span>
                        </>
                    )}
                </button>
            </form>

            {/* ── Riwayat Pengajuan ── */}
            {leaveRequests.data.length > 0 && (
                <div>
                    <h2 className="text-[15px] font-bold text-text-primary font-inter mb-3">
                        Riwayat Pengajuan
                    </h2>
                    <div className="bg-white border border-border rounded-xl overflow-hidden">
                        {leaveRequests.data.map((lr, idx) => (
                            <div
                                key={lr.id}
                                className={`flex items-center justify-between px-4 py-3 gap-3 ${
                                    idx !== leaveRequests.data.length - 1
                                        ? "border-b border-border"
                                        : ""
                                }`}
                            >
                                <div className="min-w-0">
                                    <p className="text-[13px] font-bold text-text-primary truncate">
                                        {lr.student.name}
                                        <span className="font-normal text-text-muted ml-1.5">
                                            — {lr.category}
                                        </span>
                                    </p>
                                    <p className="text-[11px] text-text-muted mt-0.5">
                                        {lr.start_date}
                                        {lr.end_date !== lr.start_date
                                            ? ` — ${lr.end_date}`
                                            : ""}
                                    </p>
                                </div>
                                <span
                                    className="text-[11px] font-bold shrink-0"
                                    style={{ color: approvalColor(lr.approval_status) }}
                                >
                                    {approvalLabel(lr.approval_status)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </AppShell>
    );
}
