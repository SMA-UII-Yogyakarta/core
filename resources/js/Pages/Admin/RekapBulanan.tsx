import { useState } from "react";
import { router } from "@inertiajs/react";
import { StatCard, Table, FilterBar } from "@/Components";
import AdminLayout from "@/Layouts/AdminLayout";
import type { Column } from "@/Components/ui/Table";

interface SchoolClass {
    id: number;
    name: string;
    teacher: { id: number; name: string } | null;
}

interface DailyEntry {
    tanggal: string;
    hadir: number;
    terlambat: number;
    alpa: number;
}

interface DailyData {
    days: DailyEntry[];
    summary: {
        total_siswa: number;
        total_hadir: number;
        total_terlambat: number;
        total_alpa: number;
        jumlah_hari: number;
    };
}

interface PageProps {
    classes: SchoolClass[];
    selectedClassId: number | null;
    bulan: number;
    tahun: number;
    dailyData: DailyData | null;
}

export default function RekapBulanan({
    classes,
    selectedClassId,
    bulan,
    tahun,
    dailyData,
}: PageProps) {
    const [classId, setClassId] = useState(selectedClassId?.toString() ?? "");
    const [bulanVal, setBulanVal] = useState(bulan.toString());
    const [tahunVal, setTahunVal] = useState(tahun.toString());

    const handleFilter = () => {
        router.get(
            "/admin/rekap-bulanan",
            {
                class_id: classId || undefined,
                bulan: bulanVal || undefined,
                tahun: tahunVal || undefined,
            },
            { preserveState: true },
        );
    };

    const monthNames = [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember",
    ];

    const columns: Column<DailyEntry>[] = [
        { key: "tanggal", header: "Tanggal" },
        { key: "hadir", header: "Hadir" },
        { key: "terlambat", header: "Terlambat" },
        { key: "alpa", header: "Alpa" },
    ];

    return (
        <AdminLayout title="Rekap Bulanan" activeMenu="Laporan Rekap">
            <h1 className="text-[18px] font-bold text-text-primary font-inter mb-6">
                Rekap Bulanan
            </h1>

            <FilterBar className="mb-6">
                <FilterBar.Select
                    label="Kelas"
                    options={[
                        { value: "", label: "-- Pilih Kelas --" },
                        ...classes.map((c) => ({
                            value: c.id.toString(),
                            label: c.name,
                        })),
                    ]}
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                />
                <FilterBar.Select
                    label="Bulan"
                    options={monthNames.map((name, i) => ({
                        value: (i + 1).toString(),
                        label: name,
                    }))}
                    value={bulanVal}
                    onChange={(e) => setBulanVal(e.target.value)}
                />
                <FilterBar.Select
                    label="Tahun"
                    options={["2024", "2025", "2026", "2027"].map((t) => ({
                        value: t,
                        label: t,
                    }))}
                    value={tahunVal}
                    onChange={(e) => setTahunVal(e.target.value)}
                />
                <button
                    onClick={handleFilter}
                    className="px-5 py-2 bg-primary text-white rounded-lg text-[13px] font-semibold hover:bg-primary/90 transition-colors"
                    type="button"
                >
                    Tampilkan
                </button>
            </FilterBar>

            {dailyData && (
                <>
                    <section className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
                        <StatCard
                            label="Total Siswa"
                            value={dailyData.summary.total_siswa}
                            color="grey"
                        />
                        <StatCard
                            label="Total Hadir"
                            value={dailyData.summary.total_hadir}
                            color="green"
                        />
                        <StatCard
                            label="Total Terlambat"
                            value={dailyData.summary.total_terlambat}
                            color="amber"
                        />
                        <StatCard
                            label="Total Alpa"
                            value={dailyData.summary.total_alpa}
                            color="red"
                        />
                        <StatCard
                            label="Hari Aktif"
                            value={dailyData.summary.jumlah_hari}
                            color="blue"
                        />
                    </section>

                    <section className="bg-surface border border-border rounded-lg p-4 lg:p-6">
                        <h2 className="text-[16px] font-bold text-text-primary font-inter mb-4">
                            Detail Harian — {monthNames[bulan - 1]} {tahun}
                        </h2>
                        <Table
                            columns={columns}
                            data={dailyData.days}
                            keyExtractor={(d) => d.tanggal}
                            emptyMessage="Belum ada data untuk bulan ini."
                        />
                    </section>
                </>
            )}

            {!selectedClassId && (
                <div className="bg-surface border border-border rounded-lg p-12 text-center">
                    <p className="text-text-muted font-inter text-[14px]">
                        Silakan pilih kelas, bulan, dan tahun untuk menampilkan
                        data.
                    </p>
                </div>
            )}
        </AdminLayout>
    );
}
