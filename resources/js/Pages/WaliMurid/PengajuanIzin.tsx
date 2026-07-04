import { useState } from "react";
import { router, usePage } from "@inertiajs/react";
import { Button, StatusBadge } from "@/Components";
import WaliMuridLayout from "@/Layouts/WaliMuridLayout";

interface Student {
    id: number;
    name: string;
}

interface Guardian {
    id: number;
    name: string;
    students: Student[];
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
    guardian: Guardian;
    students: Student[];
    leaveRequests: {
        data: LeaveRequestRecord[];
        current_page: number;
        last_page: number;
        total: number;
    };
}

export default function WaliPengajuanIzin({
    guardian,
    students,
    leaveRequests,
}: PageProps) {
    const [showForm, setShowForm] = useState(false);
    const [studentId, setStudentId] = useState(
        students[0]?.id.toString() ?? "",
    );
    const [category, setCategory] = useState("Sick");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const { errors } = usePage().props as { errors?: Record<string, string> };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        router.post(
            "/wali/pengajuan-izin",
            {
                student_id: studentId,
                category,
                start_date: startDate,
                end_date: endDate,
                description,
            },
            {
                preserveState: true,
                onSuccess: () => {
                    setShowForm(false);
                    setStartDate("");
                    setEndDate("");
                    setDescription("");
                    setLoading(false);
                },
                onError: () => setLoading(false),
            },
        );
    };

    return (
        <WaliMuridLayout
            title="Pengajuan Izin"
            username={guardian.name}
            userInitial={guardian.name.charAt(0)}
        >
            {/* Header Actions */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-[18px] font-bold text-text-primary">
                    Riwayat Pengajuan Izin
                </h2>
                <Button onClick={() => setShowForm(true)}>+ Ajukan Izin</Button>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-black/50"
                        onClick={() => setShowForm(false)}
                    />
                    <div className="relative bg-surface rounded-xl shadow-modal w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-5 border-b border-border">
                            <h3 className="text-[16px] font-bold text-text-primary">
                                Ajukan Izin Baru
                            </h3>
                            <button
                                onClick={() => setShowForm(false)}
                                className="text-text-muted hover:text-text-primary text-xl"
                                type="button"
                            >
                                &times;
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            <div>
                                <label className="block text-[13px] text-text-muted font-inter mb-1">
                                    Anak
                                </label>
                                <select
                                    value={studentId}
                                    onChange={(e) =>
                                        setStudentId(e.target.value)
                                    }
                                    className="w-full border border-border rounded-lg px-3 py-2 text-[14px] font-inter text-text-primary bg-surface focus:ring-2 focus:ring-primary/20 focus:outline-none"
                                    required
                                >
                                    {students.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name}
                                        </option>
                                    ))}
                                </select>
                                {errors?.student_id && (
                                    <p className="text-[11px] text-danger mt-1">
                                        {errors.student_id}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-[13px] text-text-muted font-inter mb-1">
                                    Jenis Izin
                                </label>
                                <select
                                    value={category}
                                    onChange={(e) =>
                                        setCategory(e.target.value)
                                    }
                                    className="w-full border border-border rounded-lg px-3 py-2 text-[14px] font-inter text-text-primary bg-surface focus:ring-2 focus:ring-primary/20 focus:outline-none"
                                    required
                                >
                                    <option value="Sick">Sakit</option>
                                    <option value="Event">
                                        Kegiatan Keluarga
                                    </option>
                                    <option value="Competition">Lomba</option>
                                    <option value="Other">Lainnya</option>
                                </select>
                                {errors?.category && (
                                    <p className="text-[11px] text-danger mt-1">
                                        {errors.category}
                                    </p>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[13px] text-text-muted font-inter mb-1">
                                        Tanggal Mulai
                                    </label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) =>
                                            setStartDate(e.target.value)
                                        }
                                        className="w-full border border-border rounded-lg px-3 py-2 text-[14px] font-inter text-text-primary bg-surface focus:ring-2 focus:ring-primary/20 focus:outline-none"
                                        required
                                    />
                                    {errors?.start_date && (
                                        <p className="text-[11px] text-danger mt-1">
                                            {errors.start_date}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-[13px] text-text-muted font-inter mb-1">
                                        Tanggal Selesai
                                    </label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) =>
                                            setEndDate(e.target.value)
                                        }
                                        className="w-full border border-border rounded-lg px-3 py-2 text-[14px] font-inter text-text-primary bg-surface focus:ring-2 focus:ring-primary/20 focus:outline-none"
                                        required
                                    />
                                    {errors?.end_date && (
                                        <p className="text-[11px] text-danger mt-1">
                                            {errors.end_date}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="block text-[13px] text-text-muted font-inter mb-1">
                                    Keterangan (opsional)
                                </label>
                                {errors?.description && (
                                    <p className="text-[11px] text-danger mt-1">
                                        {errors.description}
                                    </p>
                                )}
                                <textarea
                                    value={description}
                                    onChange={(e) =>
                                        setDescription(e.target.value)
                                    }
                                    className="w-full border border-border rounded-lg px-3 py-2 text-[14px] font-inter text-text-primary bg-surface focus:ring-2 focus:ring-primary/20 focus:outline-none min-h-20"
                                    rows={3}
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setShowForm(false)}
                                >
                                    Batal
                                </Button>
                                <Button type="submit" loading={loading}>
                                    Kirim Pengajuan
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Leave Requests List */}
            <section className="bg-surface border border-border rounded-xl p-5">
                {leaveRequests.data.length === 0 ? (
                    <p className="text-text-muted text-[13px] text-center py-8">
                        Belum ada pengajuan izin.
                    </p>
                ) : (
                    <div className="space-y-3">
                        {leaveRequests.data.map((lr) => (
                            <div
                                key={lr.id}
                                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-background transition-colors"
                            >
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[14px] font-semibold text-text-primary">
                                            {lr.student.name}
                                        </span>
                                        <span className="text-[12px] text-text-muted">
                                            — {lr.category}
                                        </span>
                                    </div>
                                    <p className="text-[12px] text-text-muted mt-1">
                                        {lr.start_date} — {lr.end_date}
                                    </p>
                                </div>
                                <StatusBadge
                                    variant={
                                        lr.approval_status === "Approved"
                                            ? "approved"
                                            : lr.approval_status === "Rejected"
                                              ? "rejected"
                                              : "pending"
                                    }
                                />
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </WaliMuridLayout>
    );
}
