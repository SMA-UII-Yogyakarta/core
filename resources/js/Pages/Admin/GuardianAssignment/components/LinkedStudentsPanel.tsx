import { useMemo } from "react";
import { FiUserX, FiUserPlus, FiArrowLeft, FiSearch, FiUsers, FiUserCheck, FiCheck } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Table, Avatar, Pagination, EmptyState, Card, TabSwitcher, SearchBar } from "@/Components";
import type { Column } from "@/Components/ui/Table";
import type { Student, Guardian } from "../types";

const stackVariants = {
    initial: (direction: number) => ({
        opacity: 0,
        x: direction > 0 ? 30 : -30,
    }),
    animate: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.22, ease: "easeInOut" as const },
    },
    exit: (direction: number) => ({
        opacity: 0,
        x: direction > 0 ? -30 : 30,
        transition: { duration: 0.18, ease: "easeInOut" as const },
    }),
};

export interface LinkedStudentsPanelProps {
    selectedGuardian: Guardian | null;
    linkedStudents: Student[];
    linkedPage: number;
    onLinkedPageChange: (page: number) => void;
    linkedPageSize: number;
    panelView: "list" | "assign";
    stackDirection: number;
    onOpenAssign: () => void;
    onBackToList: () => void;
    onRemoveStudent: (studentId: number) => void;
    assignTab: "unassigned" | "all";
    onAssignTabChange: (tab: "unassigned" | "all") => void;
    unassignedStudentsCount: number;
    allStudentsCount: number;
    studentSearch: string;
    onStudentSearchChange: (val: string) => void;
    paginatedAssignStudents: Student[];
    assignPage: number;
    assignTotalPages: number;
    filteredAssignTotal: number;
    assignPageSize: number;
    onAssignPageChange: (page: number) => void;
    onAssignStudent: (studentId: number) => void;
    isDrawer?: boolean;
}

