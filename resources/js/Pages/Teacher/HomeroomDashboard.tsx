import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@inertiajs/react";
import { FiUserX, FiLoader, FiFileText, FiImage } from "react-icons/fi";
import { FiMessageSquare, FiSearch, FiChevronRight } from "react-icons/fi";
import AppShell from "@/Layouts/AppShell";
import PreviewImageModal from "@/Components/common/PreviewImageModal";
import {
    Table,
    Pagination,
    SearchBar,
    EmptyState,
    Drawer,
} from "@/Components";
import { type RowStatus } from "@/utils/attentionPriority";
import {
    getRowStatus,
    rowNote,
    translateCategory,
    formatTime,
    formatTimeSeconds,
    formatFullDate,
    formatDateTime,
    waPhone,
    sortAttention,
    type ApprovedLeaveInfo,
    type Student,
} from "@/utils/attentionRows";
import type { Column } from "@/Components/ui/Table";

interface Teacher {
    id: number;
    name: string;
}

interface SchoolClass {
    id: number;
    name: string;
}

interface Stats {
    total: number;
    present: number;
    late: number;
    absent: number;
    pending_leave?: number;
    sick_permission?: number;
    approved_permission?: number;
    truly_absent?: number;
}

interface PageProps {
    teacher: Teacher;
    class: SchoolClass | null;
    students: Student[];
    stats: Stats | null;
    pendingLeaveCount: number;
    expiredPendingCount: number;
    approvedLeaves: Record<number, ApprovedLeaveInfo>;
    lateThreshold: string | null;
    isSchoolDay: boolean;
}

const BADGE: Record<RowStatus, { label: string; classes: string }> = {
    alpa: { label: "ALPA", classes: "bg-danger-light text-text-danger-badge" },
    terlambat: { label: "TERLAMBAT", classes: "bg-warning-light text-text-warning-badge" },
    pending: { label: "TERTUNDA", classes: "bg-primary-light text-primary" },
    diizinkan: { label: "DIIZINKAN", classes: "bg-success-light text-text-success-badge" },
    hadir: { label: "HADIR", classes: "bg-success-light text-text-success-badge" },
};

function guardianMessage(s: Student, className: string): string {
    const streakPart =
        s.consecutiveAbsences >= 2
            ? `tercatat alpa ${s.consecutiveAbsences} hari berturut-turut`
            : "tercatat alpa hari ini tanpa keterangan";
    const name = s.guardian_name ?? "Wali Murid";
    return `Selamat pagi Bapak/Ibu ${name}, saya wali kelas ${className} SMA UII Yogyakarta. Anak Bapak/Ibu, ${s.name} (NIS ${s.nis}), ${streakPart}. Mohon konfirmasi. Terima kasih.`;
}

