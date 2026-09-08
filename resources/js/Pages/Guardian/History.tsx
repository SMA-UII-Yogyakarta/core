import { router } from "@inertiajs/react";
import { useMemo, useState } from "react";
import { FiCalendar, FiClock, FiFileText, FiFilter, FiUser } from "react-icons/fi";
import {
    Avatar,
    BottomSheet,
    Button,
    Card,
    EmptyState,
    FilterBar,
    MobileNativePagination,
    NativeSelect,
    PageHeader,
    StatCard,
    StatusBadge,
    Table,
    TableFooter,
} from "@/Components";
import AttendanceChart from "@/Components/features/AttendanceChart";
import type { Column } from "@/Components/ui/Table";
import { useClientPagination } from "@/hooks/useClientPagination";
import AppShell from "@/Layouts/AppShell";
import { INDONESIAN_MONTHS } from "@/utils/helpers";

interface Student {
    id: number;
    name: string;
    nis: string;
    class: { id: number; name: string } | null;
}

interface AttendanceRecord {
    id: number;
    status: string;
    check_in_time: string;
    attendance_date: string;
}

interface LeaveRequest {
    id: number;
    category: string;
    start_date: string;
    end_date: string;
    approval_status: string;
}

interface MonthlyTrend {
    label: string;
    present: number;
    late: number;
}

interface Stats {
    total_days: number;
    present: number;
    late: number;
    absent: number;
    sick_permission?: number;
}

interface PageProps {
    students: Student[];
    selectedStudentId: number;
    selectedStudent: Student | null;
    attendances: AttendanceRecord[];
    leaveRequests: LeaveRequest[];
    month: number;
    year: number;
    stats: Stats | null;
    monthlyTrend: MonthlyTrend[] | null;
}

const MONTH_NAMES = INDONESIAN_MONTHS;