export default function LinkedStudentsPanel({
    selectedGuardian,
    linkedStudents,
    linkedPage,
    onLinkedPageChange,
    linkedPageSize,
    panelView,
    stackDirection,
    onOpenAssign,
    onBackToList,
    onRemoveStudent,
    assignTab,
    onAssignTabChange,
    unassignedStudentsCount,
    allStudentsCount,
    studentSearch,
    onStudentSearchChange,
    paginatedAssignStudents,
    assignPage,
    assignTotalPages,
    filteredAssignTotal,
    assignPageSize,
    onAssignPageChange,
    onAssignStudent,
    isDrawer = false,
}: LinkedStudentsPanelProps) {
    const columns: Column<Student>[] = useMemo(
        () => [
            {
                key: "avatar",
                header: "",
                className: "w-10 text-center",
                render: (s: Student) => <Avatar name={s.name} size="sm" variant="accent" />,
            },
            {
                key: "name",
                header: "Nama Siswa",
                className: "w-full min-w-0",
                render: (s: Student) => (
                    <div className="min-w-0 max-w-[200px] sm:max-w-none">
                        <p className="font-semibold text-primary truncate" title={s.name}>{s.name}</p>
                        <p className="text-[12px] text-text-secondary truncate">NIS: {s.nis} &middot; NISN: {s.nisn}</p>
                    </div>
                ),
            },
            {
                key: "class",
                header: "Kelas",
                className: "w-1 whitespace-nowrap text-center",
                render: (s: Student) => (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-semibold bg-surface-raised border border-border text-text-primary whitespace-nowrap shrink-0">
                        {s.class?.name ?? "Belum Masuk Kelas"}
                    </span>
                ),
            },
            {
                key: "actions",
                header: <div className="text-center w-full">Aksi</div>,
                className: "w-24 text-center whitespace-nowrap",
                render: (s: Student) => (
                    <button
                        onClick={() => onRemoveStudent(s.id)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-danger hover:text-danger/90 hover:bg-danger-bg active:bg-danger-light border border-danger/20 transition-colors cursor-pointer text-[12px] font-semibold"
                        type="button"
                        title="Lepas hubungan wali"
                        aria-label={`Lepas hubungan ${s.name}`}
                        data-testid={`btn-remove-student-${s.id}`}
                    >
                        <FiUserX className="text-[13px]" />
                        <span>Lepas</span>
                    </button>
                ),
            },
        ],
        [onRemoveStudent]
    );

    const linkedTotalPages = Math.max(1, Math.ceil(linkedStudents.length / linkedPageSize));
    const linkedSafePage = Math.min(Math.max(1, linkedPage), linkedTotalPages);
    const paginatedLinked = useMemo(() => {
        const start = (linkedSafePage - 1) * linkedPageSize;
        return linkedStudents.slice(start, start + linkedPageSize);
    }, [linkedStudents, linkedSafePage, linkedPageSize]);

    const assignTabs = useMemo(
        () => [
            { key: "unassigned", label: `Belum Punya Wali (${unassignedStudentsCount})`, icon: <FiUsers className="w-3.5 h-3.5" /> },
            { key: "all", label: `Semua Siswa (${allStudentsCount})`, icon: <FiUserCheck className="w-3.5 h-3.5" /> },
        ],
        [unassignedStudentsCount, allStudentsCount]
    );

    if (!selectedGuardian) {
        return (
            <Card className="flex flex-col items-center justify-center text-center p-8 sm:p-12 text-text-inactive h-full border-border shadow-card bg-surface rounded-xl">
                <div className="w-14 h-14 rounded-full bg-primary/5 flex items-center justify-center mb-4">
                    <FiUsers className="text-2xl text-primary" />
                </div>
                <p className="text-[14px] font-medium text-text-secondary max-w-sm">
                    Pilih salah satu wali murid di panel kanan untuk mengelola siswa terhubung.
                </p>
            </Card>
        );
    }

    return (
        <div className="relative overflow-hidden w-full h-full flex flex-col min-h-0">
            <AnimatePresence mode="wait" custom={stackDirection}>
                {panelView === "list" ? (
                    /* Stack View 1: Linked Students List */
                    <motion.div
                        key="view-linked-list"
                        custom={stackDirection}
                        variants={stackVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className={
                            isDrawer
                                ? "flex flex-col h-full min-h-0 overflow-hidden font-inter"
                                : "bg-surface rounded-2xl border border-border shadow-card h-full min-h-0 flex flex-col overflow-hidden font-inter"
                        }
                    >
                        {/* Card Header Info & Quick Action Button */}
                        {!isDrawer && (
                            <div className="px-4 py-3.5 sm:px-5 sm:py-4 border-b border-border shrink-0">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-[15px] sm:text-[16px] font-bold text-primary font-inter truncate">
                                                Anak Terhubung: {selectedGuardian.name}
                                            </h2>
                                            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold shrink-0 border border-primary/20">
                                                {linkedStudents.length} Siswa
                                            </span>
                                        </div>
                                        <p className="text-[12px] text-text-secondary mt-0.5 truncate">
                                            Kontak: {selectedGuardian.phone || "-"} · Alamat: {selectedGuardian.address || "-"}
                                        </p>
                                    </div>
                                    {linkedStudents.length > 0 && (
                                        <Button
                                            onClick={onOpenAssign}
                                            className="shrink-0 whitespace-nowrap self-start sm:self-auto h-9 text-[12.5px] px-3.5 font-bold shadow-xs rounded-xl"
                                            data-testid="btn-add-student"
                                            icon={<FiUserPlus className="text-[13px]" />}
                                        >
                                            Hubungkan Siswa
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Table of Linked Students */}
                        {linkedStudents.length > 0 ? (
                            <div className="flex-1 min-h-0 flex flex-col justify-between">
                                <Table
                                    columns={columns}
                                    data={paginatedLinked}
                                    keyExtractor={(s: Student) => s.id}
                                    containerClassName="flex-1 min-h-0 overflow-auto bg-surface"
                                />
                                {linkedStudents.length > linkedPageSize && (
                                    <div className="px-4 py-3 sm:px-5 shrink-0 mt-auto border-t border-border bg-surface/50 font-inter">
                                        <Pagination
                                            currentPage={linkedSafePage}
                                            totalPages={linkedTotalPages}
                                            totalItems={linkedStudents.length}
                                            perPage={linkedPageSize}
                                            onPageChange={onLinkedPageChange}
                                            compact
                                        />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-6 text-center my-auto">
                                <EmptyState
                                    variant="no-data"
                                    title="Belum Ada Siswa Terhubung"
                                    description="Wali murid ini belum memiliki hubungan dengan data siswa di database."
                                    actionLabel="Hubungkan Siswa Sekarang"
                                    actionOnClick={onOpenAssign}
                                />
                            </div>
                        )}
                    </motion.div>
                ) : (
                    /* Stack View 2: Assign Student View */
                    <motion.div
                        key="view-assign-student"
                        custom={stackDirection}
                        variants={stackVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className={
                            isDrawer
                                ? "flex flex-col h-full min-h-0 overflow-hidden font-inter"
                                : "bg-surface rounded-2xl border border-border shadow-card h-full min-h-0 flex flex-col overflow-hidden font-inter"
                        }
                    >
                        {/* Header Controls */}
                        {isDrawer ? (
                            <div className="flex items-center justify-between gap-3 p-3 sm:p-4 border-b border-border shrink-0">
                                <div className="shrink-0">
                                    <TabSwitcher
                                        tabs={assignTabs}
                                        activeKey={assignTab}
                                        onChange={(key) => onAssignTabChange(key as "unassigned" | "all")}
                                        variant="segmented"
                                        size="sm"
                                    />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <SearchBar
                                        value={studentSearch}
                                        onChange={onStudentSearchChange}
                                        onSearch={() => {}}
                                        placeholder="Cari nama, NIS, atau rombel..."
                                        inputClassName="!h-9 text-[12px] sm:text-[12.5px]"
                                    />
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Header Row: Tabs on Left, Back to List on Right */}
                                <div className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-5 sm:py-4 border-b border-border shrink-0 flex-wrap sm:flex-nowrap">
                                    <div className="min-w-0">
                                        <TabSwitcher
                                            tabs={assignTabs}
                                            activeKey={assignTab}
                                            onChange={(key) => onAssignTabChange(key as "unassigned" | "all")}
                                            variant="segmented"
                                            size="sm"
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={onBackToList}
                                        className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-border bg-surface hover:bg-muted/40 text-text-secondary hover:text-text-primary font-bold text-[12.5px] transition-all cursor-pointer shrink-0 active:scale-95 shadow-xs"
                                    >
                                        <FiArrowLeft className="w-4 h-4 text-primary" />
                                        <span>Kembali ke Daftar</span>
                                    </button>
                                </div>

                                {/* Search Bar Row */}
                                <div className="p-3 sm:px-5 sm:py-3 border-b border-border/50 shrink-0 bg-surface">
                                    <SearchBar
                                        value={studentSearch}
                                        onChange={onStudentSearchChange}
                                        onSearch={() => {}}
                                        placeholder="Cari nama, NIS, atau rombel siswa..."
                                    />
                                </div>
                            </>
                        )}

                        {/* Edge-to-Edge Student Items List */}
                        <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-border/40">
                            {paginatedAssignStudents.length > 0 ? (
                                paginatedAssignStudents.map((s) => {
                                    const isAssigned = Boolean(s.guardian_id);
                                    const isAssignedToThis = Boolean(selectedGuardian && s.guardian_id === selectedGuardian.id);

                                    return (
                                        <div
                                            key={s.id}
                                            className="px-4 py-3 sm:px-5 sm:py-3.5 hover:bg-muted/30 transition-colors flex items-center justify-between gap-3 w-full"
                                        >
                                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                                <Avatar name={s.name} size="sm" variant="accent" className="shrink-0" />
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-[13.5px] font-bold text-text-primary truncate" title={s.name}>
                                                        {s.name}
                                                    </p>
                                                    <p className="text-[12px] text-text-secondary mt-0.5 truncate">
                                                        NIS: {s.nis} · {s.class?.name ?? "Tanpa Kelas"}
                                                        {isAssigned && !isAssignedToThis && s.guardian?.name && (
                                                            <span className="text-text-muted"> · Wali: {s.guardian.name}</span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                            {isAssigned ? (
                                                <span
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11.5px] font-semibold shrink-0 select-none ${
                                                        isAssignedToThis
                                                            ? "bg-primary/10 text-primary border border-primary/20"
                                                            : "bg-muted text-text-muted border border-border/70"
                                                    }`}
                                                >
                                                    <FiCheck className="w-3.5 h-3.5" />
                                                    <span>{isAssignedToThis ? "Sudah Terhubung" : (s.guardian?.name ? `Wali: ${s.guardian.name}` : "Sudah Punya Wali")}</span>
                                                </span>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    onClick={() => onAssignStudent(s.id)}
                                                    data-testid={`btn-assign-${s.id}`}
                                                    className="shrink-0 h-8 px-3.5 text-[12px] font-bold shadow-2xs rounded-xl"
                                                    icon={<FiUserPlus className="text-[12px]" />}
                                                >
                                                    Hubungkan
                                                </Button>
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="py-12 text-center text-text-muted my-auto">
                                    <FiSearch className="text-2xl mx-auto mb-2 opacity-50" />
                                    <p className="text-[13px] font-medium">
                                        {studentSearch
                                            ? "Tidak ada siswa yang sesuai pencarian."
                                            : assignTab === "unassigned"
                                            ? "Semua siswa sudah terhubung dengan wali murid."
                                            : "Tidak ada data siswa."}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Footer Pagination */}
                        {filteredAssignTotal > assignPageSize && (
                            <div className="px-4 py-3 sm:px-5 shrink-0 mt-auto border-t border-border bg-surface/50 font-inter">
                                <Pagination
                                    currentPage={assignPage}
                                    totalPages={assignTotalPages}
                                    totalItems={filteredAssignTotal}
                                    perPage={assignPageSize}
                                    onPageChange={onAssignPageChange}
                                    compact
                                />
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}