function ContactGuardianButton({ student, className }: { student: Student; className: string }) {
    const phone = waPhone(student.guardian_phone);
    const href = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(guardianMessage(student, className))}` : null;

    if (!href) {
        return (
            <button
                type="button"
                disabled
                title="Nomor wali murid belum tersedia"
                className="w-full inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-[12px] font-bold text-text-muted bg-muted border border-border cursor-not-allowed transition-all"
            >
                Kontak Kosong
            </button>
        );
    }

    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-[12px] font-bold text-danger bg-danger-bg border border-danger-light hover:bg-danger-light/30 transition-all active:scale-[0.98]"
        >
            <FiMessageSquare className="shrink-0 text-[14px]" />
            <span>Hubungi Wali Murid</span>
        </a>
    );
}

function isImageUrl(url: string): boolean {
    return /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(url);
}

function BacklogBanner({ count }: { count: number }) {
    if (count <= 0) return null;
    return (
        <Link
            href="/leave-requests/verification"
            className="flex items-center gap-2.5 bg-warning-bg border border-warning/40 rounded-xl px-3.5 py-3 text-[13px] text-text-warning-badge cursor-pointer active:scale-[0.98] transition-transform"
        >
            <span className="flex-1">
                <strong>{count}</strong> pengajuan izin siswa belum diverifikasi (tanggal telah lewat)
            </span>
            <FiChevronRight className="text-[11px] shrink-0" />
        </Link>
    );
}

export default function HomeroomDashboard({
    class: schoolClass,
    students,
    stats,
    expiredPendingCount,
    approvedLeaves,
    lateThreshold,
    isSchoolDay,
}: PageProps) {
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [displayedCount, setDisplayedCount] = useState(10);
    const [loadingMore, setLoadingMore] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const observerRef = useRef<HTMLDivElement | null>(null);
    const pageSize = 10;

    const attentionStudents = useMemo(() => {
        const raw = sortAttention(students, approvedLeaves);
        if (!search.trim()) return raw;
        const q = search.toLowerCase();
        return raw.filter((s) => s.name.toLowerCase().includes(q) || s.nis.toLowerCase().includes(q));
    }, [students, search, approvedLeaves]);

    const totalPages = Math.ceil(attentionStudents.length / pageSize) || 1;
    const safePage = Math.min(Math.max(1, currentPage), totalPages);
    const paginatedAttention = useMemo(() => {
        const start = (safePage - 1) * pageSize;
        return attentionStudents.slice(start, start + pageSize);
    }, [attentionStudents, safePage, pageSize]);

    useEffect(() => {
        if (displayedCount >= attentionStudents.length) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !loadingMore) {
                    setLoadingMore(true);
                    setTimeout(() => {
                        setDisplayedCount((prev) => Math.min(prev + 10, attentionStudents.length));
                        setLoadingMore(false);
                    }, 500);
                }
            },
            { threshold: 0.1 },
        );

        const el = observerRef.current;
        if (el) observer.observe(el);

        return () => {
            if (el) observer.unobserve(el);
        };
    }, [displayedCount, attentionStudents.length, loadingMore]);

    if (!schoolClass) {
        return (
            <AppShell title="Dasbor Wali Kelas">
                <EmptyState
                    variant="no-data"
                    icon={<FiUserX className="text-4xl" />}
                    title="Belum Ditugaskan"
                    description="Anda belum ditugaskan sebagai wali kelas."
                />
            </AppShell>
        );
    }

    if (!isSchoolDay) {
        return (
            <AppShell title="Dasbor Wali Kelas">
                <EmptyState
                    variant="no-data"
                    icon={<FiUserX className="text-4xl" />}
                    title="Hari ini bukan hari sekolah"
                    description="Dashboard wali kelas aktif pada hari kerja — libur atau akhir pekan tidak ada presensi."
                />
            </AppShell>
        );
    }

    const classroomName = schoolClass.name ?? "-";

    const statsData = stats as Stats;

    const columns: Column<Student>[] = [
        {
            key: "nis",
            header: "NIS",
            className: "w-32",
            render: (s: Student) => <span className="font-bold text-text-primary text-[13px]">{s.nis}</span>,
        },
        {
            key: "name",
            header: "Nama Siswa",
            className: "min-w-[180px]",
            render: (s: Student) => (
                <span className="font-semibold text-text-primary text-[14px] whitespace-nowrap truncate block max-w-[240px]" title={s.name}>
                    {s.name}
                </span>
            ),
        },
        {
            key: "status",
            header: "Status Hari Ini",
            className: "w-40 text-center",
            render: (s: Student) => {
                const st = getRowStatus(s, approvedLeaves);
                const badge = BADGE[st];
                return (
                    <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${badge.classes}`}>
                        {badge.label}
                    </span>
                );
            },
        },
        {
            key: "note",
            header: "Waktu / Keterangan",
            className: "text-[13px]",
            render: (s: Student) => {
                const st = getRowStatus(s, approvedLeaves);
                const note = rowNote(s, approvedLeaves);
                return (
                    <span className={`font-medium text-[13px] ${st === "terlambat" ? "text-warning font-bold" : "text-text-secondary"}`}>
                        {note}
                    </span>
                );
            },
        },
        {
            key: "actions",
            header: "Tindakan",
            className: "w-40 text-center",
            render: (s: Student) => {
                const st = getRowStatus(s, approvedLeaves);
                if (st === "pending") {
                    return (
                        <Link
                            href={`/leave-requests/verification?highlight=${s.nis}&submitted=${encodeURIComponent(s.pendingLeave?.created_at ?? "")}`}
                            onClick={(e) => e.stopPropagation()}
                            className="px-3.5 py-1.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-[12px] font-bold inline-flex items-center justify-center gap-1.5 shadow-xs transition-all mx-auto cursor-pointer"
                        >
                            Verifikasi Izin
                        </Link>
                    );
                }
                if (st === "alpa") {
                    return (
                        <div onClick={(e) => e.stopPropagation()}>
                                                    <ContactGuardianButton student={s} className={schoolClass.name} />
                        </div>
                    );
                }
                return null;
            },
        },
    ];

    return (
        <AppShell title="Dasbor Wali Kelas">
            {/* Custom header — title + date */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4 md:mb-6">
                <div>
                    <h1 className="text-[24px] font-bold text-text-primary font-inter leading-tight">
                        <span className="hidden md:inline">Dasbor Wali Kelas — </span>
                        {classroomName}
                    </h1>
                    <p className="text-[14px] text-text-secondary font-inter mt-1 hidden md:block">
                        Pantau presensi dan aktivitas harian siswa di kelas bimbingan Anda.
                    </p>
                </div>
                <span className="hidden lg:inline self-start px-3 py-1.5 bg-muted border border-border rounded-lg text-[13px] font-medium text-text-secondary whitespace-nowrap">
                    {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                </span>
            </div>

            <div className="space-y-6 font-inter pb-12">
                {/* ─── Mobile Stat Summary (with date) ─── */}
                <div className="lg:hidden rounded-xl border border-border bg-surface overflow-hidden">
                    <div className="flex justify-center px-4 pt-3">
                        <span className="text-[13px] font-medium text-text-secondary whitespace-nowrap">
                            {new Date().toLocaleDateString("id-ID", {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                            })}
                        </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center px-3">
                        {[
                            { value: statsData.present, label: "TEPAT", numClass: "text-success" },
                            { value: statsData.late, label: "TERLAMBAT", numClass: "text-warning" },
                            { value: statsData.approved_permission ?? 0, label: "IZIN", numClass: "text-primary" },
                            { value: statsData.truly_absent ?? 0, label: "ALPA", numClass: "text-danger" },
                        ].map((item) => (
                            <div key={item.label} className="rounded-xl py-3">
                                <span className={`text-[20px] font-extrabold leading-none ${item.value === 0 ? "text-text-muted" : item.numClass}`}>
                                    {item.value}
                                </span>
                                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wide block mt-1">
                                    {item.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ─── Desktop Stat Cards ─── */}
                <div className="hidden lg:grid grid-cols-4 gap-4">
                    {[
                        { value: statsData.present, label: "TEPAT WAKTU", numClass: "text-success", bgClass: "bg-success-light" },
                        { value: statsData.late, label: "TERLAMBAT", numClass: "text-warning", bgClass: "bg-warning-light" },
                        { value: statsData.approved_permission ?? 0, label: "IZIN DISETUJUI", numClass: "text-primary", bgClass: "bg-primary-light" },
                        { value: statsData.truly_absent ?? 0, label: "ALPA", numClass: "text-danger", bgClass: "bg-danger-light" },
                    ].map((item) => (
                        <div key={item.label} className={`rounded-xl p-4 flex flex-col justify-between ${item.value === 0 ? "bg-surface" : item.bgClass}`}>
                            <span className={`text-[28px] font-extrabold leading-none ${item.value === 0 ? "text-text-muted" : item.numClass}`}>
                                {item.value}
                            </span>
                            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wide mt-2">
                                {item.label}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Backlog banner */}
                <BacklogBanner count={expiredPendingCount} />

                {/* Attention section */}
                <div className="flex flex-col gap-4">
                    {/* ─── Mobile search ─── */}
                    <div className="lg:hidden">
                        {!isSearchOpen && !search ? (
                            <div className="flex items-center justify-between">
                                <h3 className="text-[16px] font-bold text-text-primary font-inter">Perhatian Khusus Hari Ini</h3>
                                <button
                                    type="button"
                                    onClick={() => setIsSearchOpen(true)}
                                    className="p-2 -mr-2 pr-2 text-text-muted hover:text-primary transition-colors"
                                    aria-label="Buka pencarian"
                                >
                                    <FiSearch className="text-[16px]" />
                                </button>
                            </div>
                        ) : (
                            <div className="sticky top-0 z-10 bg-surface py-3 -mx-4 px-4 self-start">
                                <div className="relative">
                                    <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-inactive text-sm pointer-events-none" />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => {
                                            setSearch(e.target.value);
                                            setDisplayedCount(10);
                                        }}
                                        onBlur={() => {
                                            if (!search) setIsSearchOpen(false);
                                        }}
                                        placeholder="Cari nama atau NIS..."
                                        autoFocus
                                        className="h-10 pl-10 pr-10 w-full border border-border rounded-lg text-[14px] font-inter text-text-primary bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-text-inactive transition-all"
                                    />
                                    {search && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSearch("");
                                                setDisplayedCount(10);
                                                setIsSearchOpen(false);
                                            }}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-inactive hover:text-text-primary text-[14px] font-bold"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ─── Desktop search ─── */}
                    <div className="hidden lg:flex items-center justify-between gap-4">
                        <h3 className="text-[16px] font-bold text-text-primary font-inter">Perhatian Khusus Hari Ini</h3>
                        <div className="w-72">
                            <SearchBar
                                value={search}
                                onChange={(val) => {
                                    setSearch(val);
                                    setCurrentPage(1);
                                }}
                                onSearch={() => setCurrentPage(1)}
                                placeholder="Cari nama atau NIS..."
                            />
                        </div>
                    </div>

                    {/* ─── Mobile Card List (lazy loading) ─── */}
                    <div className="lg:hidden flex flex-col min-h-[400px]">
                        <div className="flex-1 space-y-3">
                            {attentionStudents.length === 0 ? (
                                <div className="text-center py-8 text-[13px] text-text-muted">
                                    Semua siswa di kelas ini hadir tepat waktu hari ini.
                                </div>
                            ) : (
                                attentionStudents.slice(0, displayedCount).map((s) => {
                                    const st = getRowStatus(s, approvedLeaves);
                                    const badge = BADGE[st];
                                    const borderColors = {
                                        alpa: "border-danger",
                                        terlambat: "border-warning",
                                        pending: "border-primary",
                                        diizinkan: "border-success",
                                        hadir: "border-success",
                                    };
                                    const isClickable = st !== "pending";
                                    return (
                                        <div
                                            key={s.id}
                                            onClick={isClickable ? () => setSelectedStudent(s) : undefined}
                                            className={`bg-surface ${borderColors[st]} border-l-4 rounded-xl p-4 space-y-3 ${isClickable ? "cursor-pointer active:scale-[0.98] transition-transform" : ""}`}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <h4 className="min-w-0 flex-1 text-[15px] font-bold text-text-primary truncate">{s.name}</h4>
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${badge.classes}`}>
                                                        {badge.label}
                                                    </span>
                                                    {isClickable && (
                                                        <FiChevronRight className="text-[11px] text-text-muted" />
                                                    )}
                                                </div>
                                            </div>
                                            <div className="bg-background rounded-lg px-2.5 py-1.5">
                                                <p className="text-[12px] text-text-muted">{rowNote(s, approvedLeaves)}</p>
                                            </div>
                                            {st === "alpa" && (
                                                <div onClick={(e) => e.stopPropagation()}>
                            <ContactGuardianButton student={s} className={schoolClass.name} />
                                                </div>
                                            )}
                                            {st === "pending" && (
                                                <Link
                                                    href={`/leave-requests/verification?highlight=${s.nis}&submitted=${encodeURIComponent(s.pendingLeave?.created_at ?? "")}`}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="relative block w-full text-center px-4 py-2 bg-primary text-white rounded-lg text-[13px] font-bold"
                                                >
                                                    Verifikasi Izin
                                                    <FiChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-white/70" />
                                                </Link>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>

{/* Lazy loading sentinel */}
                        {attentionStudents.length > 0 && (
                            <div ref={observerRef} className="py-4 text-center">
                                {loadingMore ? (
                                    <p className="text-[13px] text-text-muted">
                                        <FiLoader className="inline animate-spin mr-2" />
                                        Memuat data...
                                    </p>
                                ) : displayedCount < attentionStudents.length ? (
                                    <p className="text-[13px] text-text-muted">
                                        Menampilkan {displayedCount} dari {attentionStudents.length} data
                                    </p>
                                ) : (
                                    <p className="text-[13px] text-text-muted">
                                        Semua siswa sudah ditampilkan ({attentionStudents.length})
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="pt-3 border-t border-border">
                            <div className="flex items-center gap-2 text-[12px] text-text-muted font-medium">
                                <i className="fas fa-info-circle text-primary text-[14px] shrink-0" />
                                <span>Menampilkan daftar siswa kelas {classroomName} yang memerlukan perhatian khusus.</span>
                            </div>
                        </div>
                    </div>

                    {/* ─── Desktop Table ─── */}
                    <div className="hidden lg:block">
                        <Table<Student>
                            columns={columns}
                            data={paginatedAttention}
                            keyExtractor={(s) => s.id}
                            onRowClick={(s) => {
                                const st = getRowStatus(s, approvedLeaves);
                                if (st !== "pending") setSelectedStudent(s);
                            }}
                            emptyMessage="Semua siswa di kelas ini hadir tepat waktu hari ini."
                        />
                    </div>

                    {/* Desktop footer (outside mobile flex container) */}
                    <div className="hidden lg:flex pt-2 flex-col md:flex-row md:items-center justify-between gap-3 shrink-0 mt-auto font-inter min-h-[36px]">
                        <div className="flex items-center gap-2 text-[12px] text-text-muted font-medium">
                            <i className="fas fa-info-circle text-primary text-[14px] shrink-0" />
                            <span>Menampilkan daftar siswa kelas {classroomName} yang memerlukan perhatian khusus.</span>
                        </div>
                        {attentionStudents.length > pageSize && (
                            <Pagination
                                currentPage={safePage}
                                totalPages={totalPages}
                                totalItems={attentionStudents.length}
                                perPage={pageSize}
                                onPageChange={setCurrentPage}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Student Detail Drawer */}
            <Drawer
                open={selectedStudent !== null}
                onClose={() => setSelectedStudent(null)}
                title="Detail Status Kehadiran Siswa"
                width="md"
            >
                {selectedStudent && (
                    <div className="space-y-4 text-text-primary text-[14px]">
                        <div className="flex items-center justify-between p-3 bg-muted/40 rounded-xl">
                            <div>
                                <span className="text-[11px] font-bold text-text-inactive uppercase tracking-wider block">
                                    Status Hari Ini
                                </span>
                                <span className="font-bold text-[15px]">
                                    {BADGE[getRowStatus(selectedStudent, approvedLeaves)].label}
                                </span>
                            </div>
                            <span
                                className={`text-[11px] font-bold px-3 py-1 rounded-full ${BADGE[getRowStatus(selectedStudent, approvedLeaves)].classes}`}
                            >
                                {BADGE[getRowStatus(selectedStudent, approvedLeaves)].label}
                            </span>
                        </div>

                        <div className="border border-border/80 rounded-xl p-4 space-y-2">
                            <h3 className="font-bold text-primary text-[13px] uppercase tracking-wide">Informasi Siswa</h3>
                            <div className="grid grid-cols-2 gap-3 text-[13px]">
                                <div>
                                    <span className="text-text-muted block text-[11px]">Nama Lengkap</span>
                                    <span className="font-semibold">{selectedStudent.name}</span>
                                </div>
                                <div>
                                    <span className="text-text-muted block text-[11px]">NIS</span>
                                    <span className="font-semibold">{selectedStudent.nis}</span>
                                </div>
                            </div>
                        </div>

                        <div className="border border-border/80 rounded-xl p-4 space-y-2">
                            <h3 className="font-bold text-primary text-[13px] uppercase tracking-wide">Keterangan</h3>
                            <p className="text-[13px] text-text-secondary">
                                {rowNote(selectedStudent, approvedLeaves)}
                            </p>
                        </div>

                        {getRowStatus(selectedStudent, approvedLeaves) === "terlambat" &&
                            (() => {
                                const att = selectedStudent.attendances[0];
                                return (
                                    <div className="border border-border/80 rounded-xl p-4 space-y-3">
                                        <h3 className="font-bold text-primary text-[13px] uppercase tracking-wide">
                                            Detail Kehadiran
                                        </h3>
                                        <div className="space-y-2.5 text-[13px]">
                                            <div className="flex justify-between gap-3">
                                                <span className="text-text-muted">Waktu Check-in</span>
                                                <span className="font-semibold text-right">
                                                    {formatTimeSeconds(att?.check_in_time)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between gap-3">
                                                <span className="text-text-muted">Durasi Terlambat</span>
                                                <span className="font-semibold text-right">
                                                    {att?.late_minutes != null ? `${att.late_minutes} mnt` : "-"}
                                                </span>
                                            </div>
                                            {lateThreshold && (
                                                <div className="flex justify-between gap-3">
                                                    <span className="text-text-muted">Batas Telat</span>
                                                    <span className="font-semibold text-right">{formatTime(lateThreshold)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })()}

                        {getRowStatus(selectedStudent, approvedLeaves) === "diizinkan" &&
                            (() => {
                                const leave = approvedLeaves[selectedStudent.id];
                                if (!leave) return null;
                                const dateRange =
                                    leave.start_date === leave.end_date
                                        ? formatFullDate(leave.start_date)
                                        : `${formatFullDate(leave.start_date)} - ${formatFullDate(leave.end_date)}`;
                                return (
                                    <div className="border border-border/80 rounded-xl p-4 space-y-3">
                                        <h3 className="font-bold text-primary text-[13px] uppercase tracking-wide">
                                            Detail Pengajuan Izin
                                        </h3>
                                        <div className="space-y-2.5 text-[13px]">
                                            <div className="flex justify-between gap-3">
                                                <span className="text-text-muted">Kategori</span>
                                                <span className="font-semibold text-right">
                                                    {translateCategory(leave.category)} Diterima
                                                </span>
                                            </div>
                                            <div className="flex justify-between gap-3">
                                                <span className="text-text-muted">Tanggal</span>
                                                <span className="font-semibold text-right">{dateRange}</span>
                                            </div>
                                            {leave.description && (
                                                <div className="flex justify-between gap-3">
                                                    <span className="text-text-muted">Deskripsi</span>
                                                    <span className="font-semibold text-right max-w-[60%]">
                                                        {leave.description}
                                                    </span>
                                                </div>
                                            )}
                                            {leave.document_url && (
                                                <div className="flex justify-between gap-3">
                                                    <span className="text-text-muted">Dokumen</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setPreviewUrl(leave.document_url)}
                                                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border text-[12px] font-semibold text-primary hover:bg-primary/5 transition-colors"
                                                    >
                                                        {isImageUrl(leave.document_url) ? (
                                                            <FiImage className="text-[14px] shrink-0" />
                                                        ) : (
                                                            <FiFileText className="text-[14px] shrink-0" />
                                                        )}
                                                        Lihat Dokumen
                                                        {isImageUrl(leave.document_url) && (
                                                            <img
                                                                src={leave.document_url}
                                                                alt="Dokumen"
                                                                className="w-10 h-10 rounded-lg object-cover border border-border shrink-0"
                                                            />
                                                        )}
                                                    </button>
                                                </div>
                                            )}
                                            <div className="flex justify-between gap-3">
                                                <span className="text-text-muted">Diajukan oleh</span>
                                                <span className="font-semibold text-right">
                                                    {leave.guardian_name ?? "-"}
                                                </span>
                                            </div>
                                            <div className="flex justify-between gap-3">
                                                <span className="text-text-muted">Diajukan pada</span>
                                                <span className="font-semibold text-right">
                                                    {formatDateTime(leave.created_at)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between gap-3">
                                                <span className="text-text-muted">Diterima pada</span>
                                                <span className="font-semibold text-right">
                                                    {formatDateTime(leave.updated_at)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}

                        {getRowStatus(selectedStudent, approvedLeaves) === "alpa" &&
                            (() => {
                                const streak = selectedStudent.consecutiveAbsences;
                                return (
                                    <div className="border border-danger-light rounded-xl p-4 space-y-3 bg-danger-bg">
                                        <h3 className="font-bold text-danger text-[13px] uppercase tracking-wide">
                                            {streak >= 2 ? `Alpa ${streak}× Berturut-turut` : "Alpa Hari Ini"}
                                        </h3>
                                        <p className="text-[13px] text-text-secondary">
                                            {streak >= 2
                                                ? `Anak ini tercatat alpa ${streak} hari berturut-turut tanpa keterangan.`
                                                : "Anak ini tercatat alpa hari ini tanpa keterangan. Hubungi wali murid untuk konfirmasi."}
                                        </p>
                                        <ContactGuardianButton student={selectedStudent} className={schoolClass.name} />
                                    </div>
                                );
                            })()}
                    </div>
                )}
            </Drawer>

            <PreviewImageModal url={previewUrl} onClose={() => setPreviewUrl(null)} />
        </AppShell>
    );
}