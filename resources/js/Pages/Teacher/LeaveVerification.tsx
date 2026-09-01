import { useState, useCallback, useMemo, useRef, useEffect, useLayoutEffect } from "react";
import { router, usePage } from "@inertiajs/react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FiChevronDown, FiX, FiCheck, FiSearch, FiCalendar,
    FiFileText, FiImage, FiMaximize2, FiUser, FiArrowDown, FiClipboard,
    FiSmile, FiClock, FiLoader,
    FiAlertTriangle, FiXCircle,
} from "react-icons/fi";
import AppShell from "@/Layouts/AppShell";
import { Button } from "@/Components";
import Modal from "@/Components/common/Modal";
import BottomSheet from "@/Components/common/BottomSheet";
import FilterPopover from "@/Components/common/FilterPopover";
import FilterDropdown from "@/Components/common/FilterDropdown";
import PreviewImageModal from "@/Components/common/PreviewImageModal";
import { useLanguage } from "@/Contexts/LanguageContext";
import { toast } from "@/Components/common/Toast";

// ─── Types ───

interface Student {
    id: number;
    name: string;
    nis: string;
    nisn: string;
}

interface Guardian {
    id: number;
    name: string;
}

interface LeaveRequest {
    id: number;
    student: Student;
    guardian: Guardian | null;
    category: "Sick" | "Event" | "Competition" | "Other";
    start_date: string;
    end_date: string;
    description: string | null;
    document_url: string | null;
    approval_status: "Pending" | "Approved" | "Rejected";
    rejection_reason?: string | null;
    created_at: string;
    updated_at?: string;
}

interface PageProps {
    teacher: { id: number; name: string };
    class: { id: number; name: string } | null;
    leaveRequests: LeaveRequest[];
}

// ─── Helpers ───

const categoryConfig: Record<
    string,
    { label: string; textColor: string; badgeBgColor: string; borderColor: string }
> = {
    Sick: {
        label: "Sakit",
        textColor: "text-text-medical",
        badgeBgColor: "bg-medical-bg",
        borderColor: "border-l-medical",
    },
    Event: {
        label: "Izin Acara",
        textColor: "text-text-permit",
        badgeBgColor: "bg-permit-bg",
        borderColor: "border-l-permit",
    },
    Competition: {
        label: "Lomba",
        textColor: "text-text-achievement",
        badgeBgColor: "bg-achievement-bg",
        borderColor: "border-l-achievement",
    },
    Other: {
        label: "Lainnya",
        textColor: "text-text-info",
        badgeBgColor: "bg-info-bg",
        borderColor: "border-l-info",
    },
};

const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
};

const formatRelativeTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return "Baru saja";
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    if (diffDays === 1) return "Kemarin";
    return formatDate(dateStr);
};

const calculateDuration = (start: string, end: string): number => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMs = endDate.getTime() - startDate.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
};

const getDocumentTypeLabel = (url: string | null): string => {
    if (!url) return "Dokumen";
    if (url.includes("doctor") || url.includes("surat")) return "Surat Dokter";
    if (url.includes("invitation") || url.includes("undangan"))
        return "Undangan";
    return "Dokumen";
};

const daysUntil = (dateStr: string): number => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    return Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
};

const getUrgencyInfo = (startDate: string, t: (key: string) => string) => {
    const days = daysUntil(startDate);
    if (days < -1) {
        const n = Math.abs(days);
        const label = `${t("leave-verification.urgencyOverduePrefix")} ${n} ${t("leave-verification.urgencyOverdueSuffix")}`;
        return { label, isOverdue: true };
    }
    if (days === -1) return { label: t("leave-verification.urgencyYesterday"), isOverdue: true };
    if (days === 0) return { label: t("leave-verification.urgencyToday") || "Hari ini", isOverdue: false };
    if (days === 1) return { label: t("leave-verification.urgencyTomorrow") || "Besok", isOverdue: false };
    return null;
};

// ─── Component ───

