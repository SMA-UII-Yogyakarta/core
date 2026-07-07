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
    date: string;
    present: number;
    late: number;
    absent: number;
}

interface DailyData {
    days: DailyEntry[];
    summary: {
        total_siswa: number;
        total_present: number;
        total_late: number;
        total_absent: number;
        total_days: number;
    };
}

interface PageProps {
    classes: SchoolClass[];
    selectedClassId: number | null;
    month: number;
    year: number;
    dailyData: DailyData | null;
}

export default function RekapBulanan({
    classes,
    selectedClassId,
    month,
    year,
    dailyData,
}: PageProps) {
    const [classId, setClassId] = useState(selectedClassId?.toString() ?? "");
    const [monthVal, setMonthVal] = useState(month.toString());
    const [yearVal, setYearVal] = useState(year.toString());

    const handleFilter = () => {
        router.get(
            "/admin/monthly-recap",
            {
                class_id: classId || undefined,
                month: monthVal || undefined,
                year: yearVal || undefined,
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
        { key: "date", header: "Tanggal" },
        { key: "present", header: "Hadir" },
        { key: "late", header: "Terlambat" },
        { key: "absent", header: "Absent" },
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
                    value={monthVal}
                    onChange={(e) => setMonthVal(e.target.value)}
                />
                <FilterBar.Select
                    label="Tahun"
                    options={["2024", "2025", "2026", "2027"].map((t) => ({
                        value: t,
                        label: t,
                    }))}
                    value={yearVal}
                    onChange={(e) => setYearVal(e.target.value)}
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
                            value={dailyData.summary.total_present}
                            color="green"
                        />
                        <StatCard
                            label="Total Terlambat"
                            value={dailyData.summary.total_late}
                            color="amber"
                        />
                        <StatCard
                            label="Total Absent"
                            value={dailyData.summary.total_absent}
                            color="red"
                        />
                        <StatCard
                            label="Hari Aktif"
                            value={dailyData.summary.total_days}
                            color="blue"
                        />
                    </section>

                    <section className="bg-surface border border-border rounded-lg p-4 lg:p-6">
                        <h2 className="text-[16px] font-bold text-text-primary font-inter mb-4">
                            Detail Harian — {monthNames[month - 1]} {year}
                        </h2>
                        <Table
                            columns={columns}
                            data={dailyData.days}
                            keyExtractor={(d) => d.date}
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
