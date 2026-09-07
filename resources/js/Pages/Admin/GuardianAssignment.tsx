import { useState, useMemo, useEffect } from "react";
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
    MobileNativePagination,
    Drawer,
    TabSwitcher,
} from "@/Components";
import AppShell from "@/Layouts/AppShell";
import {
    FiUserPlus,
    FiUserX,
    FiArrowLeft,
    FiSearch,
    FiUsers,
    FiUserCheck,
    FiChevronRight,
    FiCheck,
} from "react-icons/fi";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { Student, Guardian } from "./GuardianAssignment/types";
import GuardianList from "./GuardianAssignment/components/GuardianList";
import LinkedStudentsPanel from "./GuardianAssignment/components/LinkedStudentsPanel";

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
    const isTablet = useMediaQuery("(min-width: 640px) and (max-width: 1023px)");
    const isMobile = useMediaQuery("(max-width: 639px)");

    // Initial Guardian ID from URL search param or selectedGuardianId prop
    const getInitialGuardianId = (): string => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const gId = params.get("guardian_id");
            if (gId) return gId;
        }
        return selectedGuardianId ? selectedGuardianId.toString() : "";
    };

    const [guardianId, setGuardianId] = useState<string>(getInitialGuardianId);
    const [guardianSearch, setGuardianSearch] = useState("");
    const [guardianPage, setGuardianPage] = useState(1);
    const guardianPageSize = 10;

    const [linkedPage, setLinkedPage] = useState(1);
    const linkedPageSize = 10;

    // Stack navigation inside panel / drawer / mobile subpage ("list" -> "assign")
    const [panelView, setPanelView] = useState<"list" | "assign">("list");
    const [stackDirection, setStackDirection] = useState<number>(1);

    const [assignTab, setAssignTab] = useState<"unassigned" | "all">("unassigned");
    const [studentSearch, setStudentSearch] = useState("");
    const [assignPage, setAssignPage] = useState(1);
    const assignPageSize = 10;

    const [removeConfirmId, setRemoveConfirmId] = useState<number | null>(null);

    // Tablet drawer open state (initialized if guardian_id is present on tablet)
    const [linkedDrawerOpen, setLinkedDrawerOpen] = useState<boolean>(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            return Boolean(params.get("guardian_id"));
        }
        return Boolean(selectedGuardianId);
    });

    // Handle physical/browser popstate navigation (Back / Forward)
    useEffect(() => {
        const handlePopState = () => {
            if (typeof window !== "undefined") {
                const params = new URLSearchParams(window.location.search);
                const gId = params.get("guardian_id");
                if (gId) {
                    setGuardianId(gId);
                    setPanelView("list");
                    if (isTablet) {
                        setLinkedDrawerOpen(true);
                    }
                } else {
                    setGuardianId("");
                    setPanelView("list");
                    setLinkedDrawerOpen(false);
                }
            }
        };

        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, [isTablet]);

    // Filter & Paginate Guardians
    const filteredGuardians = useMemo(() => {
        const q = guardianSearch.toLowerCase();
        return guardians.filter(
            (g) =>
                g.name.toLowerCase().includes(q) ||
                (g.phone && g.phone.includes(q)) ||
                (g.user?.email && g.user.email.toLowerCase().includes(q)),
        );
    }, [guardians, guardianSearch]);

    const guardianTotalPages = Math.max(1, Math.ceil(filteredGuardians.length / guardianPageSize));
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

    const linkedTotalPages = Math.max(1, Math.ceil(linkedStudents.length / linkedPageSize));
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

    const assignTotalPages = Math.max(1, Math.ceil(filteredAssignStudents.length / assignPageSize));
    const assignSafePage = Math.min(Math.max(1, assignPage), assignTotalPages);
    const paginatedAssignStudents = useMemo(() => {
        const start = (assignSafePage - 1) * assignPageSize;
        return filteredAssignStudents.slice(start, start + assignPageSize);
    }, [filteredAssignStudents, assignSafePage, assignPageSize]);

    // Navigation handlers
    const handleSelectGuardianDesktop = (id: string) => {
        if (guardianId === id) {
            setGuardianId("");
            setLinkedPage(1);
            setPanelView("list");
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
        router.get(
            "/guardian-assignment",
            { guardian_id: id },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleSelectGuardianTablet = (id: string) => {
        if (guardianId === id && linkedDrawerOpen) {
            handleCloseDrawerTablet();
            return;
        }

        setGuardianId(id);
        setLinkedPage(1);
        setPanelView("list");
        setLinkedDrawerOpen(true);
        router.get(
            "/guardian-assignment",
            { guardian_id: id },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleCloseDrawerTablet = () => {
        setLinkedDrawerOpen(false);
        setGuardianId("");
        setPanelView("list");
        router.get(
            "/guardian-assignment",
            {},
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleSelectGuardianMobile = (id: string) => {
        setGuardianId(id);
        setLinkedPage(1);
        setPanelView("list");
        if (typeof window !== "undefined") {
            window.history.pushState({ guardian_id: id }, "", `/guardian-assignment?guardian_id=${id}`);
        }
        router.get(
            "/guardian-assignment",
            { guardian_id: id },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleMobileBackToHub = () => {
        setGuardianId("");
        setPanelView("list");
        if (typeof window !== "undefined") {
            window.history.pushState({}, "", "/guardian-assignment");
        }
        router.get(
            "/guardian-assignment",
            {},
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleMobileBack = () => {
        if (panelView === "assign") {
            handleBackToList();
            return;
        }
        handleMobileBackToHub();
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
        const target = allStudents.find((s) => s.id === studentId);
        if (target?.guardian_id) return;

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

    // AppShell Title
    const getMobileHeaderTitle = () => {
        if (isMobile && guardianId && selectedGuardian) {
            if (panelView === "assign") return "Hubungkan Siswa";
            return "Detail Wali Murid";
        }
        return "Relasi Wali Murid & Siswa";
    };

    // Mobile Header Action: Add button
    const mobileHeaderActions = (
        <>
            {isMobile && guardianId && panelView === "list" && selectedGuardian && (
                <button
                    type="button"
                    onClick={handleOpenAssignView}
                    className="w-8 h-8 rounded-full bg-accent text-primary flex items-center justify-center hover:brightness-95 active:scale-95 transition-all cursor-pointer shadow-xs"
                    title="Hubungkan Siswa"
                    aria-label="Hubungkan Siswa"
                    data-testid="btn-mobile-assign-student"
                >
                    <FiUserPlus className="text-[15px]" />
                </button>
            )}
        </>
    );

    return (
        <AppShell
            title={getMobileHeaderTitle()}
            hasTopCard={true}
            onBack={isMobile && Boolean(guardianId) ? handleMobileBack : undefined}
            headerActions={mobileHeaderActions}
            searchValue={guardianSearch}
            onSearchChange={setGuardianSearch}
            searchPlaceholder="Cari nama atau telepon wali..."
            showNotificationBellOnMobile={!guardianId}
        >
            {/* Desktop PageHeader */}
            <PageHeader
                title="Relasi Wali Murid & Siswa"
                description="Hubungkan orang tua / wali murid dengan siswa binaan untuk pemantauan kehadiran dan izin."
                className="hidden lg:flex shrink-0 mb-4"
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

            {/* ───────────────────────────────────────────────────────────── */}
            {/* TABLET & DESKTOP LAYOUT (>= sm) */}
            {/* ───────────────────────────────────────────────────────────── */}
            <div className="hidden sm:grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch flex-1 min-h-0">
                {/* Left Column (Desktop only >= lg): Detail Panel / Anak Terhubung & Assign View */}
                <div className="hidden lg:flex lg:col-span-7 flex-col h-full min-h-0 overflow-hidden">
                    <LinkedStudentsPanel
                        selectedGuardian={selectedGuardian}
                        linkedStudents={linkedStudents}
                        linkedPage={linkedPage}
                        onLinkedPageChange={setLinkedPage}
                        linkedPageSize={linkedPageSize}
                        panelView={panelView}
                        stackDirection={stackDirection}
                        onOpenAssign={handleOpenAssignView}
                        onBackToList={handleBackToList}
                        onRemoveStudent={handleRemove}
                        assignTab={assignTab}
                        onAssignTabChange={(tab) => {
                            setAssignTab(tab);
                            setAssignPage(1);
                        }}
                        unassignedStudentsCount={unassignedStudents.length}
                        allStudentsCount={allStudents.length}
                        studentSearch={studentSearch}
                        onStudentSearchChange={(val) => {
                            setStudentSearch(val);
                            setAssignPage(1);
                        }}
                        paginatedAssignStudents={paginatedAssignStudents}
                        assignPage={assignSafePage}
                        assignTotalPages={assignTotalPages}
                        filteredAssignTotal={filteredAssignStudents.length}
                        assignPageSize={assignPageSize}
                        onAssignPageChange={setAssignPage}
                        onAssignStudent={handleAssign}
                    />
                </div>

                {/* Right Column (Tablet sm:col-span-12, Desktop lg:col-span-5): Guardian List */}
                <div className="sm:col-span-12 lg:col-span-5 flex flex-col h-full min-h-0 overflow-hidden">
                    <GuardianList
                        guardians={guardians}
                        selectedGuardianId={guardianId}
                        selectedGuardianName={selectedGuardian?.name}
                        onSelect={(id) => {
                            if (isDesktop) {
                                handleSelectGuardianDesktop(id);
                            } else {
                                handleSelectGuardianTablet(id);
                            }
                        }}
                        guardianSearch={guardianSearch}
                        onSearchChange={setGuardianSearch}
                        guardianPage={guardianPage}
                        onPageChange={setGuardianPage}
                        guardianPageSize={guardianPageSize}
                        showSearch={false}
                    />
                </div>
            </div>

            {/* Tablet Drawer (Only rendered on tablet sm to lg) */}
            {isTablet && (
                <Drawer
                    open={linkedDrawerOpen && Boolean(guardianId)}
                    onClose={handleCloseDrawerTablet}
                    title={
                        panelView === "list" ? (
                            <div className="flex items-center gap-2 min-w-0">
                                <h2 className="text-[15px] sm:text-[16px] font-bold text-primary font-inter truncate">
                                    Anak Terhubung: {selectedGuardian?.name ?? "Wali Murid"}
                                </h2>
                                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold shrink-0">
                                    {linkedStudents.length} Siswa
                                </span>
                            </div>
                        ) : (
                            <h2 className="text-[15px] sm:text-[16px] font-bold text-primary font-inter truncate">
                                Hubungkan Siswa: {selectedGuardian?.name ?? "Wali Murid"}
                            </h2>
                        )
                    }
                    description={
                        panelView === "list" ? (
                            <p className="text-[12px] text-text-secondary mt-0.5 truncate">
                                Kontak: {selectedGuardian?.phone || "-"} · Alamat: {selectedGuardian?.address || "-"}
                            </p>
                        ) : (
                            <p className="text-[12px] text-text-muted mt-0.5 truncate">
                                Pilih siswa yang akan diasosiasikan dengan wali murid ini.
                            </p>
                        )
                    }
                    headerActions={
                        panelView === "list" ? (
                            linkedStudents.length > 0 ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={handleOpenAssignView}
                                        className="sm:hidden w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-xs transition-all active:scale-95 cursor-pointer mr-1"
                                        aria-label="Hubungkan Siswa"
                                        title="Hubungkan Siswa"
                                        data-testid="btn-add-student-drawer-mobile"
                                    >
                                        <FiUserPlus className="text-[14px]" />
                                    </button>
                                    <Button
                                        size="sm"
                                        onClick={handleOpenAssignView}
                                        className="hidden sm:inline-flex shrink-0 whitespace-nowrap h-9 text-[12.5px] px-3.5 font-bold shadow-xs mr-1"
                                        data-testid="btn-add-student-drawer"
                                        icon={<FiUserPlus className="text-[13px]" />}
                                    >
                                        Hubungkan Siswa
                                    </Button>
                                </>
                            ) : null
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={handleBackToList}
                                    className="sm:hidden w-8 h-8 rounded-full border border-border bg-surface text-text-primary flex items-center justify-center shadow-xs transition-all active:scale-95 cursor-pointer mr-1"
                                    aria-label="Kembali ke Daftar"
                                    title="Kembali ke Daftar"
                                    data-testid="btn-back-to-list-drawer-mobile"
                                >
                                    <FiArrowLeft className="w-4 h-4 text-primary" />
                                </button>
                                <button
                                    type="button"
                                    onClick={handleBackToList}
                                    className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-border bg-surface hover:bg-muted/40 text-text-secondary hover:text-text-primary font-bold text-[12.5px] transition-all cursor-pointer shrink-0 active:scale-95 shadow-xs mr-1"
                                    data-testid="btn-back-to-list-drawer"
                                >
                                    <FiArrowLeft className="w-4 h-4 text-primary" />
                                    <span>Kembali ke Daftar</span>
                                </button>
                            </>
                        )
                    }
                    bodyClassName="px-4 pb-4 pt-2.5 sm:px-5 sm:pb-5 sm:pt-2.5 flex flex-col min-h-0 overflow-hidden"
                    width="xl"
                    showFooter={false}
                >
                    <LinkedStudentsPanel
                        selectedGuardian={selectedGuardian}
                        linkedStudents={linkedStudents}
                        linkedPage={linkedPage}
                        onLinkedPageChange={setLinkedPage}
                        linkedPageSize={linkedPageSize}
                        panelView={panelView}
                        stackDirection={stackDirection}
                        onOpenAssign={handleOpenAssignView}
                        onBackToList={handleBackToList}
                        onRemoveStudent={handleRemove}
                        assignTab={assignTab}
                        onAssignTabChange={(tab) => {
                            setAssignTab(tab);
                            setAssignPage(1);
                        }}
                        unassignedStudentsCount={unassignedStudents.length}
                        allStudentsCount={allStudents.length}
                        studentSearch={studentSearch}
                        onStudentSearchChange={(val) => {
                            setStudentSearch(val);
                            setAssignPage(1);
                        }}
                        paginatedAssignStudents={paginatedAssignStudents}
                        assignPage={assignSafePage}
                        assignTotalPages={assignTotalPages}
                        filteredAssignTotal={filteredAssignStudents.length}
                        assignPageSize={assignPageSize}
                        onAssignPageChange={setAssignPage}
                        onAssignStudent={handleAssign}
                        isDrawer={true}
                    />
                </Drawer>
            )}

            {/* ───────────────────────────────────────────────────────────── */}
            {/* MOBILE-NATIVE APP ARCHITECTURE (< sm) */}
            {/* ───────────────────────────────────────────────────────────── */}
            <div className="sm:hidden flex-1 flex flex-col font-inter">
                <AnimatePresence mode="wait">
                    {!guardianId || !selectedGuardian ? (
                        /* MOBILE SCREEN 1: DEDICATED GUARDIAN DIRECTORY HUB */
                        <motion.div
                            key="guardian-directory-hub"
                            initial={{ opacity: 0, x: -16 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -16 }}
                            transition={{ duration: 0.18, ease: "easeOut" }}
                            className="flex-1 flex flex-col gap-3"
                        >
                            {/* Hub Header Card */}
                            <div className="p-4 bg-surface border border-border rounded-2xl shadow-xs space-y-1">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-primary font-bold text-[14px]">
                                        <FiUsers className="text-[16px]" />
                                        <span>Direktori Wali Murid</span>
                                    </div>
                                    <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-primary/10 text-primary border border-primary/20">
                                        {guardians.length} Wali
                                    </span>
                                </div>
                                <p className="text-[12px] text-text-secondary leading-relaxed pt-0.5">
                                    Pilih salah satu wali murid di bawah ini untuk mengelola dan memantau siswa asuh yang terhubung.
                                </p>
                            </div>

                            {/* Search Bar */}
                            <div className="w-full">
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

                            {/* Guardian Touch Cards */}
                            <div className="flex flex-col gap-2.5">
                                {paginatedGuardians.length > 0 ? (
                                    paginatedGuardians.map((g) => (
                                        <div
                                            key={g.id}
                                            onClick={() => handleSelectGuardianMobile(g.id.toString())}
                                            data-testid={`guardian-item-${g.id}`}
                                            className="p-3.5 bg-surface border border-border rounded-2xl shadow-xs flex items-center justify-between gap-3 active:scale-[0.98] active:bg-muted/40 transition-all cursor-pointer select-none hover:border-primary/30"
                                        >
                                            <div className="flex items-center gap-3.5 min-w-0 flex-1">
                                                <Avatar name={g.name} size="md" variant="accent" />
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h3 className="text-[14px] font-bold text-text-primary leading-tight truncate">
                                                            {g.name}
                                                        </h3>
                                                        <span className="px-2 py-0.5 rounded-full text-[10.5px] font-extrabold bg-primary/10 text-primary border border-primary/20 shrink-0">
                                                            {g.students?.length ?? 0} Siswa
                                                        </span>
                                                    </div>
                                                    <p className="text-[12px] text-text-secondary mt-1 truncate">
                                                        {g.phone || "Tidak ada telepon"} · {g.user?.email || "-"}
                                                    </p>
                                                    {g.address && (
                                                        <p className="text-[11px] text-text-muted mt-0.5 truncate">
                                                            {g.address}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <FiChevronRight className="text-text-muted text-[20px] shrink-0" />
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-12 text-center text-text-muted bg-surface border border-border rounded-2xl p-6">
                                        <FiSearch className="text-2xl mx-auto mb-2 opacity-50" />
                                        <p className="text-[13px] font-medium">Tidak ada wali murid yang sesuai pencarian.</p>
                                    </div>
                                )}
                            </div>

                            {/* Pagination */}
                            {filteredGuardians.length > guardianPageSize && (
                                <div className="pt-2 font-inter">
                                    <MobileNativePagination
                                        currentPage={guardianSafePage}
                                        totalPages={guardianTotalPages}
                                        totalItems={filteredGuardians.length}
                                        perPage={guardianPageSize}
                                        onPageChange={setGuardianPage}
                                    />
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        /* MOBILE SCREEN 2: DEDICATED SUBPAGE VIEW */
                        <motion.div
                            key={`guardian-subpage-${selectedGuardian.id}`}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.18, ease: "easeOut" }}
                            className="flex-1 flex flex-col font-inter sm:min-h-0"
                        >
                            <AnimatePresence mode="wait" custom={stackDirection}>
                                {panelView === "list" ? (
                                    /* Mobile Subview: Linked Students List */
                                    <motion.div
                                        key="mobile-view-list"
                                        custom={stackDirection}
                                        variants={stackVariants}
                                        initial="initial"
                                        animate="animate"
                                        exit="exit"
                                        className="flex-1 flex flex-col sm:min-h-0"
                                    >
                                        {/* Guardian Info Card */}
                                        <div className="p-4 bg-surface border border-border rounded-2xl shadow-xs shrink-0 mb-3.5">
                                            <div className="flex items-start gap-3.5">
                                                <Avatar name={selectedGuardian.name} size="md" variant="accent" />
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h2 className="text-[15px] font-bold text-text-primary truncate">
                                                            {selectedGuardian.name}
                                                        </h2>
                                                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10.5px] font-bold shrink-0 border border-primary/20">
                                                            {linkedStudents.length} Siswa
                                                        </span>
                                                    </div>
                                                    <p className="text-[12px] text-text-secondary mt-1 truncate">
                                                        Kontak: {selectedGuardian.phone || "Tidak ada telepon"} · {selectedGuardian.user?.email || "-"}
                                                    </p>
                                                    {selectedGuardian.address && (
                                                        <p className="text-[11.5px] text-text-muted mt-0.5 truncate">
                                                            Alamat: {selectedGuardian.address}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Section Title */}
                                        <div className="flex items-center justify-between mb-2.5 px-0.5 shrink-0">
                                            <span className="text-[13.5px] font-bold text-text-primary">
                                                Siswa Asuh Terhubung ({linkedStudents.length})
                                            </span>
                                        </div>

                                        {/* Connected Student Cards */}
                                        {linkedStudents.length > 0 ? (
                                            <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2">
                                                {paginatedLinked.map((s) => (
                                                    <div
                                                        key={s.id}
                                                        className="p-3.5 bg-surface border border-border rounded-2xl shadow-xs flex items-center justify-between gap-3"
                                                        data-testid={`mobile-student-${s.id}`}
                                                    >
                                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                                            <Avatar name={s.name} size="sm" variant="accent" />
                                                            <div className="min-w-0 flex-1">
                                                                <p className="text-[13.5px] font-bold text-text-primary truncate" title={s.name}>
                                                                    {s.name}
                                                                </p>
                                                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                                    <span className="text-[11.5px] text-text-secondary">
                                                                        NIS: {s.nis} · NISN: {s.nisn}
                                                                    </span>
                                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-surface-raised border border-border text-text-primary">
                                                                        {s.class?.name ?? "Belum Masuk Kelas"}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleRemove(s.id)}
                                                            className="inline-flex items-center justify-center w-8 h-8 rounded-full text-danger hover:text-danger/90 hover:bg-danger-bg active:scale-95 border border-transparent hover:border-danger/20 transition-all cursor-pointer shrink-0"
                                                            type="button"
                                                            title="Lepas hubungan wali"
                                                            aria-label={`Lepas hubungan ${s.name}`}
                                                            data-testid={`btn-remove-student-${s.id}`}
                                                        >
                                                            <FiUserX className="text-[15px]" />
                                                        </button>
                                                    </div>
                                                ))}

                                                {linkedStudents.length > linkedPageSize && (
                                                    <div className="pt-2 shrink-0 font-inter">
                                                        <MobileNativePagination
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
                                            <Card className="p-6 bg-surface border border-border rounded-2xl flex flex-col items-center justify-center text-center shadow-card my-auto">
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
                                    /* Mobile Subview: Assign Student */
                                    <motion.div
                                        key="mobile-view-assign"
                                        custom={stackDirection}
                                        variants={stackVariants}
                                        initial="initial"
                                        animate="animate"
                                        exit="exit"
                                        className="flex-1 flex flex-col pt-1 sm:min-h-0"
                                    >
                                        {/* Tabs Segmented */}
                                        <div className="mb-3 shrink-0">
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
                                        </div>

                                        {/* Student Search */}
                                        <div className="w-full mb-3 shrink-0">
                                            <SearchBar
                                                value={studentSearch}
                                                onChange={(val) => {
                                                    setStudentSearch(val);
                                                    setAssignPage(1);
                                                }}
                                                onSearch={() => setAssignPage(1)}
                                                placeholder="Cari nama, NIS, atau rombel..."
                                            />
                                        </div>

                                        {/* Student list */}
                                        <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2 pr-0.5">
                                            {paginatedAssignStudents.length > 0 ? (
                                                paginatedAssignStudents.map((s) => {
                                                    const isAssigned = Boolean(s.guardian_id);
                                                    const isAssignedToThis = Boolean(selectedGuardian && s.guardian_id === selectedGuardian.id);

                                                    return (
                                                        <div
                                                            key={s.id}
                                                            className="p-3 bg-surface border border-border rounded-xl flex items-center justify-between gap-3 hover:bg-surface-raised transition-colors shadow-xs"
                                                        >
                                                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                                                <Avatar name={s.name} size="sm" variant="accent" />
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="text-[13px] font-bold text-text-primary truncate" title={s.name}>
                                                                        {s.name}
                                                                    </p>
                                                                    <p className="text-[11px] text-text-secondary truncate">
                                                                        NIS: {s.nis} · {s.class?.name ?? "Tanpa Kelas"}
                                                                        {isAssigned && !isAssignedToThis && s.guardian?.name && (
                                                                            <span className="text-text-muted"> · Wali: {s.guardian.name}</span>
                                                                        )}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            {isAssigned ? (
                                                                <span
                                                                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11.5px] font-semibold shrink-0 select-none ${
                                                                        isAssignedToThis
                                                                            ? "bg-primary/10 text-primary border border-primary/20"
                                                                            : "bg-muted text-text-muted border border-border/70"
                                                                    }`}
                                                                >
                                                                    <FiCheck className="text-[12px]" />
                                                                    <span>{isAssignedToThis ? "Sudah Terhubung" : (s.guardian?.name ? `Wali: ${s.guardian.name}` : "Sudah Punya Wali")}</span>
                                                                </span>
                                                            ) : (
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => handleAssign(s.id)}
                                                                    data-testid={`btn-assign-${s.id}`}
                                                                    className="shrink-0 h-8 px-3 text-[12px] font-bold"
                                                                    icon={<FiUserPlus className="text-[12px]" />}
                                                                >
                                                                    Hubungkan
                                                                </Button>
                                                            )}
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div className="py-12 text-center text-text-muted my-auto bg-surface border border-border rounded-2xl p-6">
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

                                        {/* Pagination */}
                                        {filteredAssignStudents.length > assignPageSize && (
                                            <div className="pt-2 shrink-0 font-inter">
                                                <MobileNativePagination
                                                    currentPage={assignSafePage}
                                                    totalPages={assignTotalPages}
                                                    totalItems={filteredAssignStudents.length}
                                                    perPage={assignPageSize}
                                                    onPageChange={setAssignPage}
                                                />
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

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