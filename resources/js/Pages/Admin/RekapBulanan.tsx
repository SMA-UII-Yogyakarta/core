import { useState } from "react";
import { router } from "@inertiajs/react";
import { Table, Button } from "@/Components";
import AdminLayout from "@/Layouts/AdminLayout";
import type { Column } from "@/Components/ui/Table";

interface SchoolClass {
    id: number;
    name: string;
    teacher: { id: number; name: string } | null;
}

interface StudentSummary {
    id: number;
    nama: string;
    kelas: string;
    masuk: number;
    izin: number;
    sakit: number;
    alpha: number;
}

interface PageProps {
    classes: SchoolClass[];
    selectedClassId: number | null;
    studentsData: StudentSummary[];
}

export default function RekapBulanan({
    classes,
    selectedClassId,
    studentsData,
}: PageProps) {
    const [classId, setClassId] = useState(selectedClassId?.toString() ?? "");
    const [period, setPeriod] = useState<"Harian" | "Bulanan" | "Semester">("Bulanan");

    const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        setClassId(val);
        router.get(
            "/admin/rekap-bulanan",
            { class_id: val || undefined },
            { preserveState: true }
        );
    };

    const columns: Column<StudentSummary & { no: number }>[] = [
        {
            key: "no",
            header: "No",
            render: (row) => <span className="text-text-inactive">{row.no}</span>,
        },
        { 
            key: "nama", 
            header: "Nama Lengkap",
            render: (row) => <span className="font-semibold text-text-primary">{row.nama}</span>,
        },
        { key: "kelas", header: "Kelas" },
        { key: "masuk", header: "Masuk", render: (row) => row.masuk.toString() },
        { 
            key: "izin", 
            header: "Izin",
            render: (row) => (
                <span className={row.izin > 0 ? "text-blue-600 font-bold" : "text-text-inactive"}>
                    {row.izin}
                </span>
            ),
        },
        { 
            key: "sakit", 
            header: "Sakit",
            render: (row) => (
                <span className={row.sakit > 0 ? "text-amber-500 font-bold" : "text-text-inactive"}>
                    {row.sakit}
                </span>
            ),
        },
        { 
            key: "alpha", 
            header: "Alpha",
            render: (row) => (
                <span className={row.alpha > 0 || row.alpha === 0 ? "text-red-500 font-bold" : "text-text-inactive"}>
                    {row.alpha}
                </span>
            ),
        },
    ];

    // Tambahkan nomor urut
    const tableData = studentsData.map((d, idx) => ({ ...d, no: idx + 1 }));

    return (
        <AdminLayout title="Laporan & Ekspor Global" activeMenu="Laporan Rekap">
            <div className="mb-6">
                <h1 className="text-[22px] font-bold text-text-primary font-inter mb-1">
                    Laporan & Ekspor Global
                </h1>
                <p className="text-text-inactive text-[14px]">
                    Rekapitulasi kehadiran siswa berdasarkan periode dan kategori kelas.
                </p>
            </div>

            <div className="bg-surface border border-border rounded-xl">
                {/* ── Toolbar ── */}
                <div className="p-4 lg:p-6 border-b border-border flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Tab Toggle */}
                    <div className="flex bg-background border border-border rounded-lg p-1">
                        {["Harian", "Bulanan", "Semester"].map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p as "Harian" | "Bulanan" | "Semester")}
                                className={`px-5 py-2 text-[14px] font-semibold rounded-md transition-all ${
                                    period === p
                                        ? "bg-primary text-white shadow-sm"
                                        : "text-text-inactive hover:text-text-primary"
                                }`}
                                type="button"
                            >
                                {p}
                            </button>
                        ))}
                    </div>

                    {/* Filter & Export */}
                    <div className="flex items-center gap-3">
                        <select
                            value={classId}
                            onChange={handleClassChange}
                            className="bg-background border border-border text-text-primary text-[14px] rounded-lg px-4 py-2.5 min-w-[160px] focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="">Semua Kelas</option>
                            {classes.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                        
                        <Button className="!bg-red-500 hover:!bg-red-600 text-white font-bold gap-2">
                            <i className="fas fa-file-pdf" /> PDF
                        </Button>
                        <Button className="!bg-[#10B981] hover:!bg-[#059669] text-white font-bold gap-2">
                            <i className="fas fa-file-excel" /> Excel
                        </Button>
                    </div>
                </div>

                {/* ── Table ── */}
                <div className="p-4 lg:p-6 pb-0">
                    <Table
                        columns={columns}
                        data={tableData}
                        keyExtractor={(d) => d.id}
                        emptyMessage="Belum ada data rekapitulasi."
                    />
                </div>

                {/* ── Footer ── */}
                <div className="p-4 lg:p-6 pt-4 text-[13px] text-text-inactive flex items-center gap-2">
                    <i className="fas fa-info-circle" />
                    Tampilan kolom akan menyesuaikan secara otomatis berdasarkan filter periode yang dipilih.
                </div>
            </div>
        </AdminLayout>
    );
}
