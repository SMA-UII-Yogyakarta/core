import { useState, useMemo } from "react";
import { router } from "@inertiajs/react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Button,
    ConfirmDialog,
    Card,
    PageHeader,
    SearchBar,
    EmptyState,
    Avatar,
    Table,
    Pagination,
    Drawer,
    TabSwitcher,
} from "@/Components";
import type { Column } from "@/Components/ui/Table";
import AppShell from "@/Layouts/AppShell";
import {
    FiUserPlus,
    FiUserX,
    FiCheckCircle,
    FiArrowLeft,
    FiSearch,
    FiUsers,
    FiUserCheck,
} from "react-icons/fi";
import { useMediaQuery } from "@/hooks/useMediaQuery";

interface Student {
    id: number;
    name: string;
    nis: string;
    nisn: string;
    class?: { id: number; name: string };
    guardian_id?: number | null;
}

interface Guardian {
    id: number;
    name: string;
    phone: string | null;
    address: string | null;
    user?: { email: string };
    students?: Student[];
}

interface Props {
    guardians: Guardian[];
    unassignedStudents: Student[];
    allStudents: Student[];
    selectedGuardianId?: number | null;
}

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

export default function GuardianAssignment({
    guardians = [],
    unassignedStudents = [],
    allStudents = [],
    selectedGuardianId,
}: Props) {
    const isDesktop = useMediaQuery("(min-width: 1024px)");

    const [guardianId, setGuardianId] = useState<string>(
        selectedGuardianId ? selectedGuardianId.toString() : "",
    );
    const [guardianSearch, setGuardianSearch] = useState("");
    const [guardianPage, setGuardianPage] = useState(1);
    const guardianPageSize = 10;

    const [linkedPage, setLinkedPage] = useState(1);
    const linkedPageSize = 10;

    // Stack navigation inside panel / drawer ("list" -> "assign")
    const [panelView, setPanelView] = useState<"list" | "assign">("list");
    const [stackDirection, setStackDirection] = useState<number>(1);

    const [assignTab, setAssignTab] = useState<"unassigned" | "all">("unassigned");
    const [studentSearch, setStudentSearch] = useState("");
    const [assignPage, setAssignPage] = useState(1);
    const assignPageSize = 10;

    const [removeConfirmId, setRemoveConfirmId] = useState<number | null>(null);
    const [linkedDrawerOpen, setLinkedDrawerOpen] = useState(false);

    // Filter & Paginate Guardians
    const filteredGuardians = useMemo(() => {
        return guardians.filter(
            (g) =>
                g.name.toLowerCase().includes(guardianSearch.toLowerCase()) ||
                (g.phone && g.phone.includes(guardianSearch)) ||
                (g.user?.email && g.user.email.toLowerCase().includes(guardianSearch.toLowerCase())),
        );
    }, [guardians, guardianSearch]);

    const guardianTotalPages = Math.ceil(filteredGuardians.length / guardianPageSize) || 1;
    const guardianSafePage = Math.min(Math.max(1, guardianPage), guardianTotalPages);
    const paginatedGuardians = useMemo(() => {
        const start = (guardianSafePage - 1) * guardianPageSize;
        return filteredGuardians.slice(start, start + guardianPageSize);
    }, [filteredGuardians, guardianSafePage, guardianPageSize]);

    // Selected Guardian & Linked Students
    const selectedGuardian = useMemo(() => {
        return guardians.find((g) => g.id.toString() === guardianId) || null;
    }, [guardians, guardianId]);

    const linkedStudents = useMemo(() => {
        return selectedGuardian?.students || [];
    }, [selectedGuardian]);

    const linkedTotalPages = Math.ceil(linkedStudents.length / linkedPageSize) || 1;
    const linkedSafePage = Math.min(Math.max(1, linkedPage), linkedTotalPages);
    const paginatedLinked = useMemo(() => {
        const start = (linkedSafePage - 1) * linkedPageSize;
        return linkedStudents.slice(start, start + linkedPageSize);
    }, [linkedStudents, linkedSafePage, linkedPageSize]);

    // Assign Students List (Filter & Paginate)
    const availableStudents = assignTab === "unassigned" ? unassignedStudents : allStudents;
    const filteredAssignStudents = useMemo(() => {
        const q = studentSearch.toLowerCase();
        return availableStudents.filter(
            (s) =>
                s.name.toLowerCase().includes(q) ||
                s.nis.toLowerCase().includes(q) ||
                (s.nisn && s.nisn.toLowerCase().includes(q)) ||
                (s.class?.name && s.class.name.toLowerCase().includes(q)),
        );
    }, [availableStudents, studentSearch]);

    const assignTotalPages = Math.ceil(filteredAssignStudents.length / assignPageSize) || 1;
    const assignSafePage = Math.min(Math.max(1, assignPage), assignTotalPages);
    const paginatedAssignStudents = useMemo(() => {
        const start = (assignSafePage - 1) * assignPageSize;
        return filteredAssignStudents.slice(start, start + assignPageSize);
    }, [filteredAssignStudents, assignSafePage, assignPageSize]);

    const handleSelectGuardian = (id: string) => {
        if (guardianId === id) {
            setGuardianId("");
            setLinkedPage(1);
            setPanelView("list");
            if (!isDesktop) {
                setLinkedDrawerOpen(false);
            }
            router.get(
                "/guardian-assignment",
                {},
                { preserveState: true, preserveScroll: true },
            );
            return;
        }

        setGuardianId(id);
        setLinkedPage(1);
        setPanelView("list");
        if (!isDesktop) {
            setLinkedDrawerOpen(true);
        }
        router.get(
            "/guardian-assignment",
            { guardian_id: id },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleOpenAssignView = () => {
        setStudentSearch("");
        setAssignPage(1);
        setStackDirection(1);
        setPanelView("assign");
    };

    const handleBackToList = () => {
        setStackDirection(-1);
        setPanelView("list");
    };

    const handleAssign = (studentId: number) => {
        if (!guardianId) return;
        router.post(
            "/guardian-assignment/assign",
            {
                guardian_id: Number(guardianId),
                student_id: studentId,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setStackDirection(-1);
                    setPanelView("list");
                },
            },
        );
    };

    const handleRemove = (studentId: number) => {
        setRemoveConfirmId(studentId);
    };

    const confirmRemove = () => {
        if (!removeConfirmId) return;
        router.delete(`/guardian-assignment/remove/${removeConfirmId}`, {
            preserveScroll: true,
            onSuccess: () => {
                setRemoveConfirmId(null);
            },
        });
    };

    // Table columns for linked students
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
                className: "w-16 text-center whitespace-nowrap",
                render: (s: Student) => (
                    <button
                        onClick={() => handleRemove(s.id)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-md text-danger hover:text-danger/90 hover:bg-danger-bg active:bg-danger-light border border-transparent hover:border-danger-light transition-colors cursor-pointer"
                        type="button"
                        title="Lepas hubungan wali"
                        aria-label={`Lepas hubungan ${s.name}`}
                        data-testid={`btn-remove-student-${s.id}`}
                    >
                        <FiUserX className="text-[14px]" />
                    </button>
                ),
            },
        ],
        [],
    );

    // Interactive Stack Content (Shared across Desktop Panel & Mobile Drawer)
    const renderStackContent = () => {
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
                            className="flex flex-col gap-4 h-full min-h-0"
                        >
                            {/* Card Header Info & Quick Action Button */}
                            <Card className="p-4 sm:p-5 border-border shadow-xs shrink-0">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-[15px] sm:text-[16px] font-bold text-primary font-inter truncate">
                                                Anak Terhubung: {selectedGuardian.name}
                                            </h2>
                                            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold shrink-0">
                                                {linkedStudents.length} Siswa
                                            </span>
                                        </div>
                                        <p className="text-[12px] text-text-secondary mt-0.5 truncate">
                                            Kontak: {selectedGuardian.phone || "-"} · Alamat: {selectedGuardian.address || "-"}
                                        </p>
                                    </div>
                                    {linkedStudents.length > 0 && (
                                        <Button
                                            onClick={handleOpenAssignView}
                                            className="shrink-0 whitespace-nowrap self-start sm:self-auto h-9 text-[13px] px-4 font-bold shadow-xs"
                                            data-testid="btn-add-student"
                                            icon={<FiUserPlus className="text-[13px]" />}
                                        >
                                            Hubungkan Siswa
                                        </Button>
                                    )}
                                </div>
                            </Card>

                            {/* Table of Linked Students (Directly rendered without double card wrapping) */}
                            {linkedStudents.length > 0 ? (
                                <div className="flex-1 min-h-0 flex flex-col justify-between gap-3">
                                    <Table
                                        columns={columns}
                                        data={paginatedLinked}
                                        keyExtractor={(s: Student) => s.id}
                                        containerClassName="flex-1 min-h-0 overflow-auto bg-surface"
                                    />
                                    {linkedStudents.length > linkedPageSize && (
                                        <div className="pt-2 shrink-0 mt-auto font-inter">
                                            <Pagination
                                                currentPage={linkedSafePage}
                                                totalPages={linkedTotalPages}
                                                totalItems={linkedStudents.length}
                                                perPage={linkedPageSize}
                                                onPageChange={setLinkedPage}
                                            />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Card className="flex-1 min-h-0 flex flex-col items-center justify-center bg-surface rounded-xl border border-border p-6 sm:p-10 shadow-card">
                                    <EmptyState
                                        variant="no-data"
                                        title="Belum Ada Siswa Terhubung"
                                        description="Wali murid ini belum memiliki hubungan dengan data siswa di database."
                                        actionLabel="Hubungkan Siswa Sekarang"
                                        actionOnClick={handleOpenAssignView}
                                    />
                                </Card>
                            )}
                        </motion.div>
                    ) : (
                        /* Stack View 2: Assign Student View (Seamless in-place stack transition) */
                        <motion.div
                            key="view-assign-student"
                            custom={stackDirection}
                            variants={stackVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="flex flex-col gap-3.5 bg-surface rounded-xl border border-border p-4 sm:p-5 shadow-card h-full min-h-0"
                        >
                            {/* Stack Navigation Header */}
                            <div className="flex items-center justify-between pb-2.5 border-b border-border shrink-0">
                                <button
                                    type="button"
                                    onClick={handleBackToList}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-muted font-bold text-[13px] transition-colors cursor-pointer"
                                >
                                    <FiArrowLeft className="w-4 h-4 text-primary" />
                                    <span>Kembali ke Daftar</span>
                                </button>
                                <span className="text-[12px] font-semibold text-text-muted truncate max-w-[200px]">
                                    Wali: <strong className="text-text-primary">{selectedGuardian.name}</strong>
                                </span>
                            </div>

                            {/* Tabs Segmented (Full Width to span 100% of card space) */}
                            <TabSwitcher
                                tabs={[
                                    { key: "unassigned", label: `Belum Punya Wali (${unassignedStudents.length})`, icon: <FiUsers className="w-3.5 h-3.5" /> },
                                    { key: "all", label: `Semua Siswa (${allStudents.length})`, icon: <FiUserCheck className="w-3.5 h-3.5" /> },
                                ]}
                                activeKey={assignTab}
                                onChange={(key) => {
                                    setAssignTab(key as "unassigned" | "all");
                                    setAssignPage(1);
                                }}
                                variant="segmented"
                                fullWidth
                            />

                            {/* Search Bar (Full width below tabs) */}
                            <div className="w-full shrink-0">
                                <SearchBar
                                    value={studentSearch}
                                    onChange={(val) => {
                                        setStudentSearch(val);
                                        setAssignPage(1);
                                    }}
                                    onSearch={() => setAssignPage(1)}
                                    placeholder="Cari nama, NIS, atau rombel siswa..."
                                />
                            </div>

                            {/* Student Items List */}
                            <div className="flex-1 min-h-0 overflow-y-auto pr-1 flex flex-col gap-2">
                                {paginatedAssignStudents.length > 0 ? (
                                    paginatedAssignStudents.map((s) => (
                                        <div
                                            key={s.id}
                                            className="p-3 border border-border rounded-xl flex items-center justify-between hover:bg-surface-raised transition-colors shadow-xs"
                                        >
                                            <div className="flex items-center gap-3 min-w-0 flex-1 mr-3">
                                                <Avatar name={s.name} size="sm" variant="accent" />
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-[13px] font-bold text-text-primary truncate" title={s.name}>
                                                        {s.name}
                                                    </p>
                                                    <p className="text-[11px] text-text-secondary truncate">
                                                        NIS: {s.nis} · {s.class?.name ?? "Tanpa Kelas"}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                size="sm"
                                                onClick={() => handleAssign(s.id)}
                                                data-testid={`btn-assign-${s.id}`}
                                                className="shrink-0 h-8 px-3 text-[12px] font-bold"
                                                icon={<FiUserPlus className="text-[12px]" />}
                                            >
                                                Hubungkan
                                            </Button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-12 text-center text-text-muted my-auto">
                                        <FiSearch className="text-2xl mx-auto mb-2 opacity-50" />
                                        <p className="text-[13px] font-medium">Tidak ada siswa yang sesuai pencarian.</p>
                                    </div>
                                )}
                            </div>

                            {/* Pagination (Left Info, Right Buttons - Compact) */}
                            {filteredAssignStudents.length > assignPageSize && (
                                <div className="pt-2 shrink-0 mt-auto">
                                    <Pagination
                                        currentPage={assignSafePage}
                                        totalPages={assignTotalPages}
                                        totalItems={filteredAssignStudents.length}
                                        perPage={assignPageSize}
                                        onPageChange={setAssignPage}
                                        compact
                                    />
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    return (
        <AppShell title="Relasi Wali Murid & Siswa">
            <PageHeader
                title="Relasi Wali Murid & Siswa"
                description="Hubungkan orang tua / wali murid dengan siswa binaan untuk pemantauan kehadiran dan izin."
                className="shrink-0 mb-4"
            >
                <div className="w-full sm:w-64">
                    <SearchBar
                        value={guardianSearch}
                        onChange={(val) => {
                            setGuardianSearch(val);
                            setGuardianPage(1);
                        }}
                        onSearch={() => setGuardianPage(1)}
                        placeholder="Cari nama atau telepon wali..."
                    />
                </div>
            </PageHeader>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch flex-1 min-h-0">
                {/* Left Column (Desktop): Detail Panel / Anak Terhubung & Assign View */}
                <div className="hidden lg:flex lg:col-span-7 flex-col h-full min-h-0 overflow-hidden">
                    {renderStackContent()}
                </div>

                {/* Right Column: Daftar Wali Murid */}
                <div className="lg:col-span-5 flex flex-col gap-3 bg-surface border border-border rounded-xl p-4 sm:p-5 shadow-card h-full min-h-0 overflow-hidden">
                    <div className="flex items-center justify-between border-b border-border pb-2.5 shrink-0">
                        <h2 className="text-[15px] font-bold text-primary font-inter">
                            Pilih Wali Murid ({guardians.length})
                        </h2>
                    </div>

                    <div className="flex-1 min-h-0 overflow-y-auto pr-1 flex flex-col gap-2">
                        {paginatedGuardians.map((g) => {
                            const isSelected = g.id.toString() === guardianId;
                            return (
                                <button
                                    key={g.id}
                                    type="button"
                                    onClick={() => handleSelectGuardian(g.id.toString())}
                                    data-testid={`guardian-item-${g.id}`}
                                    className={`text-left p-3 rounded-lg border transition-all cursor-pointer flex items-start gap-3 shrink-0 ${
                                        isSelected
                                            ? "border-primary bg-primary/5 shadow-sm"
                                            : "border-border/60 hover:border-primary/40 bg-surface"
                                    }`}
                                >
                                    <Avatar name={g.name} size="sm" variant={isSelected ? "primary" : "muted"} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[13px] font-bold text-text-primary truncate">{g.name}</p>
                                        <p className="text-[12px] text-text-secondary truncate">
                                            {g.phone || "Tidak ada telepon"} · {g.user?.email || "-"}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-surface-raised border border-border text-text-secondary">
                                                {g.students?.length ?? 0} Siswa
                                            </span>
                                            {g.address && (
                                                <p className="text-[11px] text-text-inactive truncate flex-1">
                                                    {g.address}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    {isSelected && (
                                        <span className="text-primary font-bold text-[12px]">
                                            <FiCheckCircle />
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {filteredGuardians.length > guardianPageSize && (
                        <div className="pt-2.5 shrink-0 mt-auto border-t border-border/50 font-inter">
                            <Pagination
                                currentPage={guardianSafePage}
                                totalPages={guardianTotalPages}
                                totalItems={filteredGuardians.length}
                                perPage={guardianPageSize}
                                onPageChange={setGuardianPage}
                                compact
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile/Tablet Drawer: In-Place Stack Navigation without Nested Modals */}
            {!isDesktop && (
                <Drawer
                    open={linkedDrawerOpen}
                    onClose={() => setLinkedDrawerOpen(false)}
                    title={
                        panelView === "list"
                            ? `Anak Terhubung: ${selectedGuardian?.name ?? "Wali Murid"}`
                            : `Hubungkan Siswa: ${selectedGuardian?.name ?? "Wali Murid"}`
                    }
                    description={
                        panelView === "list"
                            ? (selectedGuardian?.phone ? `Kontak: ${selectedGuardian.phone}` : "Daftar siswa asuh terhubung")
                            : "Pilih siswa yang akan diasosiasikan dengan wali murid ini."
                    }
                    width="xl"
                    showFooter={false}
                >
                    {renderStackContent()}
                </Drawer>
            )}

            {/* Confirm Dialog: Lepas Siswa */}
            <ConfirmDialog
                open={Boolean(removeConfirmId)}
                onClose={() => setRemoveConfirmId(null)}
                onConfirm={confirmRemove}
                title="Lepas Hubungan Wali Murid?"
                message="Siswa akan dilepaskan dari pengawasan wali murid ini. Data riwayat kehadiran siswa tetap aman."
                confirmLabel="Lepas Hubungan"
                variant="danger"
            />
        </AppShell>
    );
}