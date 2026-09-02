import { router } from "@inertiajs/react";
import { useState, useMemo } from "react";
import AppShell from "@/Layouts/AppShell";
import { SearchBar, Button, EmptyState } from "@/Components";
import PreviewImageModal from "@/Components/common/PreviewImageModal";
import { toast } from "@/Components/common/Toast";
import { FiFilter, FiCheckSquare } from "react-icons/fi";
import type { PageProps, LeaveRequest } from "./LeaveVerification/types";
import { daysUntil } from "./LeaveVerification/types";
import LeaveVerificationHeader from "./LeaveVerification/LeaveVerificationHeader";
import LeaveVerificationTabs, { type LeaveTabKey } from "./LeaveVerification/LeaveVerificationTabs";
import LeaveRequestCard from "./LeaveVerification/LeaveRequestCard";
import LeaveDecisionModal from "./LeaveVerification/LeaveDecisionModal";
import LeaveVerificationFilterModal, {
    type DateMode,
    type SortMode,
} from "./LeaveVerification/LeaveVerificationFilterModal";

export default function LeaveVerification({
    teacher: _teacher,
    class: schoolClass,
    leaveRequests = [],
}: PageProps) {
    const [activeTab, setActiveTab] = useState<LeaveTabKey>("pending");
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [dateMode, setDateMode] = useState<DateMode>("all");
    const [sortMode, setSortMode] = useState<SortMode>("urgency");
    const [startDateFilter, setStartDateFilter] = useState("");
    const [endDateFilter, setEndDateFilter] = useState("");
    const [filterModalOpen, setFilterModalOpen] = useState(false);

    // Decision Modal
    const [decisionModal, setDecisionModal] = useState<{
        open: boolean;
        type: "approve" | "reject" | "revert" | null;
        leave: LeaveRequest | null;
    }>({ open: false, type: null, leave: null });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Image Preview Modal
    const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

    // Counts
    const pendingCount = useMemo(
        () => leaveRequests.filter((r) => r.approval_status === "Pending").length,
        [leaveRequests]
    );
    const approvedCount = useMemo(
        () => leaveRequests.filter((r) => r.approval_status === "Approved").length,
        [leaveRequests]
    );
    const rejectedCount = useMemo(
        () => leaveRequests.filter((r) => r.approval_status === "Rejected").length,
        [leaveRequests]
    );
    const totalHistoryCount = approvedCount + rejectedCount;

    // Date range helper for presets
    const { startBound, endBound } = useMemo(() => {
        const now = new Date();
        const toYMD = (d: Date) => d.toISOString().split("T")[0];

        if (dateMode === "today") {
            const todayStr = toYMD(now);
            return { startBound: todayStr, endBound: todayStr };
        }
        if (dateMode === "week") {
            const dayOfWeek = now.getDay();
            const start = new Date(now);
            start.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
            const end = new Date(start);
            end.setDate(start.getDate() + 6);
            return { startBound: toYMD(start), endBound: toYMD(end) };
        }
        if (dateMode === "month") {
            const start = new Date(now.getFullYear(), now.getMonth(), 1);
            const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            return { startBound: toYMD(start), endBound: toYMD(end) };
        }
        if (dateMode === "custom") {
            return { startBound: startDateFilter, endBound: endDateFilter };
        }
        return { startBound: "", endBound: "" };
    }, [dateMode, startDateFilter, endDateFilter]);

    // Filtered and sorted data
    const filteredRequests = useMemo(() => {
        const list = leaveRequests.filter((item) => {
            // Tab condition
            if (activeTab === "pending" && item.approval_status !== "Pending") return false;
            if (activeTab === "approved" && item.approval_status !== "Approved") return false;
            if (activeTab === "rejected" && item.approval_status !== "Rejected") return false;
            if (activeTab === "history" && item.approval_status === "Pending") return false;

            // Search condition
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const matchName = item.student.name.toLowerCase().includes(q);
                const matchNis = item.student.nis.toLowerCase().includes(q);
                const matchDesc = item.description?.toLowerCase().includes(q);
                if (!matchName && !matchNis && !matchDesc) return false;
            }

            // Category condition
            if (categoryFilter !== "all" && item.category !== categoryFilter) return false;

            // Date condition
            if (startBound && item.end_date < startBound) return false;
            if (endBound && item.start_date > endBound) return false;

            return true;
        });

        // Sorting
        return list.sort((a, b) => {
            if (sortMode === "urgency") {
                const daysA = Math.abs(daysUntil(a.start_date));
                const daysB = Math.abs(daysUntil(b.start_date));
                return daysA - daysB;
            }
            if (sortMode === "dateDesc") {
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            }
            if (sortMode === "dateAsc") {
                return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            }
            return 0;
        });
    }, [
        leaveRequests,
        activeTab,
        searchQuery,
        categoryFilter,
        startBound,
        endBound,
        sortMode,
    ]);

    // Action handlers
    const handleApprove = (leave: LeaveRequest) => {
        setDecisionModal({ open: true, type: "approve", leave });
    };

    const handleReject = (leave: LeaveRequest) => {
        setDecisionModal({ open: true, type: "reject", leave });
    };

    const handleRevert = (leave: LeaveRequest) => {
        setDecisionModal({ open: true, type: "revert", leave });
    };

    const executeRevert = (leaveId: number) => {
        router.patch(
            `/leave-requests/${leaveId}/revert`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.warning("Status izin dikembalikan ke Menunggu Verifikasi.");
                },
            }
        );
    };

    const handleConfirmDecision = (
        leaveId: number,
        type: "approve" | "reject" | "revert",
        reason?: string
    ) => {
        setIsSubmitting(true);
        const targetLeave = leaveRequests.find((r) => r.id === leaveId);

        if (type === "approve") {
            router.patch(
                `/leave-requests/${leaveId}/approve`,
                {},
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success(`Izin ${targetLeave?.student.name || "siswa"} disetujui`, {
                            action: {
                                label: "Urungkan",
                                onClick: () => executeRevert(leaveId),
                            },
                        });
                    },
                    onFinish: () => {
                        setIsSubmitting(false);
                        setDecisionModal({ open: false, type: null, leave: null });
                    },
                }
            );
        } else if (type === "reject") {
            router.patch(
                `/leave-requests/${leaveId}/reject`,
                { rejection_reason: reason },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.error(`Izin ${targetLeave?.student.name || "siswa"} ditolak`, {
                            action: {
                                label: "Urungkan",
                                onClick: () => executeRevert(leaveId),
                            },
                        });
                    },
                    onFinish: () => {
                        setIsSubmitting(false);
                        setDecisionModal({ open: false, type: null, leave: null });
                    },
                }
            );
        } else if (type === "revert") {
            router.patch(
                `/leave-requests/${leaveId}/revert`,
                {},
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.warning("Status izin berhasil dikembalikan.");
                    },
                    onFinish: () => {
                        setIsSubmitting(false);
                        setDecisionModal({ open: false, type: null, leave: null });
                    },
                }
            );
        }
    };

    const hasActiveFilters =
        categoryFilter !== "all" ||
        dateMode !== "all" ||
        sortMode !== "urgency" ||
        Boolean(startDateFilter) ||
        Boolean(endDateFilter);

    return (
        <AppShell title="Verifikasi Izin Siswa">
            <div className="space-y-6">
                {/* Header */}
                <LeaveVerificationHeader
                    classNameStr={schoolClass?.name || "Kelas Binaan"}
                    pendingCount={pendingCount}
                    approvedCount={approvedCount}
                    rejectedCount={rejectedCount}
                />

                {/* Tabs */}
                <LeaveVerificationTabs
                    activeTab={activeTab}
                    pendingCount={pendingCount}
                    approvedCount={approvedCount}
                    rejectedCount={rejectedCount}
                    totalHistoryCount={totalHistoryCount}
                    onChange={setActiveTab}
                />

                {/* Filter Toolbar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="max-w-md w-full">
                        <SearchBar
                            value={searchQuery}
                            onChange={setSearchQuery}
                            onSearch={setSearchQuery}
                            placeholder="Cari nama siswa, NIS, atau keterangan..."
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant={hasActiveFilters ? "primary" : "secondary"}
                            onClick={() => setFilterModalOpen(true)}
                            icon={<FiFilter size={16} />}
                        >
                            Filter & Urutkan {hasActiveFilters && "(Aktif)"}
                        </Button>
                    </div>
                </div>

                {/* Card List */}
                {filteredRequests.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredRequests.map((leave) => (
                            <LeaveRequestCard
                                key={leave.id}
                                leave={leave}
                                isPending={leave.approval_status === "Pending"}
                                onPreviewImage={(url) => setPreviewImageUrl(url)}
                                onApprove={handleApprove}
                                onReject={handleReject}
                                onRevert={handleRevert}
                            />
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon={<FiCheckSquare size={40} className="text-text-muted" />}
                        title={
                            activeTab === "pending"
                                ? "Tidak ada permohonan izin pending"
                                : "Tidak ada riwayat permohonan izin"
                        }
                        description={
                            activeTab === "pending"
                                ? "Semua permohonan izin dari siswa binaan Anda telah selesai diverifikasi."
                                : "Belum ada riwayat permohonan izin yang sesuai dengan filter pencarian."
                        }
                    />
                )}
            </div>

            {/* Decision Confirmation Modal */}
            <LeaveDecisionModal
                open={decisionModal.open}
                type={decisionModal.type}
                leave={decisionModal.leave}
                isSubmitting={isSubmitting}
                onClose={() => setDecisionModal({ open: false, type: null, leave: null })}
                onConfirm={handleConfirmDecision}
            />

            {/* Filter Modal */}
            <LeaveVerificationFilterModal
                open={filterModalOpen}
                category={categoryFilter}
                dateMode={dateMode}
                sortMode={sortMode}
                startDate={startDateFilter}
                endDate={endDateFilter}
                onCategoryChange={setCategoryFilter}
                onDateModeChange={setDateMode}
                onSortModeChange={setSortMode}
                onStartDateChange={setStartDateFilter}
                onEndDateChange={setEndDateFilter}
                onReset={() => {
                    setCategoryFilter("all");
                    setDateMode("all");
                    setSortMode("urgency");
                    setStartDateFilter("");
                    setEndDateFilter("");
                }}
                onClose={() => setFilterModalOpen(false)}
            />

            {/* Preview Image Modal */}
            <PreviewImageModal
                url={previewImageUrl}
                onClose={() => setPreviewImageUrl(null)}
            />
        </AppShell>
    );
}