export default function History({
    students,
    selectedStudentId,
    selectedStudent,
    attendances,
    leaveRequests,
    month,
    year,
    stats,
    monthlyTrend,
}: PageProps) {
    const [monthVal, setMonthVal] = useState(month.toString());
    const [yearVal, setYearVal] = useState(year.toString());

    const {
        currentPage: attPage,
        setCurrentPage: setAttPage,
        totalPages: attTotalPages,
        safePage: attSafePage,
        paginatedData: paginatedAttendances,
        pageSize: attPageSize,
    } = useClientPagination(attendances, 1, 10);

    const {
        currentPage: leavePage,
        setCurrentPage: setLeavePage,
        totalPages: leaveTotalPages,
        safePage: leaveSafePage,
        paginatedData: paginatedLeaves,
        pageSize: leavePageSize,
    } = useClientPagination(leaveRequests, 1, 10);

    const handleSelectStudent = (id: number) => {
        router.get("/guardian/history", { student_id: id, month: monthVal, year: yearVal }, { preserveState: true });
    };

    const applyFilter = (newMonth: string, newYear: string) => {
        setMonthVal(newMonth);
        setYearVal(newYear);
        router.get(
            "/guardian/history",
            { student_id: selectedStudentId, month: newMonth, year: newYear },
            { preserveState: true },
        );
    };

    // Columns for Attendance Table
    const attendanceColumns: Column<AttendanceRecord>[] = [
        {
            key: "attendance_date",
            header: "Tanggal Presensi",
            render: (row: AttendanceRecord) => (
                <div className="flex items-center gap-2 font-medium text-text-primary">
                    <FiCalendar className="w-4 h-4 text-text-muted shrink-0" />
                    <span>{row.attendance_date}</span>
                </div>
            ),
        },
        {
            key: "check_in_time",
            header: "Jam Masuk",
            render: (row: AttendanceRecord) => (
                <div className="flex items-center gap-2 font-mono font-medium text-text-primary">
                    <FiClock className="w-4 h-4 text-text-muted shrink-0" />
                    <span>{row.check_in_time ? `${row.check_in_time} WIB` : "-"}</span>
                </div>
            ),
        },
        {
            key: "status",
            header: "Status Kehadiran",
            render: (row: AttendanceRecord) => <StatusBadge variant={row.status} />,
        },
    ];

    // Columns for Leave Request Table
    const leaveColumns: Column<LeaveRequest>[] = [
        {
            key: "category",
            header: "Kategori Izin",
            render: (row: LeaveRequest) => (
                <div className="flex items-center gap-2 font-medium text-text-primary">
                    <FiFileText className="w-4 h-4 text-primary shrink-0" />
                    <span>{row.category}</span>
                </div>
            ),
        },
        {
            key: "period",
            header: "Periode Tanggal",
            render: (row: LeaveRequest) => (
                <span className="text-text-muted font-medium text-[13px]">
                    {row.start_date} {row.end_date && row.end_date !== row.start_date ? `s/d ${row.end_date}` : ""}
                </span>
            ),
        },
        {
            key: "approval_status",
            header: "Status Persetujuan",
            render: (row: LeaveRequest) => <StatusBadge variant={row.approval_status} />,
        },
    ];

    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const hasActiveFilters = monthVal !== month.toString() || yearVal !== year.toString();

    const mobileHeaderActions = (
        <div className="flex items-center gap-2 sm:hidden font-inter">
            <button
                type="button"
                onClick={() => setIsMobileFilterOpen(true)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                    hasActiveFilters ? "bg-primary text-white" : "bg-muted/60 text-text-primary hover:bg-muted"
                }`}
                title="Filter Riwayat Anak"
                aria-label="Filter Riwayat Anak"
            >
                <FiFilter className="text-[14px]" />
            </button>
        </div>
    );

    return (
        <AppShell title="Riwayat Presensi Anak" headerActions={mobileHeaderActions}>
            <div className="flex flex-col gap-6 font-inter">
                {/* Header */}
                <PageHeader
                    title="Riwayat Presensi Anak"
                    description="Pantau laporan kehadiran harian, keterlambatan, dan riwayat pengajuan izin anak Anda."
                    className="hidden lg:flex shrink-0 mb-4"
                />

                {/* Child Selector Tabs */}
                <Card className="p-5 border-border">
                    <h3 className="text-[12px] font-bold text-text-muted uppercase tracking-wider mb-3 flex items-center gap-2 font-inter">
                        <FiUser className="w-4 h-4 text-primary" />
                        <span>Pilih Anak</span>
                    </h3>
                    <div className="flex flex-wrap gap-2.5">
                        {students.map((s) => {
                            const isSelected = s.id === selectedStudentId;
                            return (
                                <Button
                                    key={s.id}
                                    type="button"
                                    onClick={() => handleSelectStudent(s.id)}
                                    variant={isSelected ? "primary" : "outline"}
                                    className="flex items-center gap-2 rounded-xl shadow-none font-bold"
                                >
                                    <Avatar name={s.name} size="xs" />
                                    <span>{s.name}</span>
                                    {s.class?.name && (
                                        <span
                                            className={`text-[11px] px-1.5 py-0.5 rounded-md font-normal ${
                                                isSelected ? "bg-white/20 text-white" : "bg-muted text-text-muted"
                                            }`}
                                        >
                                            {s.class.name}
                                        </span>
                                    )}
                                </Button>
                            );
                        })}
                    </div>
                </Card>

                {selectedStudent ? (
                    <>
                        {/* Selected Student Profile Banner */}
                        <Card className="p-5 border-border bg-surface">
                            <div className="flex items-center gap-4">
                                <Avatar name={selectedStudent.name} size="lg" className="ring-2 ring-primary/20" />
                                <div className="min-w-0">
                                    <h2 className="text-[18px] font-bold text-text-primary truncate">
                                        {selectedStudent.name}
                                    </h2>
                                    <p className="text-[13px] text-text-muted mt-0.5">
                                        Kelas:{" "}
                                        <strong className="text-text-primary font-semibold">
                                            {selectedStudent.class?.name ?? "-"}
                                        </strong>
                                        <span className="mx-2">•</span>
                                        NIS:{" "}
                                        <strong className="text-text-primary font-mono font-semibold">
                                            {selectedStudent.nis}
                                        </strong>
                                    </p>
                                </div>
                            </div>
                        </Card>

                        {/* Summary Stat Cards Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <StatCard label="TOTAL HADIR" value={stats?.present ?? 0} variant="success" />
                            <StatCard label="TERLAMBAT" value={stats?.late ?? 0} variant="warning" />
                            <StatCard label="ALPA / ABSEN" value={stats?.absent ?? 0} variant="danger" />
                            <StatCard label="SAKIT & IZIN" value={stats?.sick_permission ?? 0} variant="info" />
                        </div>

                        {/* Monthly Attendance Trend Chart */}
                        {monthlyTrend && monthlyTrend.length > 0 && (
                            <Card className="p-5 border-border">
                                <h3 className="text-[14px] font-bold text-text-primary mb-3">Tren Kehadiran Bulanan</h3>
                                <AttendanceChart data={monthlyTrend} />
                            </Card>
                        )}

                        {/* Filter Bar (Desktop/Tablet only) */}
                        <div className="hidden sm:block">
                            <FilterBar className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5">
                                    <FilterBar.Select
                                        label="Bulan"
                                        options={MONTH_NAMES.map((name, i) => ({
                                            value: (i + 1).toString(),
                                            label: name,
                                        }))}
                                        value={monthVal}
                                        onChange={(e) => applyFilter(e.target.value, yearVal)}
                                    />
                                    <FilterBar.Select
                                        label="Tahun"
                                        options={["2024", "2025", "2026", "2027"].map((t) => ({
                                            value: t,
                                            label: t,
                                        }))}
                                        value={yearVal}
                                        onChange={(e) => applyFilter(monthVal, e.target.value)}
                                    />
                                </div>
                            </FilterBar>
                        </div>

                        {/* Mobile Filter BottomSheet */}
                        <BottomSheet
                            open={isMobileFilterOpen}
                            onClose={() => setIsMobileFilterOpen(false)}
                            title="Filter Riwayat"
                        >
                            <div className="p-4 space-y-4">
                                <div>
                                    <label className="block text-[12px] font-bold text-text-secondary mb-1">
                                        Pilih Bulan
                                    </label>
                                    <NativeSelect
                                        value={monthVal}
                                        onChange={(e) => {
                                            const newM = e.target.value;
                                            applyFilter(newM, yearVal);
                                            setIsMobileFilterOpen(false);
                                        }}
                                    >
                                        {MONTH_NAMES.map((name, i) => (
                                            <option key={i + 1} value={(i + 1).toString()}>
                                                {name}
                                            </option>
                                        ))}
                                    </NativeSelect>
                                </div>
                                <div>
                                    <label className="block text-[12px] font-bold text-text-secondary mb-1">
                                        Pilih Tahun
                                    </label>
                                    <NativeSelect
                                        value={yearVal}
                                        onChange={(e) => {
                                            const newY = e.target.value;
                                            applyFilter(monthVal, newY);
                                            setIsMobileFilterOpen(false);
                                        }}
                                    >
                                        {["2024", "2025", "2026", "2027"].map((t) => (
                                            <option key={t} value={t}>
                                                {t}
                                            </option>
                                        ))}
                                    </NativeSelect>
                                </div>
                            </div>
                        </BottomSheet>

                        {/* Attendance Table */}
                        <section className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[16px] font-bold text-text-primary font-inter">
                                    Detail Presensi — {MONTH_NAMES[month - 1]} {year}
                                </h3>
                                <span className="text-[12px] font-normal text-text-muted font-inter">
                                    Total: {attendances.length} Rekam Data
                                </span>
                            </div>

                            {attendances.length === 0 ? (
                                <EmptyState
                                    title="Belum Ada Data Presensi"
                                    description={`Tidak ada rekaman data presensi untuk periode ${MONTH_NAMES[month - 1]} ${year}.`}
                                />
                            ) : (
                                <>
                                    {/* Mobile Card Stack */}
                                    <div className="sm:hidden space-y-3">
                                        {paginatedAttendances.map((item) => (
                                            <div
                                                key={item.id}
                                                className="bg-surface border border-border rounded-xl p-4 shadow-card space-y-2"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 font-medium text-text-primary text-[14px]">
                                                        <FiCalendar className="w-4 h-4 text-text-muted shrink-0" />
                                                        <span>{item.attendance_date}</span>
                                                    </div>
                                                    <StatusBadge variant={item.status} />
                                                </div>
                                                <div className="flex items-center justify-between text-[12px] text-text-secondary pt-2 border-t border-border">
                                                    <span>Jam Masuk</span>
                                                    <span className="font-mono font-medium text-text-primary">
                                                        {item.check_in_time ? `${item.check_in_time} WIB` : "—"}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}

                                        {attendances.length > attPageSize && (
                                            <div className="pt-2 font-inter">
                                                <MobileNativePagination
                                                    currentPage={attSafePage}
                                                    totalPages={attTotalPages}
                                                    totalItems={attendances.length}
                                                    perPage={attPageSize}
                                                    onPageChange={setAttPage}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Tablet & Desktop View (>= sm) */}
                                    <div className="hidden sm:block space-y-3">
                                        <Table
                                            columns={attendanceColumns}
                                            data={paginatedAttendances}
                                            keyExtractor={(item: AttendanceRecord) => item.id}
                                        />
                                        <TableFooter
                                            currentPage={attSafePage}
                                            totalPages={attTotalPages}
                                            totalItems={attendances.length}
                                            perPage={attPageSize}
                                            onPageChange={setAttPage}
                                            itemLabel="hari presensi"
                                        />
                                    </div>
                                </>
                            )}
                        </section>

                        {/* Leave Requests Table */}
                        <section className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[16px] font-bold text-text-primary font-inter">
                                    Riwayat Permohonan Izin / Sakit
                                </h3>
                                <span className="text-[12px] font-normal text-text-muted font-inter">
                                    Total: {leaveRequests.length} Pengajuan
                                </span>
                            </div>

                            {leaveRequests.length === 0 ? (
                                <EmptyState
                                    title="Belum Ada Pengajuan Izin"
                                    description="Siswa ini belum memiliki riwayat pengajuan izin atau sakit."
                                />
                            ) : (
                                <>
                                    {/* Mobile Card Stack */}
                                    <div className="sm:hidden space-y-3">
                                        {paginatedLeaves.map((item) => (
                                            <div
                                                key={item.id}
                                                className="bg-surface border border-border rounded-xl p-4 shadow-card space-y-2"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 font-medium text-text-primary text-[14px]">
                                                        <FiFileText className="w-4 h-4 text-primary shrink-0" />
                                                        <span>{item.category}</span>
                                                    </div>
                                                    <StatusBadge variant={item.approval_status} />
                                                </div>
                                                <div className="flex items-center justify-between text-[12px] text-text-secondary pt-2 border-t border-border">
                                                    <span>Periode</span>
                                                    <span className="font-medium text-text-primary">
                                                        {item.start_date}{" "}
                                                        {item.end_date && item.end_date !== item.start_date
                                                            ? `s/d ${item.end_date}`
                                                            : ""}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}

                                        {leaveRequests.length > leavePageSize && (
                                            <div className="pt-2 font-inter">
                                                <MobileNativePagination
                                                    currentPage={leaveSafePage}
                                                    totalPages={leaveTotalPages}
                                                    totalItems={leaveRequests.length}
                                                    perPage={leavePageSize}
                                                    onPageChange={setLeavePage}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Tablet & Desktop View (>= sm) */}
                                    <div className="hidden sm:block space-y-3">
                                        <Table
                                            columns={leaveColumns}
                                            data={paginatedLeaves}
                                            keyExtractor={(item: LeaveRequest) => item.id}
                                        />
                                        <TableFooter
                                            currentPage={leaveSafePage}
                                            totalPages={leaveTotalPages}
                                            totalItems={leaveRequests.length}
                                            perPage={leavePageSize}
                                            onPageChange={setLeavePage}
                                            itemLabel="pengajuan"
                                        />
                                    </div>
                                </>
                            )}
                        </section>
                    </>
                ) : (
                    <EmptyState
                        title="Tidak Ada Siswa Terpilih"
                        description="Silakan pilih salah satu profil anak di atas untuk menampilkan riwayat presensi."
                    />
                )}
            </div>
        </AppShell>
    );
}
