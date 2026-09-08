import { Link, router, useForm } from "@inertiajs/react";
import { useRef, useState } from "react";
import {
    FiArrowLeft,
    FiCalendar,
    FiCheck,
    FiCheckCircle,
    FiClock,
    FiFileText,
    FiSend,
    FiUploadCloud,
    FiUser,
} from "react-icons/fi";
import {
    Button,
    Card,
    EmptyState,
    FormError,
    Input,
    MobileNativePagination,
    NativeSelect,
    PageHeader,
    StatusBadge,
    Table,
    TableFooter,
} from "@/Components";
import type { Column } from "@/Components/ui/Table";
import AppShell from "@/Layouts/AppShell";
import { leaveApplicationSchema } from "@/schemas";
import type { PaginatedData } from "@/types";
import { validateForm } from "@/utils/zodHelper";

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
    leaveRequests: PaginatedData<LeaveRequestRecord>;
}

const CATEGORY_OPTIONS = [
    { value: "Sick", label: "Sakit" },
    { value: "Event", label: "Kegiatan Keluarga" },
    { value: "Competition", label: "Lomba / Kejuaraan" },
    { value: "Other", label: "Lainnya" },
];

export default function LeaveApplication({ students, leaveRequests }: PageProps) {
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
            },
        });
    };

    // Columns for submitted leave requests
    const leaveColumns: Column<LeaveRequestRecord>[] = [
        {
            key: "student",
            header: "Nama Anak",
            render: (row: LeaveRequestRecord) => (
                <div className="flex items-center gap-2 font-medium text-text-primary">
                    <FiUser className="w-4 h-4 text-primary shrink-0" />
                    <span>{row.student?.name ?? "-"}</span>
                </div>
            ),
        },
        {
            key: "category",
            header: "Kategori Izin",
            render: (row: LeaveRequestRecord) => {
                const opt = CATEGORY_OPTIONS.find((c) => c.value === row.category);
                return <span className="font-medium text-text-primary">{opt?.label ?? row.category}</span>;
            },
        },
        {
            key: "period",
            header: "Periode Tanggal",
            render: (row: LeaveRequestRecord) => (
                <div className="flex items-center gap-2 font-medium text-text-muted text-[13px]">
                    <FiCalendar className="w-3.5 h-3.5 shrink-0" />
                    <span>
                        {row.start_date}
                        {row.end_date && row.end_date !== row.start_date ? ` s/d ${row.end_date}` : ""}
                    </span>
                </div>
            ),
        },
        {
            key: "approval_status",
            header: "Status Persetujuan",
            render: (row: LeaveRequestRecord) => <StatusBadge variant={row.approval_status} />,
        },
    ];

    return (
        <AppShell title="Pengajuan Izin">
            <div className="flex flex-col gap-6 font-inter">
                {/* Page Header */}
                <PageHeader
                    title="Pengajuan Izin Ketidakhadiran"
                    description="Ajukan permohonan izin ketidakhadiran anak Anda langsung ke Wali Kelas."
                    className="hidden lg:flex shrink-0 mb-4"
                >
                    <Link href="/guardian">
                        <Button variant="outline" size="sm" icon={<FiArrowLeft className="w-4 h-4" />}>
                            Kembali ke Overview
                        </Button>
                    </Link>
                </PageHeader>

                {/* Success Alert Banner */}
                {successMsg && (
                    <div className="px-4 py-3 bg-success-bg border border-success/30 rounded-xl text-[13px] text-success font-medium flex items-center gap-2.5 animate-fadeIn">
                        <FiCheckCircle className="w-5 h-5 text-success shrink-0" />
                        <span>{successMsg}</span>
                    </div>
                )}

                {/* Form Card */}
                <Card className="p-6 border-border">
                    <h3 className="text-[16px] font-bold text-text-primary mb-4 flex items-center gap-2 font-inter">
                        <FiFileText className="w-5 h-5 text-primary" />
                        <span>Formulir Permohonan Izin</span>
                    </h3>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        {/* Pilih Anak */}
                        <div>
                            <label className="block text-[12px] font-bold text-text-primary uppercase tracking-wide mb-1.5 font-inter">
                                Pilih Anak <span className="text-danger">*</span>
                            </label>
                            <NativeSelect
                                value={data.student_id}
                                onChange={(e) => setData("student_id", e.target.value)}
                            >
                                {students.map((s) => (
                                    <option key={s.id} value={s.id.toString()}>
                                        {s.name} ({s.class?.name ?? "-"})
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
                                className={`w-full flex flex-col items-center justify-center gap-2 py-6 rounded-xl transition-all cursor-pointer border-2 border-dashed ${
                                    data.document
                                        ? "bg-success-bg border-success/40 text-success"
                                        : "bg-primary-light/30 border-primary/30 text-primary hover:bg-primary-light/50"
                                }`}
                            >
                                {data.document ? (
                                    <>
                                        <FiCheck className="w-8 h-8 text-success" />
                                        <span className="text-[13px] font-bold">{data.document.name}</span>
                                        <span className="text-[11px] text-text-muted">Klik untuk mengganti file</span>
                                    </>
                                ) : (
                                    <>
                                        <FiUploadCloud className="w-8 h-8 text-primary" />
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

                        {/* Submit Button */}
                        <div className="pt-2">
                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                className="w-full justify-center shadow-md font-bold"
                                loading={processing}
                                icon={<FiSend className="w-4 h-4" />}
                            >
                                Kirim Permohonan Izin ke Wali Kelas
                            </Button>
                        </div>
                    </form>
                </Card>

                {/* Submitted Leave Applications History */}
                <section className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[16px] font-bold text-text-primary flex items-center gap-2 font-inter">
                            <FiClock className="w-5 h-5 text-primary" />
                            <span>Riwayat Pengajuan Izin Saya</span>
                        </h3>
                        <span className="text-[12px] font-normal text-text-muted font-inter">
                            Total: {leaveRequests.total ?? leaveRequests.data.length} Pengajuan
                        </span>
                    </div>

                    {leaveRequests.data.length === 0 ? (
                        <EmptyState
                            title="Belum Ada Pengajuan Izin"
                            description="Riwayat pengajuan izin anak Anda akan muncul di sini setelah Anda mengirimkan formulir di atas."
                        />
                    ) : (
                        <>
                            {/* Mobile Card Stack (< sm) */}
                            <div className="sm:hidden space-y-3">
                                {leaveRequests.data.map((item) => {
                                    const opt = CATEGORY_OPTIONS.find((c) => c.value === item.category);
                                    return (
                                        <div
                                            key={item.id}
                                            className="bg-surface border border-border rounded-xl p-4 shadow-card space-y-2"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0">
                                                    <h4 className="text-[14px] font-bold text-text-primary truncate">
                                                        {item.student?.name}
                                                    </h4>
                                                    <p className="text-[12px] text-text-secondary">
                                                        {opt?.label ?? item.category}
                                                    </p>
                                                </div>
                                                <StatusBadge variant={item.approval_status} />
                                            </div>
                                            <div className="flex items-center justify-between text-[11px] text-text-muted pt-2 border-t border-border">
                                                <span>Periode</span>
                                                <span>
                                                    {item.start_date}
                                                    {item.end_date && item.end_date !== item.start_date
                                                        ? ` s/d ${item.end_date}`
                                                        : ""}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}

                                {leaveRequests.last_page > 1 && (
                                    <div className="pt-2 font-inter">
                                        <MobileNativePagination
                                            currentPage={leaveRequests.current_page}
                                            totalPages={leaveRequests.last_page}
                                            totalItems={leaveRequests.total}
                                            onPageChange={(page) =>
                                                router.get(
                                                    "/guardian/leave-application",
                                                    { page },
                                                    { preserveState: true },
                                                )
                                            }
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Tablet & Desktop View (>= sm) */}
                            <div className="hidden sm:block space-y-3">
                                <Table
                                    columns={leaveColumns}
                                    data={leaveRequests.data}
                                    keyExtractor={(item: LeaveRequestRecord) => item.id}
                                />
                                <TableFooter
                                    currentPage={leaveRequests.current_page}
                                    totalPages={leaveRequests.last_page}
                                    totalItems={leaveRequests.total}
                                    perPage={leaveRequests.per_page ?? 10}
                                    itemLabel="pengajuan izin"
                                    onPageChange={(page) =>
                                        router.get("/guardian/leave-application", { page }, { preserveState: true })
                                    }
                                />
                            </div>
                        </>
                    )}
                </section>
            </div>
        </AppShell>
    );
}