export default function LeaveVerification({
    class: kelas,
    leaveRequests: serverLeaveRequests,
}: PageProps) {
    const { t } = useLanguage();
    const resolvedClass = kelas;
    const [activeTab, setActiveTab] = useState<
        "pending" | "history" | "approved" | "rejected"
    >("pending");
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [historyFilter, setHistoryFilter] = useState<"all" | "Approved" | "Rejected">("all");
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [leaveDataLocal, setLeaveDataLocal] = useState<LeaveRequest[]>(
        serverLeaveRequests,
    );
    const [isAnimating, setIsAnimating] = useState(false);

    const leaveData = isAnimating
        ? leaveDataLocal
        : serverLeaveRequests;
    const [rejectionReason, setRejectionReason] = useState("");
    const [rejectionNote, setRejectionNote] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [dateMode, setDateMode] = useState<"today" | "week" | "month" | "custom">("week");
    const [customStartDate, setCustomStartDate] = useState("");
    const [customEndDate, setCustomEndDate] = useState("");
    const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
    const [filterSheetOpen, setFilterSheetOpen] = useState(false);
    const [datePopoverOpen, setDatePopoverOpen] = useState(false);
    const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
    const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [tempDateMode, setTempDateMode] = useState(dateMode);
    const [tempCustomStart, setTempCustomStart] = useState("");
    const [tempCustomEnd, setTempCustomEnd] = useState("");
    const [highlightedId, setHighlightedId] = useState<number | null>(null);
    const [sortMode, setSortMode] = useState<"urgency" | "dateDesc" | "dateAsc" | "lastProcessed">("dateDesc");
    const [displayedCount, setDisplayedCount] = useState(10);
    const [loadingMore, setLoadingMore] = useState(false);
    const observerRef = useRef<HTMLDivElement | null>(null);
    const mobileCardRefs = useRef<Map<number, HTMLDivElement>>(new Map());
    const desktopCardRefs = useRef<Map<number, HTMLDivElement>>(new Map());
    const removeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const mobileTabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
    const desktopTabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
    const [mobileIndicator, setMobileIndicator] = useState({ left: 0, width: 0 });
    const [desktopIndicator, setDesktopIndicator] = useState({ left: 0, width: 0 });

    const { url } = usePage();
    const urlObj = new URL(url, window.location.origin);
    const highlightNis = urlObj.searchParams.get("highlight");
    const highlightSubmitted = urlObj.searchParams.get("submitted");

    const highlightColors: Record<string, string> = {
        Sick: "var(--color-medical-alpha)",
        Event: "var(--color-permit-alpha)",
        Competition: "var(--color-achievement-alpha)",
        Other: "var(--color-info-alpha)",
    };

    const sortOptions = [
        { value: "dateDesc", label: "Terbaru → Terlama" },
        { value: "dateAsc", label: "Terlama → Terbaru" },
        { value: "lastProcessed", label: "Terakhir Diproses" },
    ];

    const categoryFilterOptions = [
        { value: "all", label: "Semua" },
        { value: "Sick", label: "Sakit" },
        { value: "Event", label: "Izin Acara" },
        { value: "Competition", label: "Lomba" },
        { value: "Other", label: "Lainnya" },
    ];

    const getDateModeLabel = useCallback((): string => {
        switch (dateMode) {
            case "week": return t("leave-verification.quickWeek") || "Minggu Ini";
            case "month": return t("leave-verification.quickMonth") || "Bulan Ini";
            case "custom": {
                if (customStartDate && customEndDate) {
                    const s = new Date(customStartDate);
                    const e = new Date(customEndDate);
                    const sameMonth = s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear();
                    const sameYear = s.getFullYear() === e.getFullYear();
                    const fmtShort = (d: Date) => d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
                    const fmtMonth = (d: Date) => d.toLocaleDateString("id-ID", { month: "long" });
                    if (sameMonth) return `${s.getDate()}-${e.getDate()} ${fmtMonth(s)}`;
                    if (sameYear) return `${fmtShort(s)} - ${fmtShort(e)}`;
                    return `${fmtShort(s)} ${s.getFullYear()} - ${fmtShort(e)} ${e.getFullYear()}`;
                }
                return t("leave-verification.quickCustom") || "Kustom";
            }
            default: return t("leave-verification.quickWeek") || "Minggu Ini";
        }
    }, [dateMode, customStartDate, customEndDate, t]);

    const toggleCard = useCallback((id: number) => {
        setExpandedId((prev) => (prev === id ? null : id));
    }, []);

    // Modal state
    const [confirmModal, setConfirmModal] = useState<{
        open: boolean;
        type: "approve" | "reject" | null;
        leaveRequest: LeaveRequest | null;
    }>({ open: false, type: null, leaveRequest: null });

    const getDateRange = useCallback(() => {
        const now = new Date();
        const today = now.toISOString().split("T")[0];
        switch (dateMode) {
            case "today":
                return { start: today, end: today };
            case "week": {
                const day = now.getDay();
                const monday = new Date(now);
                monday.setDate(now.getDate() - ((day + 6) % 7));
                const sunday = new Date(monday);
                sunday.setDate(monday.getDate() + 6);
                return { start: monday.toISOString().split("T")[0], end: sunday.toISOString().split("T")[0] };
            }
            case "month": {
                const first = new Date(now.getFullYear(), now.getMonth(), 1);
                const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                return { start: first.toISOString().split("T")[0], end: last.toISOString().split("T")[0] };
            }
            case "custom":
                if (!customStartDate || !customEndDate) return null;
                return { start: customStartDate, end: customEndDate };
            default:
                return null;
        }
    }, [dateMode, customStartDate, customEndDate]);

    const dateRange = getDateRange();

    const dateMatches = (lr: LeaveRequest, checkProcessedDate = false) => {
        if (!dateRange) return true;
        if (checkProcessedDate && lr.approval_status !== "Pending" && lr.updated_at) {
            const processedDate = lr.updated_at.split("T")[0];
            return processedDate >= dateRange.start && processedDate <= dateRange.end;
        }
        return lr.start_date <= dateRange.end && lr.end_date >= dateRange.start;
    };

    const categoryMatches = (lr: LeaveRequest) => {
        if (selectedCategories.size === 0) return true;
        return selectedCategories.has(lr.category);
    };

    const pendingRequests = leaveData.filter(
        (lr) => lr.approval_status === "Pending",
    );
    const approvedRequests = leaveData.filter(
        (lr) => lr.approval_status === "Approved" && dateMatches(lr, sortMode === "lastProcessed") && categoryMatches(lr),
    );
    const rejectedRequests = leaveData.filter(
        (lr) => lr.approval_status === "Rejected" && dateMatches(lr, sortMode === "lastProcessed") && categoryMatches(lr),
    );
    const historyRequests = leaveData.filter(
        (lr) => lr.approval_status !== "Pending" && dateMatches(lr, sortMode === "lastProcessed") && categoryMatches(lr),
    );

    const baseRequests = (() => {
        switch (activeTab) {
            case "pending":
                return pendingRequests;
            case "approved":
                return approvedRequests;
            case "rejected":
                return rejectedRequests;
            case "history":
                switch (historyFilter) {
                    case "Approved":
                        return approvedRequests;
                    case "Rejected":
                        return rejectedRequests;
                    default:
                        return historyRequests;
                }
        }
    })();

    const query = searchQuery.trim().toLowerCase();
    const currentRequests = query
        ? baseRequests.filter(
              (lr) =>
                  lr.student.name.toLowerCase().includes(query) ||
                  lr.student.nisn.includes(query),
          )
        : baseRequests;

    const sortedRequests = useMemo(() => {
        if (activeTab === "pending") {
            return [...currentRequests].sort((a, b) => {
                const urgencyA = daysUntil(a.start_date);
                const urgencyB = daysUntil(b.start_date);
                return urgencyA - urgencyB;
            });
        }
        switch (sortMode) {
            case "dateDesc":
                return [...currentRequests].sort(
                    (a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime(),
                );
            case "dateAsc":
                return [...currentRequests].sort(
                    (a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime(),
                );
            case "lastProcessed":
                return [...currentRequests].sort(
                    (a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime(),
                );
            default:
                return currentRequests;
        }
    }, [activeTab, sortMode, currentRequests]);

    const totalFilteredCount = sortedRequests.length;
    const visibleItems = sortedRequests.slice(0, displayedCount);

    const endOfListText = (() => {
        const count = sortedRequests.length;
        if (count === 0) return null;
        switch (activeTab) {
            case "pending":
                return `${t("leave-verification.endOfListPending")} (${count})`;
            case "approved":
                return `${t("leave-verification.endOfListApproved")} (${count})`;
            case "rejected":
                return `${t("leave-verification.endOfListRejected")} (${count})`;
            case "history":
                if (historyFilter === "Approved")
                    return `${t("leave-verification.endOfListApproved")} (${count})`;
                if (historyFilter === "Rejected")
                    return `${t("leave-verification.endOfListRejected")} (${count})`;
                return `${t("leave-verification.endOfListHistory")} (${count})`;
            default:
                return null;
        }
    })();

    const getNextPendingId = useCallback((currentlr: LeaveRequest): number | null => {
        const currentIndex = sortedRequests.findIndex((lr) => lr.id === currentlr.id);
        if (currentIndex === -1) return null;
        const nextItem = sortedRequests[currentIndex + 1];
        return nextItem ? nextItem.id : null;
    }, [sortedRequests]);

    const desktopTabs = [
        {
            key: "pending" as const,
            label: t("leave-verification.tabPending"),
            count: pendingRequests.length,
        },
        {
            key: "approved" as const,
            label: t("leave-verification.tabApproved"),
            count: approvedRequests.length,
        },
        {
            key: "rejected" as const,
            label: t("leave-verification.tabRejected"),
            count: rejectedRequests.length,
        },
    ];

    const mobileTabs = [
        {
            key: "pending" as const,
            label: t("leave-verification.tabPending"),
            count: pendingRequests.length,
        },
        {
            key: "history" as const,
            label: t("leave-verification.tabHistory"),
            count: historyRequests.length,
        },
    ];

    useLayoutEffect(() => {
        const btn = mobileTabRefs.current.get(activeTab === "approved" || activeTab === "rejected" ? "history" : activeTab);
        if (btn) {
            setMobileIndicator({ left: btn.offsetLeft, width: btn.offsetWidth });
        }
    }, [activeTab]);

    useLayoutEffect(() => {
        const btn = desktopTabRefs.current.get(activeTab === "history" ? "approved" : activeTab);
        if (!btn) return;

        const updateIndicator = () => {
            setDesktopIndicator({ left: btn.offsetLeft, width: btn.offsetWidth });
        };
        updateIndicator();

        const observer = new ResizeObserver(updateIndicator);
        observer.observe(btn);
        return () => observer.disconnect();
    }, [activeTab]);

    useEffect(() => {
        if (!highlightNis || !highlightSubmitted || leaveData.length === 0) return;

        const match = leaveData.find(
            (lr) =>
                lr.student.nis === highlightNis &&
                lr.created_at === highlightSubmitted,
        );
        if (!match) return;

        const timer = setTimeout(() => {
            const isMobile = window.innerWidth < 1024;
            const elMap = isMobile ? mobileCardRefs.current : desktopCardRefs.current;
            const el = elMap.get(match.id);
            if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "center" });
                setHighlightedId(match.id);
                setExpandedId(match.id);
                removeTimerRef.current = setTimeout(
                    () => {
                        setHighlightedId(null);
                        router.get(
                            window.location.pathname,
                            {},
                            {
                                preserveState: true,
                                preserveScroll: true,
                                replace: true,
                            }
                        );
                    },
                    5000,
                );
            }
        }, 300);

        return () => {
            clearTimeout(timer);
            if (removeTimerRef.current) {
                clearTimeout(removeTimerRef.current);
                removeTimerRef.current = null;
            }
        };
    }, [highlightNis, highlightSubmitted, leaveData]);

    useEffect(() => {
        if (activeTab !== "history" || displayedCount >= totalFilteredCount) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !loadingMore) {
                    setLoadingMore(true);
                    setTimeout(() => {
                        setDisplayedCount((prev) => Math.min(prev + 10, totalFilteredCount));
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
    }, [activeTab, displayedCount, totalFilteredCount, loadingMore]);


    const openConfirmModal = useCallback(
        (type: "approve" | "reject", lr: LeaveRequest) => {
            setConfirmModal({ open: true, type, leaveRequest: lr });
            setRejectionReason("");
            setRejectionNote("");
        },
        [],
    );

    const closeConfirmModal = useCallback(() => {
        setConfirmModal({ open: false, type: null, leaveRequest: null });
        setRejectionReason("");
        setRejectionNote("");
    }, []);

    const isLainnya = rejectionReason === t("modal.rejectReason6");
    const isRejectDisabled = confirmModal.type === "reject" && (
        !rejectionReason || (isLainnya && !rejectionNote.trim())
    );

    const handleDirectApprove = useCallback((lr: LeaveRequest) => {
        const nextId = getNextPendingId(lr);

        setIsAnimating(true);
        setLeaveDataLocal((prev) =>
            prev.map((item) =>
                item.id === lr.id ? { ...item, approval_status: "Approved" } : item,
            ),
        );
        if (nextId) {
            setExpandedId(nextId);
        }

        router.patch(`/leave-requests/${lr.id}/approve`, {}, {
            preserveState: true,
            preserveScroll: true,
            only: [],
            onSuccess: () => {
                toast.success(t("toast.leaveApproved"), {
                    action: {
                        label: t("toast.undo"),
                        onClick: () => {
                            setIsAnimating(true);
                            setLeaveDataLocal((prev) =>
                                prev.map((item) =>
                                    item.id === lr.id ? { ...item, approval_status: "Pending" } : item,
                                ),
                            );
                            setExpandedId(lr.id);
                            router.patch(`/leave-requests/${lr.id}/revert`, {}, {
                                preserveState: true,
                                preserveScroll: true,
                                only: [],
                                onSuccess: () => {
                                    toast.warning(t("toast.actionUndone"));
                                    setTimeout(() => {
                                        setIsAnimating(false);
                                        router.reload({ only: ["leaveRequests"] });
                                    }, 300);
                                },
                                onError: () => {
                                    setLeaveDataLocal((prev) =>
                                        prev.map((item) =>
                                            item.id === lr.id ? { ...item, approval_status: "Approved" } : item,
                                        ),
                                    );
                                    setExpandedId(null);
                                    setIsAnimating(false);
                                    toast.error(t("toast.error") || "Gagal membatalkan aksi.");
                                },
                            });
                        },
                    },
                });
                setTimeout(() => {
                    setIsAnimating(false);
                    router.reload({ only: ["leaveRequests"] });
                }, 300);
            },
            onError: () => {
                setLeaveDataLocal((prev) =>
                    prev.map((item) =>
                        item.id === lr.id ? { ...item, approval_status: "Pending" } : item,
                    ),
                );
                setExpandedId(null);
                setIsAnimating(false);
                toast.error(t("toast.error") || "Gagal menyetujui izin.");
            },
        });
    }, [t, getNextPendingId]);

    const handleConfirmAction = useCallback(() => {
        const { leaveRequest } = confirmModal;
        if (!leaveRequest) return;

        const nextId = getNextPendingId(leaveRequest);

        setIsSubmitting(true);
        setIsAnimating(true);
        setLeaveDataLocal((prev) =>
            prev.map((item) =>
                item.id === leaveRequest.id ? { ...item, approval_status: "Rejected" } : item,
            ),
        );
        if (nextId) {
            setExpandedId(nextId);
        }

        router.patch(`/leave-requests/${leaveRequest.id}/reject`, {
            rejection_reason: rejectionReason + (rejectionNote ? `\n${rejectionNote}` : ""),
        }, {
            preserveState: true,
            preserveScroll: true,
            only: [],
            onSuccess: () => {
                setIsSubmitting(false);
                closeConfirmModal();
                toast.error(t("toast.leaveRejected"), {
                    action: {
                        label: t("toast.undo"),
                        onClick: () => {
                            setIsAnimating(true);
                            setLeaveDataLocal((prev) =>
                                prev.map((item) =>
                                    item.id === leaveRequest.id ? { ...item, approval_status: "Pending", rejection_reason: null } : item,
                                ),
                            );
                            setExpandedId(leaveRequest.id);
                            router.patch(`/leave-requests/${leaveRequest.id}/revert`, {}, {
                                preserveState: true,
                                preserveScroll: true,
                                only: [],
                                onSuccess: () => {
                                    toast.warning(t("toast.actionUndone"));
                                    setTimeout(() => {
                                        setIsAnimating(false);
                                        router.reload({ only: ["leaveRequests"] });
                                    }, 300);
                                },
                                onError: () => {
                                    setLeaveDataLocal((prev) =>
                                        prev.map((item) =>
                item.id === leaveRequest.id ? { ...item, approval_status: "Rejected", rejection_reason: rejectionReason } : item,
                                        ),
                                    );
                                    setExpandedId(null);
                                    setIsAnimating(false);
                                    toast.error(t("toast.error") || "Gagal membatalkan aksi.");
                                },
                            });
                        },
                    },
                });
                setTimeout(() => {
                    setIsAnimating(false);
                    router.reload({ only: ["leaveRequests"] });
                }, 300);
            },
            onError: () => {
                setIsSubmitting(false);
                setLeaveDataLocal((prev) =>
                    prev.map((item) =>
                        item.id === leaveRequest.id ? { ...item, approval_status: "Pending", rejection_reason: null } : item,
                    ),
                );
                setExpandedId(null);
                setIsAnimating(false);
                closeConfirmModal();
                toast.error(t("toast.error") || "Gagal menolak izin.");
            },
        });
    }, [confirmModal, closeConfirmModal, t, getNextPendingId, rejectionReason, rejectionNote]);

    const renderCard = (lr: LeaveRequest, isMobile: boolean, showUrgency: boolean = false) => {
        const cat = categoryConfig[lr.category] ?? {
            label: lr.category,
            textColor: "text-info",
            badgeBgColor: "bg-info/10",
            borderColor: "border-l-info",
        };
        const duration = calculateDuration(lr.start_date, lr.end_date);
        const dateRange =
            lr.start_date === lr.end_date
                ? formatDate(lr.start_date)
                : `${formatDate(lr.start_date)} - ${formatDate(lr.end_date)}`;
        const urgency = showUrgency ? getUrgencyInfo(lr.start_date, t) : null;

        if (isMobile) {
            const isExpanded = expandedId === lr.id;

            return (
                <motion.div
                    key={lr.id}
                    layout
                    initial={{ opacity: 1, y: 0 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    ref={(el) => { if (el) mobileCardRefs.current.set(lr.id, el); }}
                    onClick={() => toggleCard(lr.id)}
                    style={highlightedId === lr.id ? { "--pulse-color": highlightColors[lr.category] || "rgba(46,51,145,0.4)" } as React.CSSProperties : undefined}
                    className={`bg-surface border border-border border-l-4 ${cat.borderColor} rounded-xl p-4 transition-all duration-300 cursor-pointer ${
                        isExpanded ? "shadow-card" : ""
                    } ${highlightedId === lr.id ? "animate-highlight-pulse" : ""}`}
                >
                    {/* Header: Name + Category Badge + Chevron */}
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="text-base font-bold text-text-primary">
                            {lr.student.name}
                        </h3>
                        <div className="flex items-center gap-2 shrink-0">
                            <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${cat.badgeBgColor} ${cat.textColor}`}
                            >
                                {cat.label}
                            </span>
                            <FiChevronDown className={`text-xs text-text-muted transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>
                    </div>

                    {/* Date + Duration */}
                    <p className={`text-xs mb-2 ${
                        urgency?.isOverdue ? 'text-danger' :
                        urgency ? (daysUntil(lr.start_date) === 0 ? 'text-danger' : 'text-warning') :
                        'text-text-muted'
                    }`}>
                                {urgency && (
                                    <>
                                        {urgency.isOverdue ? (
                                            <span className="mr-1.5 text-[12px] leading-none">🚨</span>
                                        ) : (
                                            <span className={`inline-block w-1.5 h-1.5 rounded-full align-middle mr-1.5 ${
                                                daysUntil(lr.start_date) === 0 ? "bg-danger" : "bg-warning"
                                            }`} />
                                        )}
                                        <span className={`font-semibold ${urgency.isOverdue ? "text-danger" : ""}`}>{urgency.label}</span>
                                    </>
                                )}
                        {urgency ? ", " : ""}{dateRange} ({duration}{" "}
                        {duration > 1
                            ? t("leave-verification.days")
                            : t("leave-verification.day")})
                    </p>

                    {/* Description — always visible, expands independently */}
                    {lr.description && (
                        <div
                            className="bg-background rounded-lg transition-[max-height,opacity] duration-300 ease-in-out overflow-hidden"
                            style={{
                                maxHeight: isExpanded ? '200px' : '32px',
                                opacity: isExpanded ? 1 : 0.8
                            }}
                        >
                            <p className={`text-sm text-text-primary italic py-1.5 px-3 ${
                                !isExpanded ? 'line-clamp-1' : ''
                            }`}>
                                &quot;{lr.description}&quot;
                            </p>
                        </div>
                    )}

                    {/* Rejection Reason */}
                    {lr.approval_status === "Rejected" && lr.rejection_reason && (
                        <div className="bg-red-50 border-l-4 border-danger rounded-r-lg p-3 mt-2">
                                <p className="text-xs font-bold text-danger mb-1">
                                    <FiXCircle className="inline align-text-bottom text-danger mr-1 -translate-y-[1px]" /> Alasan Penolakan:
                                </p>
                                <p className="text-sm text-text-primary">{lr.rejection_reason}</p>
                            </div>
                        )}

                        {/* Expandable Details — CSS Grid + opacity */}
                    <div
                        className="grid transition-[grid-template-rows,opacity] duration-300 ease-in-out"
                        style={{
                            gridTemplateRows: isExpanded ? '1fr' : '0fr',
                            opacity: isExpanded ? 1 : 0
                        }}
                    >
                        <div className="overflow-hidden">
                            <div className="pt-3" onClick={(e) => e.stopPropagation()}>
                                {/* Submission Info */}
                                <p className="text-[11px] text-text-muted mb-3 cursor-pointer hover:text-text-primary transition-colors"
                                   onClick={(e) => { e.stopPropagation(); toggleCard(lr.id); }}
                                >
                                    <FiUser className="mr-1 inline-block align-middle" />
                                    Diajukan: {formatDate(lr.created_at)} ({lr.guardian?.name ?? "-"})
                                </p>
                                {lr.approval_status !== "Pending" && lr.updated_at && (
                                    <p className="text-[11px] text-text-muted mb-3">
                                        <FiClock className="mr-1 inline-block align-middle" />
                                        Diverifikasi: {formatDate(lr.updated_at)}
                                    </p>
                                )}

                                {/* Document Proof */}
                                {lr.document_url ? (
                                    <button
                                        type="button"
                                        onClick={() => setPreviewImage(lr.document_url)}
                                        className="w-full mb-3 py-2.5 px-4 border border-primary rounded-lg text-sm font-medium text-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <FiImage />
                                        {t("leave-verification.viewProof")} (
                                        {getDocumentTypeLabel(lr.document_url)})
                                    </button>
                                ) : (
                                    <div className="w-full mb-3 py-2.5 px-4 border border-border rounded-lg bg-background flex items-center justify-center gap-2">
                                        <FiFileText className="text-text-inactive" />
                                        <span className="text-sm text-text-inactive">
                                            {t("leave-verification.noDocument")}
                                        </span>
                                    </div>
                                )}

                                {/* Action Buttons — only when expanded */}
                                {lr.approval_status === "Pending" && (
                                    <div className="flex gap-2">
                                        <Button
                                            variant="danger-outline"
                                            className="flex-1"
                                            onClick={() => openConfirmModal("reject", lr)}
                                        >
                                            <FiX className="mr-1" />
                                            {t("leave-verification.reject")}
                                        </Button>
                                        <Button
                                            variant="success"
                                            className="flex-1"
                                            onClick={() => handleDirectApprove(lr)}
                                        >
                                            <FiCheck className="mr-1" />
                                            {t("leave-verification.approve")}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            );
        }

        return (
            <motion.div
                key={lr.id}
                layout
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                ref={(el) => { if (el) desktopCardRefs.current.set(lr.id, el); }}
                style={highlightedId === lr.id ? { "--pulse-color": highlightColors[lr.category] || "rgba(46,51,145,0.4)" } as React.CSSProperties : undefined}
                className={`bg-surface border border-border border-l-4 ${cat.borderColor} rounded-xl p-4 lg:p-5 ${highlightedId === lr.id ? "animate-highlight-pulse" : ""}`}
            >
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Document Thumbnail with Overlay */}
                    <div className="sm:w-32 shrink-0">
                        {lr.document_url ? (
                            <div
                                className="relative group cursor-pointer"
                                onClick={() => setPreviewImage(lr.document_url)}
                            >
                                <div className="w-full h-32 sm:h-36 bg-background rounded-lg border border-border flex items-center justify-center overflow-hidden">
                                    <FiImage className="text-2xl text-text-inactive" />
                                </div>
                                <div className="absolute inset-x-0 bottom-0 bg-black/60 rounded-b-lg py-1.5 flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity">
                                    <FiMaximize2 className="text-white text-xs mr-1.5" />
                                    <span className="text-white text-xs font-medium">
                                        {t("leave-verification.enlarge")}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full h-32 sm:h-36 bg-background rounded-lg border border-border flex flex-col items-center justify-center gap-1.5">
                                <FiFileText className="text-xl text-text-inactive" />
                                <span className="text-[10px] text-text-inactive text-center px-2">
                                    {t("leave-verification.noDocument")}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Content — increased gap from photo */}
                    <div className="flex-1 min-w-0 pl-0 sm:pl-2">
                        {/* Student Name + Category Badge */}
                        <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="text-base font-bold text-text-primary">
                                {lr.student.name}
                            </h3>
                            <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${cat.badgeBgColor} ${cat.textColor}`}
                            >
                                {cat.label}
                            </span>
                        </div>

                        {/* Submitter Info */}
                        <p className="text-xs text-text-muted mb-2">
                            <FiUser className="mr-1 inline align-middle" />
                            {t("leave-verification.submittedBy")}{" "}
                            <span className="font-medium text-text-secondary">
                                {lr.guardian?.name ?? "-"} ({t("leave-verification.guardian")})
                            </span>
                            {" - "}{formatRelativeTime(lr.created_at)}
                        </p>
                        {lr.approval_status !== "Pending" && lr.updated_at && (
                            <p className="text-xs text-text-muted mb-2">
                                <FiClock className="mr-1 inline align-middle" />
                                {t("leave-verification.verifiedAt")}{" "}
                                {formatRelativeTime(lr.updated_at)}
                            </p>
                        )}

                        {/* Grey Area: Date + Description */}
                        <div className="bg-background rounded-lg p-3 mt-2">
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-2 text-sm">
                                <span>
                                    <span className="text-text-muted">
                                        {t("leave-verification.dateLabel")}:
                                    </span>{" "}
                                    <span className={`font-medium ${
                                        urgency?.isOverdue ? 'text-danger' :
                                        urgency ? (daysUntil(lr.start_date) === 0 ? 'text-danger' : 'text-warning') :
                                        'text-text-primary'
                                    }`}>
                                        {urgency && (
                                            <>
                                                {urgency.isOverdue ? (
                                                    <span className="mr-1.5 leading-none">🚨</span>
                                                ) : (
                                                    <span className={`inline-block w-1.5 h-1.5 rounded-full align-middle mr-1.5 ${
                                                        daysUntil(lr.start_date) === 0 ? "bg-danger" : "bg-warning"
                                                    }`} />
                                                )}
                                                <span className={`font-semibold ${urgency.isOverdue ? "text-danger" : ""}`}>{urgency.label}</span>
                                            </>
                                        )}
                                        {urgency ? ", " : ""}{dateRange} ({duration}{" "}
                                        {duration > 1
                                            ? t("leave-verification.days")
                                            : t("leave-verification.day")})
                                    </span>
                                </span>
                            </div>

                            {/* Description with label */}
                            {lr.description && (
                                <p className="text-sm text-text-secondary whitespace-pre-wrap">
                                    <span className="text-text-muted">
                                        {t("leave-verification.descLabel")}:
                                    </span>{" "}
                                    {lr.description}
                                </p>
                            )}
                        </div>

                        {/* Rejection Reason — outside grey area */}
                        {lr.approval_status === "Rejected" && lr.rejection_reason && (
                            <div className="bg-red-50 border-l-4 border-danger rounded-r-lg p-3 mt-2">
                                <p className="text-xs font-bold text-danger mb-1">
                                    <FiXCircle className="inline align-text-bottom text-danger mr-1 -translate-y-[1px]" /> Alasan Penolakan:
                                </p>
                                <p className="text-sm text-text-primary">{lr.rejection_reason}</p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        {lr.approval_status === "Pending" && (
                            <div className="flex gap-2 justify-end mt-3">
                                <Button
                                    variant="danger-outline"
                                    size="sm"
                                    onClick={() => openConfirmModal("reject", lr)}
                                >
                                    <FiX className="mr-1" />
                                    {t("leave-verification.reject")}
                                </Button>
                                <Button
                                    variant="success"
                                    size="sm"
                                    onClick={() => handleDirectApprove(lr)}
                                >
                                    <FiCheck className="mr-1" />
                                    {t("leave-verification.approve")}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        );
    };

    const confirmLR = confirmModal.leaveRequest;

    return (
        <AppShell
            title={t("leave-verification.pageTitle")}
        >
            <div className="overflow-x-hidden">
            {/* Mobile Header */}
            <div className="lg:hidden mb-4">
                <h1 className="text-xl font-bold text-text-primary font-inter">
                    {t("leave-verification.classLabel")} {resolvedClass?.name ?? "..."}
                </h1>
            </div>

            {/* 100% Figma Replica Top Header Card (uploaded_media_0_1787751665774.png) */}
            <div className="hidden lg:flex bg-surface border border-border rounded-2xl p-4 shadow-xs items-center justify-between gap-4 mb-6 font-inter">
                <h2 className="text-[18px] font-bold text-text-primary">
                    Monitoring Live
                </h2>

                <div className="flex items-center gap-4">
                    {/* Filter Kelas */}
                    <div className="flex items-center gap-2">
                        <span className="text-[13px] font-bold text-text-muted whitespace-nowrap">Filter Kelas:</span>
                        <div className="bg-muted border border-border px-3.5 py-1.5 rounded-xl font-bold text-text-primary text-[13px]">
                            {resolvedClass?.name ? resolvedClass.name.split(" (")[0] : "X-A (Reguler)"}
                        </div>
                    </div>

                    {/* Tanggal */}
                    <div className="flex items-center gap-2">
                        <span className="text-[13px] font-bold text-text-muted whitespace-nowrap">📅 Tanggal:</span>
                        <div className="bg-muted border border-border px-3.5 py-1.5 rounded-xl font-bold text-text-primary text-[13px]">
                            {new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" })} 📅
                        </div>
                    </div>
                </div>
            </div>

            {/* Desktop Header */}
            <div className="hidden lg:block mb-6 font-inter">
                <h1 className="text-[24px] font-extrabold text-text-primary">
                    {t("leave-verification.title")}
                </h1>
                <p className="text-[14px] text-text-muted mt-1">
                    Tinjau pengajuan izin dari wali murid kelas {resolvedClass?.name ? resolvedClass.name.split(" (")[0] : "—"}.
                </p>
            </div>

            {/* ─── Mobile: Search ─── */}
            <div className="lg:hidden mb-2">
                <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t("leave-verification.searchPlaceholder") || "Cari nama atau NISN..."}
                        className="w-full pl-9 pr-4 py-1.5 text-sm border border-border rounded-lg bg-surface text-text-primary placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                        >
                            <FiX className="text-sm" />
                        </button>
                    )}
                </div>
            </div>

            {/* ─── Desktop: Search ─── */}
            <div className="hidden lg:block mb-4">
                <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t("leave-verification.searchPlaceholder") || "Cari nama atau NISN..."}
                        className="w-full pl-9 pr-4 py-2.5 text-sm border border-border rounded-lg bg-surface text-text-primary placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                        >
                            <FiX className="text-sm" />
                        </button>
                    )}
                </div>
            </div>

            {/* ─── Mobile: Filter Bottom Sheet (Compact) ─── */}
            <BottomSheet
                open={filterSheetOpen}
                onClose={() => setFilterSheetOpen(false)}
                title={t("leave-verification.filterTitle") || "Filter Tanggal Izin"}
            >
                <p className="text-xs font-semibold text-text-muted mb-2">
                    {t("leave-verification.filterQuickDate") || "Pilih Cepat:"}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                    {([
                        { key: "week" as const, label: t("leave-verification.quickWeek") || "Minggu Ini", icon: <FiCalendar className="text-[10px]" /> },
                        { key: "month" as const, label: t("leave-verification.quickMonth") || "Bulan Ini", icon: <FiCalendar className="text-[10px]" /> },
                    ]).map((opt) => (
                        <button
                            key={opt.key}
                            type="button"
                            onClick={() => {
                                setDateMode(opt.key);
                                const today = new Date().toISOString().split("T")[0];
                                setCustomStartDate(today);
                                setCustomEndDate(today);
                            }}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                                dateMode === opt.key
                                    ? "bg-primary text-white"
                                    : "bg-background text-text-muted border border-border hover:border-primary/30"
                            }`}
                        >
                            {opt.icon}
                            {opt.label}
                        </button>
                    ))}
                </div>

                <p className="text-xs font-semibold text-text-muted mb-2">
                    {t("leave-verification.filterRangeLabel") || "Atau Pilih Rentang Tanggal:"}
                </p>
                <div className="flex items-end gap-2 mb-4">
                    <div className="flex-1">
                        <label className="block text-[10px] text-text-muted mb-1">
                            {t("leave-verification.filterStartDate") || "Tanggal Mulai"}
                        </label>
                        <input
                            type="date"
                            value={dateMode === "custom" ? customStartDate : ""}
                            onChange={(e) => { setCustomStartDate(e.target.value); setDateMode("custom"); }}
                            className={`w-full px-2.5 py-1.5 text-xs border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary [color-scheme:light] ${
                                dateMode === "custom" ? "border-primary" : "border-border"
                            }`}
                        />
                    </div>
                    <span className="text-text-muted text-xs pb-1.5 shrink-0">-</span>
                    <div className="flex-1">
                        <label className="block text-[10px] text-text-muted mb-1">
                            {t("leave-verification.filterEndDate") || "Tanggal Selesai"}
                        </label>
                        <input
                            type="date"
                            value={dateMode === "custom" ? customEndDate : ""}
                            onChange={(e) => { setCustomEndDate(e.target.value); setDateMode("custom"); }}
                            className={`w-full px-2.5 py-1.5 text-xs border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary [color-scheme:light] ${
                                dateMode === "custom" ? "border-primary" : "border-border"
                            }`}
                        />
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => {
                            setDateMode("week");
                            const today = new Date().toISOString().split("T")[0];
                            setCustomStartDate(today);
                            setCustomEndDate(today);
                            setFilterSheetOpen(false);
                        }}
                        className="flex-1 py-2 text-xs font-medium text-text-muted border border-border rounded-lg hover:bg-background transition-colors"
                    >
                        {t("leave-verification.filterReset") || "Reset"}
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilterSheetOpen(false)}
                        className="flex-1 py-2 text-xs font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors"
                    >
                        {t("leave-verification.applyFilter") || "Terapkan"}
                    </button>
                </div>
            </BottomSheet>

            {/* Mobile Tabs (2 tabs) */}
            <div className="lg:hidden sticky top-0 bg-background z-20 mb-2">
                <div className="flex relative border-b border-border">
                    {mobileTabs.map((tab) => (
                        <button
                            key={tab.key}
                            ref={(el) => { if (el) mobileTabRefs.current.set(tab.key, el); }}
                            type="button"
                            onClick={() => { setActiveTab(tab.key); setSearchQuery(""); setDisplayedCount(10); }}
                            className={`flex-1 inline-flex items-center justify-center px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                                activeTab === tab.key
                                    ? "text-primary font-semibold"
                                    : "text-text-muted"
                            }`}
                        >
                            {tab.label}
                            {tab.count > 0 && (
                                <span
                                    className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                                        activeTab === tab.key
                                            ? "bg-primary text-white"
                                            : "bg-border text-text-muted"
                                    }`}
                                >
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                    <motion.div
                        className="absolute bottom-0 h-0.5 bg-primary rounded-full"
                        animate={{ left: mobileIndicator.left, width: mobileIndicator.width }}
                        transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                </div>

                {/* Quick filter for Riwayat tab — Approval status chips */}
                <AnimatePresence mode="wait">
                    {activeTab === "history" && (
                        <motion.div
                            key="history-filter"
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.15 }}
                            className="flex bg-surface border border-border p-1 rounded-xl mx-4 mt-1"
                        >
                            {(["all", "Approved", "Rejected"] as const).map((filter) => (
                                <button
                                    key={filter}
                                    type="button"
                                    onClick={() => setHistoryFilter(filter)}
                                    className={`flex-1 px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                        historyFilter === filter
                                            ? "bg-primary text-white shadow-sm"
                                            : "text-text-secondary hover:text-text-primary bg-transparent"
                                    }`}
                                >
                                    {filter === "all"
                                        ? "Semua"
                                        : filter === "Approved"
                                          ? "Disetujui"
                                          : "Ditolak"}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ─── Mobile: History Filters ─── */}
            {activeTab === "history" && (
                <div className="lg:hidden mb-4 space-y-2 border-b border-border pb-4">
                    {/* Row 1: Category chips */}
                    <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                        {categoryFilterOptions.map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => {
                                    if (opt.value === "all") {
                                        setSelectedCategories(new Set());
                                    } else {
                                        setSelectedCategories((prev) => {
                                            const next = new Set(prev);
                                            if (next.has(opt.value)) next.delete(opt.value);
                                            else next.add(opt.value);
                                            return next;
                                        });
                                    }
                                }}
                                className={`shrink-0 px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                                    (opt.value === "all" && selectedCategories.size === 0) || selectedCategories.has(opt.value)
                                        ? opt.value === "all"
                                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                                            : opt.value === "Sick"
                                                ? "bg-medical text-white"
                                                : opt.value === "Event"
                                                    ? "bg-permit text-white"
                                                    : opt.value === "Competition"
                                                        ? "bg-achievement text-white"
                                                        : "bg-info text-white"
                                        : "bg-background text-text-muted border border-border hover:border-primary/30"
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    {/* Row 2: Date (50%) + Sort (50%) */}
                    <div className="flex gap-1.5 items-center">
                        <button
                            type="button"
                            onClick={() => setFilterSheetOpen(true)}
                            className={`flex-1 min-w-0 inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors truncate ${
                                dateMode !== "week"
                                    ? "border-primary bg-primary/10 text-primary"
                                    : "border-border bg-surface text-text-muted hover:border-primary/30"
                            }`}
                        >
                            <FiCalendar className="text-[10px] shrink-0" />
                            <span className="truncate">{getDateModeLabel()}</span>
                            <FiChevronDown className="text-[9px] opacity-60 shrink-0" />
                        </button>

                        <div className="relative flex-1 min-w-0">
                            <select
                                value={sortMode}
                                onChange={(e) => setSortMode(e.target.value as typeof sortMode)}
                                className="w-full appearance-none px-3 py-2 pr-7 text-xs font-medium rounded-lg border border-border bg-surface text-text-muted hover:border-primary/30 transition-colors cursor-pointer truncate"
                            >
                                <option value="dateDesc">Terbaru → Terlama</option>
                                <option value="dateAsc">Terlama → Terbaru</option>
                                <option value="lastProcessed">Terakhir Diproses</option>
                            </select>
                            <FiChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-text-muted pointer-events-none" />
                        </div>
                    </div>
                </div>
            )}

            {/* Desktop Tabs + Filters (single row) */}
            <div className="hidden lg:flex flex-wrap items-center gap-1 mb-6 bg-background z-10 border-b border-border">
                <div className="flex gap-1 relative shrink-0">
                    {desktopTabs.map((tab) => (
                        <button
                            key={tab.key}
                            ref={(el) => { if (el) desktopTabRefs.current.set(tab.key, el); }}
                            type="button"
                            onClick={() => { setActiveTab(tab.key); setSearchQuery(""); setDisplayedCount(10); }}
                            className={`inline-flex items-center px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                                activeTab === tab.key
                                    ? "text-primary font-semibold"
                                    : "text-text-muted hover:text-text-primary"
                            }`}
                        >
                            {tab.label}
                            {tab.count > 0 && (
                                <span
                                    className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                                        activeTab === tab.key
                                            ? "bg-primary text-white"
                                            : "bg-border text-text-muted"
                                    }`}
                                >
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                    <motion.div
                        className="absolute bottom-0 h-0.5 bg-primary rounded-full"
                        animate={{ left: desktopIndicator.left, width: desktopIndicator.width }}
                        transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                </div>

                {activeTab !== "pending" && (
                    <>
                        <div className="hidden w-px h-6 bg-border shrink-0 mx-1" />

                        <div className="flex items-center gap-2 flex-1 min-w-0 py-1 justify-end">
                            {/* Category Filter — Desktop: chips, Tablet: dropdown */}
                            <div className="hidden lg:flex gap-1.5 shrink-0">
                                {categoryFilterOptions.map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => {
                                            if (opt.value === "all") {
                                                setSelectedCategories(new Set());
                                            } else {
                                                setSelectedCategories((prev) => {
                                                    const next = new Set(prev);
                                                    if (next.has(opt.value)) next.delete(opt.value);
                                                    else next.add(opt.value);
                                                    return next;
                                                });
                                            }
                                        }}
                                        className={`shrink-0 px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                                            (opt.value === "all" && selectedCategories.size === 0) || selectedCategories.has(opt.value)
                                                ? opt.value === "all"
                                                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                                                    : opt.value === "Sick"
                                                        ? "bg-medical text-white"
                                                        : opt.value === "Event"
                                                            ? "bg-permit text-white"
                                                            : opt.value === "Competition"
                                                                ? "bg-achievement text-white"
                                                                : "bg-info text-white"
                                                : "bg-background text-text-muted border border-border hover:border-primary/30"
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>

                            <div className="hidden md:flex lg:hidden">
                                <FilterDropdown
                                    open={categoryDropdownOpen}
                                    onClose={() => setCategoryDropdownOpen(false)}
                                    multiSelect
                                    trigger={
                                        <button
                                            type="button"
                                            onClick={() => { setCategoryDropdownOpen(!categoryDropdownOpen); setDatePopoverOpen(false); setSortDropdownOpen(false); }}
                                        className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap ${
                                                selectedCategories.size > 0
                                                    ? "border-primary bg-primary/10 text-primary"
                                                    : "border-border bg-surface text-text-muted hover:border-primary/30"
                                            }`}
                                        >
                                            <span>Kategori: {selectedCategories.size > 0 ? categoryFilterOptions.filter((o) => selectedCategories.has(o.value)).map((o) => o.label).join(", ") : "Semua"}</span>
                                            <FiChevronDown className="text-[9px] opacity-60" />
                                        </button>
                                    }
                                    options={categoryFilterOptions}
                                    value={selectedCategories.size === 0 ? "all" : Array.from(selectedCategories)}
                                    onChange={(v) => {
                                        if (v === "all") {
                                            setSelectedCategories(new Set());
                                        } else {
                                            setSelectedCategories((prev) => {
                                                const next = new Set(prev);
                                                if (next.has(v)) next.delete(v);
                                                else next.add(v);
                                                return next;
                                            });
                                        }
                                    }}
                                />
                            </div>

                            {/* Date Filter Popover */}
                            <FilterPopover
                                open={datePopoverOpen}
                                onClose={() => setDatePopoverOpen(false)}
                                offsetX={-60}
                                offsetY={2}
                                trigger={
                                    <button
                                        type="button"
                                        onClick={() => { setTempDateMode(dateMode); setTempCustomStart(customStartDate); setTempCustomEnd(customEndDate); setDatePopoverOpen(!datePopoverOpen); setCategoryDropdownOpen(false); setSortDropdownOpen(false); }}
                                        className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                                            dateMode !== "week"
                                                ? "border-primary bg-primary/10 text-primary"
                                                : "border-border bg-surface text-text-muted hover:border-primary/30"
                                        }`}
                                    >
                                        <FiCalendar className="text-[10px]" />
                                        <span>{getDateModeLabel()}</span>
                                        <FiChevronDown className="text-[9px] opacity-60" />
                                    </button>
                                }
                                align="left"
                            >
                                <div className="space-y-3">
                                    <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Pilihan Cepat</p>
                                    {([
                                        { value: "week", label: "Minggu Ini" },
                                        { value: "month", label: "Bulan Ini" },
                                    ]).map((opt) => (
                                        <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group">
                                            <input
                                                type="radio"
                                                name="desktop-date-filter"
                                                checked={tempDateMode === opt.value}
                                                onChange={() => setTempDateMode(opt.value as typeof tempDateMode)}
                                                className="w-3.5 h-3.5 text-primary border-border focus:ring-primary/20"
                                            />
                                            <span className="text-sm text-text-primary group-hover:text-primary transition-colors">{opt.label}</span>
                                        </label>
                                    ))}

                                    <div className="border-t border-border pt-3">
                                        <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2">Rentang Tanggal Izin</p>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="date"
                                                value={tempCustomStart}
                                                onChange={(e) => { setTempCustomStart(e.target.value); setTempDateMode("custom"); }}
                                                className="flex-1 px-2.5 py-1.5 text-xs border border-border rounded-lg bg-surface text-text-primary [color-scheme:light] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                            />
                                            <span className="text-text-muted text-xs">s/d</span>
                                            <input
                                                type="date"
                                                value={tempCustomEnd}
                                                onChange={(e) => { setTempCustomEnd(e.target.value); setTempDateMode("custom"); }}
                                                className="flex-1 px-2.5 py-1.5 text-xs border border-border rounded-lg bg-surface text-text-primary [color-scheme:light] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-1">
                                        <button
                                            type="button"
                                            onClick={() => setDatePopoverOpen(false)}
                                            className="flex-1 py-2 text-xs font-medium text-text-muted border border-border rounded-lg hover:bg-background transition-colors"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setDateMode(tempDateMode);
                                                setCustomStartDate(tempCustomStart);
                                                setCustomEndDate(tempCustomEnd);
                                                setDatePopoverOpen(false);
                                            }}
                                            className="flex-1 py-2 text-xs font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors"
                                        >
                                            Terapkan
                                        </button>
                                    </div>
                                </div>
                            </FilterPopover>

                            {/* Sort Dropdown */}
                            <FilterDropdown
                                open={sortDropdownOpen}
                                onClose={() => setSortDropdownOpen(false)}
                                align="right"
                                minWidth={200}
                                trigger={
                                    <button
                                        type="button"
                                        onClick={() => { setSortDropdownOpen(!sortDropdownOpen); setDatePopoverOpen(false); setCategoryDropdownOpen(false); }}
                                        className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-surface text-text-muted hover:border-primary/30 transition-colors whitespace-nowrap"
                                    >
                                        <FiArrowDown className="text-[10px]" />
                                        <span>{sortOptions.find((o) => o.value === sortMode)?.label ?? "Urutkan"}</span>
                                        <FiChevronDown className="text-[9px] opacity-60" />
                                    </button>
                                }
                                options={sortOptions}
                                value={sortMode}
                                onChange={(v) => setSortMode(v as typeof sortMode)}
                            />
                        </div>
                    </>
                )}
            </div>

            {/* Leave Request Cards */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab + (activeTab === "history" ? `-${historyFilter}` : "")}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.12 }}
                >
                {currentRequests.length === 0 ? (
                    query ? (
                        <div className="py-8 sm:py-12 flex flex-col items-center">
                            <FiSearch className="text-4xl text-text-inactive mb-3" />
                            <p className="text-base font-semibold text-text-primary mb-1">
                                {t("leave-verification.emptySearchTitle")}
                            </p>
                            <p className="text-sm text-text-muted">
                                {t("leave-verification.emptySearchDesc")}
                            </p>
                        </div>
                    ) : activeTab === "pending" ? (
                        <div className="py-8 sm:py-12 flex flex-col items-center">
                            <FiClipboard className="text-4xl text-success mb-3" />
                            <p className="text-base font-semibold text-text-primary mb-1">
                                {t("leave-verification.emptyPendingTitle")}
                            </p>
                            <p className="text-sm text-text-muted">
                                {t("leave-verification.emptyPendingDesc")}
                            </p>
                        </div>
                    ) : activeTab === "approved" || (activeTab === "history" && historyFilter === "Approved") ? (
                        <div className="py-8 sm:py-12 flex flex-col items-center">
                            <FiFileText className="text-4xl text-text-inactive mb-3" />
                            <p className="text-base font-semibold text-text-primary mb-1">
                                {t("leave-verification.emptyApprovedTitle")}
                            </p>
                            <p className="text-sm text-text-muted">
                                {t("leave-verification.emptyApprovedDesc")}
                            </p>
                        </div>
                    ) : activeTab === "rejected" || (activeTab === "history" && historyFilter === "Rejected") ? (
                        <div className="py-8 sm:py-12 flex flex-col items-center">
                            <FiSmile className="text-4xl text-success mb-3" />
                            <p className="text-base font-semibold text-text-primary mb-1">
                                {t("leave-verification.emptyRejectedTitle")}
                            </p>
                            <p className="text-sm text-text-muted">
                                {t("leave-verification.emptyRejectedDesc")}
                            </p>
                        </div>
                    ) : (
                        <div className="py-8 sm:py-12 flex flex-col items-center">
                            <FiClock className="text-4xl text-text-inactive mb-3" />
                            <p className="text-base font-semibold text-text-primary mb-1">
                                {t("leave-verification.emptyHistoryTitle")}
                            </p>
                            <p className="text-sm text-text-muted">
                                {t("leave-verification.emptyHistoryDesc")}
                            </p>
                        </div>
                    )
                ) : (
                    <>
                        {/* Mobile Cards */}
                        <div className="lg:hidden space-y-4 pb-8">
                            <AnimatePresence mode="popLayout">
                                {visibleItems.map((lr) =>
                                    renderCard(lr, true, activeTab === "pending")
                                )}
                            </AnimatePresence>
                            {activeTab === "history" && (
                                <div ref={observerRef} className="py-4 text-center">
                                    {loadingMore ? (
                                        <p className="text-sm text-text-muted">
                                            <FiLoader className="inline animate-spin mr-2" />
                                            {t("leave-verification.loadingMore") || "Memuat data..."}
                                        </p>
                                    ) : displayedCount < totalFilteredCount ? (
                                        <p className="text-sm text-text-muted">
                                            Menampilkan {displayedCount} dari {totalFilteredCount} data • {t("leave-verification.loadMoreHint") || "Usap ke atas untuk memuat lagi"}
                                        </p>
                                    ) : endOfListText ? (
                                        <p className="text-sm text-text-muted text-center py-4 font-normal">
                                            {endOfListText}
                                        </p>
                                    ) : null}
                                </div>
                            )}
                            {activeTab !== "history" && endOfListText && (
                                <p className="text-sm text-text-muted text-center py-4 font-normal">
                                    {endOfListText}
                                </p>
                            )}
                        </div>

                        {/* Desktop Cards */}
                        <div className="hidden lg:block space-y-4">
                            <AnimatePresence mode="popLayout">
                                {sortedRequests.map((lr) => renderCard(lr, false, activeTab === "pending"))}
                            </AnimatePresence>
                            {activeTab !== "history" && endOfListText && (
                                <p className="text-sm text-text-muted text-center py-4 font-normal">
                                    {endOfListText}
                                </p>
                            )}
                        </div>

                        {/* Desktop Pagination */}
                        {activeTab !== "pending" && sortedRequests.length > 10 && (
                            <div className="hidden lg:flex items-center justify-between pt-4">
                                <p className="text-sm text-text-muted">
                                    Menampilkan {Math.min(1, totalFilteredCount)}-{totalFilteredCount} dari {totalFilteredCount} data
                                </p>
                            </div>
                        )}
                    </>
                )}
                </motion.div>
            </AnimatePresence>

            {/* Image Preview Modal */}
            <PreviewImageModal url={previewImage} onClose={() => setPreviewImage(null)} />

            {/* Reject Modal */}
            <Modal
                open={confirmModal.open}
                onClose={closeConfirmModal}
                title={
                    confirmLR
                        ? `${t("modal.confirmRejectTitle")} ${confirmLR.student.name}?`
                        : t("modal.confirmRejectTitle")
                }
                subtitle={
                    confirmLR
                        ? `${formatDate(confirmLR.start_date)}${
                              confirmLR.start_date !== confirmLR.end_date
                                  ? ` - ${formatDate(confirmLR.end_date)}`
                                  : ""
                          }`
                        : undefined
                }
                onSubmit={handleConfirmAction}
                submitLabel={t("modal.yesReject")}
                submitVariant="danger"
                loading={isSubmitting}
                disabled={isRejectDisabled || isSubmitting}
                width="md"
            >
                {confirmLR && (
                    <div className="space-y-3">

                        <div className="space-y-3">
                            <p className="text-sm font-medium text-text-primary">
                                {t("modal.rejectReasonLabel")}
                            </p>
                            <div className="space-y-2">
                                {[
                                    t("modal.rejectReason1"),
                                    t("modal.rejectReason2"),
                                    t("modal.rejectReason3"),
                                    t("modal.rejectReason4"),
                                    t("modal.rejectReason5"),
                                    t("modal.rejectReason6"),
                                ].map((reason, idx) => (
                                    <label
                                        key={idx}
                                        className="flex items-start gap-2 cursor-pointer group"
                                    >
                                        <input
                                            type="radio"
                                            name="rejectionReason"
                                            value={reason}
                                            checked={rejectionReason === reason}
                                            onChange={() => setRejectionReason(reason)}
                                            className="mt-0.5 text-primary focus:ring-primary"
                                        />
                                        <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                                            {reason.includes("(") ? (
                                                <>
                                                    {reason.split("(")[0]}
                                                    <span className="italic">
                                                        ({reason.split("(")[1]}
                                                    </span>
                                                </>
                                            ) : (
                                                reason
                                            )}
                                        </span>
                                    </label>
                                ))}
                            </div>

                            <div>
                                <label className="text-sm text-text-muted block mb-1">
                                    {t("modal.additionalNoteLabel").replace(
                                        "(Opsional)",
                                        isLainnya ? "(Wajib)" : "(Opsional)",
                                    )}
                                </label>
                                <textarea
                                    value={rejectionNote}
                                    onChange={(e) => setRejectionNote(e.target.value)}
                                    placeholder={t("modal.additionalNotePlaceholder")}
                                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface text-text-primary placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                                    rows={3}
                                />
                            </div>
                        </div>

                        <p className="text-sm text-text-muted pt-2 border-t border-border flex items-start gap-2 italic">
                            <FiAlertTriangle className="text-warning mt-0.5 shrink-0" />
                            <span>{t("modal.rejectConfirmMessage")}</span>
                        </p>
                    </div>
                )}
            </Modal>
            </div>
        </AppShell>
    );
}
