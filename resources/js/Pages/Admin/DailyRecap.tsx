import { useState } from "react";
import { router } from "@inertiajs/react";
import { StatCard, StatusBadge, Table, FilterBar } from "@/Components";
import AdminLayout from "@/Layouts/AdminLayout";
import type { Column } from "@/Components/ui/Table";
import type { StatusVariant } from "@/types/component";

interface SchoolClass {
    id: number;
    name: string;
    teacher: { id: number; name: string } | null;
}

interface Stats {
    total: number;
    present: number;
    late: number;
    absent: number;
    sick_permission: number;
}

interface AttendanceStudent {
    student: {
        id: number;
        nisn: string;
        name: string;
        user: { id: number; name: string } | null;
        class: { id: number; name: string } | null;
    };
    attendance: {
        id: number;
        check_in_time: string;
        status: string;
        latitude: string;
        longitude: string;
        photo_url: string;
    } | null;
    status: string;
}

interface PageProps {
    classes: SchoolClass[];
    selectedClassId: number | null;
    date: string;
    stats: Stats | null;
    students: AttendanceStudent[];
}

const statusToVariant: Record<string, StatusVariant> = {
    Present: "present",
    Late: "late",
    Absent: "absent",
    Sick: "sick",
    Permission: "permission",
};

const statusLabels: Record<string, string> = {
    Present: "Hadir",
    Late: "Terlambat",
    Absent: "Tidak Hadir",
    Sick: "Sakit",
    Permission: "Izin",
};

export default function RekapHarian({
    classes,
    selectedClassId,
    date,
    stats,
    students,
}: PageProps) {
    const [classId, setClassId] = useState(selectedClassId?.toString() ?? "");
    const [dateVal, setDateVal] = useState(date);

    const handleFilter = () => {
        router.get(
            "/admin/daily-recap",
            {
                class_id: classId || undefined,
                date: dateVal || undefined,
            },
            { preserveState: true },
        );
    };

    const columns: Column<AttendanceStudent>[] = [
        { key: "nisn", header: "NISN", render: (s) => s.student.nisn },
        { key: "name", header: "Nama Siswa", render: (s) => s.student.name },
        {
            key: "class",
            header: "Kelas",
            render: (s) => s.student.class?.name ?? "-",
        },
        {
            key: "status",
            header: "Status",
            render: (s) => {
                const variant = statusToVariant[s.status] ?? "absent";
                return (
                    <StatusBadge
                        variant={variant}
                        label={statusLabels[s.status] ?? s.status}
                    />
                );
            },
        },
        {
            key: "time",
            header: "Jam Masuk",
            render: (s) =>
                s.attendance?.check_in_time
                    ? `${s.attendance.check_in_time} WIB`
                    : "-",
        },
    ];

    return (
        <AdminLayout title="Rekap Harian" activeMenu="Laporan Rekap">
            <h1 className="text-[18px] font-bold text-text-primary font-inter mb-6">
                Rekap Harian
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
                <FilterBar.Date
                    label="Tanggal"
                    value={dateVal}
                    onChange={setDateVal}
                />
                <button
                    onClick={handleFilter}
                    className="px-5 py-2 bg-primary text-white rounded-lg text-[13px] font-semibold hover:bg-primary/90 transition-colors"
                    type="button"
                >
                    Tampilkan
                </button>
            </FilterBar>

            {stats && (
                <section className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
                    <StatCard
                        label="Total Siswa"
                        value={stats.total}
                        color="grey"
                    />
                    <StatCard
                        label="Hadir"
                        value={stats.present}
                        color="green"
                    />
                    <StatCard
                        label="Terlambat"
                        value={stats.late}
                        color="amber"
                    />
                    <StatCard
                        label="Sakit / Izin"
                        value={stats.sick_permission}
                        color="blue"
                    />
                    <StatCard
                        label="Tidak Hadir"
                        value={stats.absent}
                        color="red"
                    />
                </section>
            )}

            {selectedClassId && (
                <section className="bg-surface border border-border rounded-lg p-4 lg:p-6">
                    <h2 className="text-[16px] font-bold text-text-primary font-inter mb-4">
                        Daftar Kehadiran — {date}
                    </h2>
                    <Table
                        columns={columns}
                        data={students}
                        keyExtractor={(s) => s.student.id}
                        emptyMessage="Belum ada data untuk tanggal ini."
                    />
                </section>
            )}

            {!selectedClassId && (
                <div className="bg-surface border border-border rounded-lg p-12 text-center">
                    <p className="text-text-muted font-inter text-[14px]">
                        Silakan pilih kelas dan tanggal untuk menampilkan data.
                    </p>
                </div>
            )}
        </AdminLayout>
    );
}
