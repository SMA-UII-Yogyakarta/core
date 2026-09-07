import { router, useForm, usePage } from "@inertiajs/react";
import { useState } from "react";
import {
    PageHeader,
    Card,
    Button,
    Modal,
    NativeSelect,
    MobileNativePagination,
    Input,
    Table,
    TableFooter,
    ConfirmDialog,
    TabSwitcher,
    EmptyState,
} from "@/Components";
import AppShell from "@/Layouts/AppShell";
import {
    FiBell,
    FiTrash2,
    FiSend,
    FiCheckSquare,
    FiUsers,
    FiClock,
    FiInbox,
} from "react-icons/fi";
import { notificationSchema } from "@/schemas";
import { validateForm } from "@/utils/zodHelper";

interface NotificationSender {
    id: number;
    name: string;
    role: string;
}

interface NotificationItem {
    id: number;
    sender_id: number | null;
    recipient_id: number | null;
    target_group: string | null;
    title: string;
    content: string;
    created_at: string;
    is_read?: boolean;
    sender?: NotificationSender | null;
}

interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
}

interface NotificationsProps {
    notifications: PaginatedData<NotificationItem>;
    sentNotifications: PaginatedData<NotificationItem> | null;
    unreadCount: number;
}

const formatDate = (dateStr: string) => {
    try {
        const date = new Date(dateStr);
        return date.toLocaleString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return dateStr;
    }
};

const getGroupLabel = (group: string | null) => {
    switch (group) {
        case "all":
            return "Semua Pengguna";
        case "student":
            return "Siswa";
        case "teacher":
            return "Guru";
        case "guardian":
            return "Wali Murid";
        default:
            return "Umum";
    }
};

const getGroupBadgeColor = (group: string | null) => {
    switch (group) {
        case "all":
            return "bg-primary/10 text-primary border-primary/20";
        case "student":
            return "bg-sky-500/10 text-sky-600 border-sky-500/20";
        case "teacher":
            return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
        case "guardian":
            return "bg-amber-500/10 text-amber-600 border-amber-500/20";
        default:
            return "bg-muted text-text-secondary border-border";
    }
};

export default function Notifications({
    notifications,
    sentNotifications,
    unreadCount,
}: NotificationsProps) {
    const { auth } = usePage().props as unknown as {
        auth: { user: { role?: string } | null };
    };
    const isAdmin = auth.user?.role === "admin";

    const [activeTab, setActiveTab] = useState<"inbox" | "sent">("inbox");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<{
        open: boolean;
        id: number | null;
    }>({
        open: false,
        id: null,
    });

    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        setError,
        clearErrors,
    } = useForm({
        title: "",
        content: "",
        target_group: "all" as "all" | "student" | "teacher" | "guardian",
    });

    const handleCreateNotification = (e: React.FormEvent) => {
        e.preventDefault();
        clearErrors();

        const valid = validateForm(notificationSchema, data);
        if (!valid.success) {
            for (const [key, msg] of Object.entries(valid.errors)) {
                setError(key as keyof typeof data, msg);
            }
            return;
        }

        post("/notifications/store", {
            onSuccess: () => {
                setIsCreateOpen(false);
                reset();
            },
        });
    };

    const handleMarkAsRead = (id: number) => {
        router.post(`/notifications/read/${id}`, {}, { preserveScroll: true });
    };

    const handleMarkAllAsRead = () => {
        router.post("/notifications/read/all", {}, { preserveScroll: true });
    };

    const handleDeleteNotification = (id: number) => {
        setDeleteConfirm({ open: true, id });
    };

    const handleConfirmedDeleteNotification = () => {
        if (deleteConfirm.id) {
            router.delete(`/notifications/${deleteConfirm.id}`, {
                preserveScroll: true,
            });
            setDeleteConfirm({ open: false, id: null });
        }
    };

    const handleNavigateBack = () => {
        if (typeof window !== "undefined" && window.history.length > 1) {
            window.history.back();
        } else {
            router.visit("/dashboard");
        }
    };

    // Helper for rendering paginators cleanly with TableFooter
    const renderPagination = (
        paginated: PaginatedData<NotificationItem>,
        paramName?: string
    ) => {
        if (paginated.total === 0) return null;
        const onPageChange = (page: number) => {
            const params = paramName ? { [paramName]: page } : { page };
            router.get("/notifications", params, { preserveState: true });
        };
        return (
            <>
                <div className="hidden sm:block">
                    <TableFooter
                        currentPage={paginated.current_page}
                        totalPages={paginated.last_page}
                        totalItems={paginated.total}
                        perPage={paginated.per_page}
                        onPageChange={onPageChange}
                    />
                </div>
                <div className="sm:hidden w-full shrink-0">
                    <MobileNativePagination
                        currentPage={paginated.current_page}
                        totalPages={paginated.last_page}
                        totalItems={paginated.total}
                        perPage={paginated.per_page}
                        onPageChange={onPageChange}
                        itemLabel="notifikasi"
                    />
                </div>
            </>
        );
    };

    // Standardized Mobile Header Actions (Icon Buttons)
    const mobileHeaderActions = (
        <div className="flex items-center gap-2 sm:hidden font-inter">
            {activeTab === "inbox" && unreadCount > 0 && (
                <button
                    type="button"
                    onClick={handleMarkAllAsRead}
                    className="w-8 h-8 rounded-full bg-muted/60 text-text-primary hover:bg-muted flex items-center justify-center transition-all cursor-pointer shadow-xs"
                    title="Tandai Semua Dibaca"
                    aria-label="Tandai Semua Dibaca"
                >
                    <FiCheckSquare className="text-[14px]" />
                </button>
            )}
            {isAdmin && (
                <button
                    type="button"
                    onClick={() => setIsCreateOpen(true)}
                    className="w-8 h-8 rounded-full bg-accent text-primary flex items-center justify-center hover:brightness-95 active:scale-95 transition-all cursor-pointer shadow-xs"
                    title="Kirim Notifikasi"
                    aria-label="Kirim Notifikasi"
                >
                    <FiSend className="text-[14px]" />
                </button>
            )}
        </div>
    );

    return (
        <AppShell
            title="Notifikasi"
            onBack={handleNavigateBack}
            hasTopTabs={isAdmin}
            headerActions={mobileHeaderActions}
            showNotificationBell={false}
        >
            {/* Desktop Page Header */}
            <PageHeader
                title="Bilah Notifikasi"
                description="Pantau pengumuman sekolah serta pemberitahuan sistem absensi."
                className="hidden lg:flex shrink-0 mb-4"
            />

            {/* Mobile Tab Switcher (< sm) */}
            {isAdmin && (
                <div className="sm:hidden flex flex-col gap-2.5 mb-3 font-inter">
                    <TabSwitcher
                        tabs={[
                            {
                                key: "inbox",
                                label: "Masuk",
                                icon: <FiInbox className="text-[13px]" />,
                                count: unreadCount > 0 ? unreadCount : undefined,
                            },
                            {
                                key: "sent",
                                label: "Terkirim",
                                icon: <FiSend className="text-[13px]" />,
                            },
                        ]}
                        activeKey={activeTab}
                        onChange={(key) => setActiveTab(key as "inbox" | "sent")}
                        variant="segmented"
                        fullWidth
                    />
                </div>
            )}

            {/* Tablet & Desktop Toolbar (>= sm) */}
            <div className="hidden sm:flex items-center justify-between gap-3 mb-4 font-inter w-full">
                <div className="hidden sm:flex min-w-0 shrink">
                    {isAdmin && (
                        <TabSwitcher
                            tabs={[
                                {
                                    key: "inbox",
                                    label: "Notifikasi Masuk",
                                    icon: <FiBell className="text-[14px]" />,
                                    count: unreadCount,
                                },
                                {
                                    key: "sent",
                                    label: "Kelola Pengiriman",
                                    icon: <FiSend className="text-[14px]" />,
                                },
                            ]}
                            activeKey={activeTab}
                            onChange={(key) => setActiveTab(key as "inbox" | "sent")}
                            variant="segmented"
                            shrinkable
                        />
                    )}
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-auto">
                    {activeTab === "inbox" && unreadCount > 0 && (
                        <Button
                            variant="secondary"
                            onClick={handleMarkAllAsRead}
                            className="h-10 px-3.5 font-bold text-[12.5px] shadow-xs rounded-xl shrink-0"
                            icon={<FiCheckSquare className="text-[13px]" />}
                        >
                            Tandai Dibaca
                        </Button>
                    )}
                    {isAdmin && (
                        <Button
                            variant="primary"
                            onClick={() => setIsCreateOpen(true)}
                            className="h-10 px-4 font-bold text-[13px] shadow-xs rounded-xl shrink-0"
                            icon={<FiSend className="text-[14px]" />}
                        >
                            Kirim Notifikasi
                        </Button>
                    )}
                </div>
            </div>

            {/* Mobile Quick Banner for Unread Count */}
            {activeTab === "inbox" && unreadCount > 0 && (
                <div className="sm:hidden flex items-center justify-between px-3.5 py-2.5 mb-3 bg-surface border border-border rounded-2xl text-[12px] font-inter shadow-xs">
                    <span className="text-text-secondary font-medium">
                        <strong className="text-text-primary">{unreadCount}</strong> notifikasi belum dibaca
                    </span>
                    <button
                        type="button"
                        onClick={handleMarkAllAsRead}
                        className="text-primary font-bold text-[12px] px-2.5 py-1 rounded-lg bg-primary/8 hover:bg-primary/15 transition-colors cursor-pointer shrink-0 ml-2"
                    >
                        Tandai Dibaca
                    </button>
                </div>
            )}

            {/* MAIN CONTENT AREA */}
            {activeTab === "inbox" ? (
                /* INBOX NOTIFICATIONS (CARD STACK) */
                <div className="w-full flex flex-col gap-4 font-inter">
                    {notifications.data.length === 0 ? (
                        <Card className="flex flex-col items-center justify-center p-8 text-center bg-surface border border-border shadow-card rounded-2xl">
                            <EmptyState
                                variant="no-data"
                                title="Kotak Masuk Kosong"
                                description="Saat ini tidak ada notifikasi atau pengumuman baru untuk Anda."
                            />
                        </Card>
                    ) : (
                        <div className="flex flex-col gap-2.5 sm:gap-3">
                            {notifications.data.map((n) => (
                                <div
                                    key={n.id}
                                    onClick={() => !n.is_read && handleMarkAsRead(n.id)}
                                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-150 flex items-start gap-3 select-none ${
                                        n.is_read
                                            ? "bg-surface border-border opacity-85 hover:border-text-inactive/30"
                                            : "bg-primary/5 border-primary/30 ring-1 ring-primary/10 cursor-pointer hover:bg-primary/10 shadow-xs"
                                    }`}
                                >
                                    <div
                                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                                            n.is_read
                                                ? "bg-muted text-text-inactive"
                                                : "bg-primary text-white shadow-xs"
                                        }`}
                                    >
                                        <FiBell className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0 space-y-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <h3
                                                className={`text-[13.5px] sm:text-[14px] leading-snug line-clamp-1 ${
                                                    n.is_read
                                                        ? "text-text-primary font-medium"
                                                        : "text-text-primary font-bold"
                                                }`}
                                            >
                                                {n.title}
                                            </h3>
                                            <span className="text-[11px] text-text-inactive shrink-0 whitespace-nowrap pt-0.5">
                                                {formatDate(n.created_at)}
                                            </span>
                                        </div>
                                        <p className="text-[12.5px] sm:text-[13px] text-text-secondary leading-relaxed whitespace-pre-line break-words">
                                            {n.content}
                                        </p>
                                        <div className="flex items-center gap-2 pt-1">
                                            <span className="text-[10px] bg-muted px-2 py-0.5 rounded-md text-text-secondary font-medium">
                                                Pengirim: {n.sender?.name ?? "Sistem Sekolah"}
                                            </span>
                                            {!n.is_read && (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                                    Baru
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {renderPagination(notifications)}
                </div>
            ) : (
                /* SENT NOTIFICATIONS (MOBILE CARD STACK + DESKTOP TABLE) */
                isAdmin &&
                sentNotifications && (
                    <>
                        {/* Desktop View (>= sm) - Full height container with scrollable Table & TableFooter */}
                        <div className="hidden sm:flex flex-1 min-h-0 flex-col justify-between gap-3 font-inter w-full">
                            {sentNotifications.data.length === 0 ? (
                                <Card className="flex flex-col items-center justify-center p-8 text-center bg-surface border border-border shadow-card rounded-2xl">
                                    <EmptyState
                                        variant="no-data"
                                        title="Belum Ada Pengiriman"
                                        description="Anda belum pernah mengirim notifikasi siaran atau pengumuman."
                                    />
                                </Card>
                            ) : (
                                <div className="flex-1 min-h-0 flex flex-col">
                                    <Table
                                        columns={[
                                            {
                                                key: "title",
                                                header: "Judul",
                                                render: (n) => (
                                                    <span className="font-bold text-text-primary truncate max-w-[180px] block">
                                                        {n.title}
                                                    </span>
                                                ),
                                            },
                                            {
                                                key: "target_group",
                                                header: "Penerima",
                                                render: (n) => (
                                                    <span
                                                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getGroupBadgeColor(
                                                            n.target_group
                                                        )}`}
                                                    >
                                                        {getGroupLabel(n.target_group)}
                                                    </span>
                                                ),
                                            },
                                            {
                                                key: "content",
                                                header: "Isi Pengumuman",
                                                render: (n) => (
                                                    <span className="text-text-secondary truncate max-w-[280px] block">
                                                        {n.content}
                                                    </span>
                                                ),
                                            },
                                            {
                                                key: "created_at",
                                                header: "Waktu Kirim",
                                                render: (n) => (
                                                    <span className="text-text-inactive">
                                                        {formatDate(n.created_at)}
                                                    </span>
                                                ),
                                            },
                                            {
                                                key: "actions",
                                                header: <div className="text-right w-full">Aksi</div>,
                                                render: (n) => (
                                                    <div className="flex justify-end">
                                                        <button
                                                            onClick={() => handleDeleteNotification(n.id)}
                                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-danger/20 bg-danger-bg text-danger hover:bg-danger/20 text-[11.5px] font-semibold transition-colors cursor-pointer"
                                                            type="button"
                                                            aria-label="Hapus Notifikasi"
                                                        >
                                                            <FiTrash2 className="text-[13px]" />
                                                            <span>Hapus</span>
                                                        </button>
                                                    </div>
                                                ),
                                                className: "text-right",
                                            },
                                        ]}
                                        data={sentNotifications.data}
                                        keyExtractor={(n) => n.id}
                                        emptyMessage="Anda belum pernah mengirim notifikasi."
                                        containerClassName="flex-1 min-h-0 overflow-auto bg-surface border border-border rounded-2xl"
                                        dense
                                    />
                                </div>
                            )}

                            {renderPagination(sentNotifications, "sent_page")}
                        </div>

                        {/* Mobile View (< sm) - Natural flex container with mobile card stack & MobileNativePagination */}
                        <div className="sm:hidden flex flex-col gap-3 font-inter w-full">
                            {sentNotifications.data.length === 0 ? (
                                <Card className="flex flex-col items-center justify-center p-8 text-center bg-surface border border-border shadow-card rounded-2xl">
                                    <EmptyState
                                        variant="no-data"
                                        title="Belum Ada Pengiriman"
                                        description="Anda belum pernah mengirim notifikasi siaran atau pengumuman."
                                    />
                                </Card>
                            ) : (
                                <div className="flex flex-col gap-2.5">
                                    {sentNotifications.data.map((n) => (
                                        <div
                                            key={n.id}
                                            className="p-4 bg-surface border border-border rounded-2xl shadow-xs space-y-2 select-none"
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <span
                                                    className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border flex items-center gap-1 shrink-0 ${getGroupBadgeColor(
                                                        n.target_group
                                                    )}`}
                                                >
                                                    <FiUsers className="text-[10px]" />
                                                    {getGroupLabel(n.target_group)}
                                                </span>
                                                <div className="flex items-center gap-1 shrink-0">
                                                    <span className="text-[10.5px] text-text-inactive flex items-center gap-1">
                                                        <FiClock className="text-[10px]" />
                                                        {formatDate(n.created_at)}
                                                    </span>
                                                    <button
                                                        onClick={() => handleDeleteNotification(n.id)}
                                                        className="w-7 h-7 flex items-center justify-center text-danger hover:bg-danger-bg rounded-lg transition-colors cursor-pointer ml-1"
                                                        type="button"
                                                        aria-label="Hapus notifikasi"
                                                    >
                                                        <FiTrash2 className="text-[13px]" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="text-[13.5px] font-bold text-text-primary leading-tight mb-1">
                                                    {n.title}
                                                </h3>
                                                <p className="text-[12.5px] text-text-secondary leading-relaxed whitespace-pre-line break-words">
                                                    {n.content}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {renderPagination(sentNotifications, "sent_page")}
                        </div>
                    </>
                )
            )}

            {/* Send Notification Modal */}
            {isCreateOpen && (
                <Modal
                    open={isCreateOpen}
                    onClose={() => setIsCreateOpen(false)}
                    title="Buat Notifikasi Baru"
                >
                    <form onSubmit={handleCreateNotification} className="space-y-4 font-inter">
                        <Input
                            label="Judul Notifikasi"
                            required
                            value={data.title}
                            onChange={(e) => setData("title", e.target.value)}
                            placeholder="Masukkan judul pengumuman..."
                            error={errors.title}
                        />

                        <div>
                            <label className="block text-[13px] font-bold text-text-primary mb-1">
                                Target Penerima
                            </label>
                            <NativeSelect
                                value={data.target_group}
                                onChange={(e) =>
                                    setData(
                                        "target_group",
                                        e.target.value as "all" | "student" | "teacher" | "guardian"
                                    )
                                }
                                className="w-full"
                            >
                                <option value="all">Semua Pengguna</option>
                                <option value="student">Hanya Siswa</option>
                                <option value="teacher">Hanya Guru</option>
                                <option value="guardian">Hanya Wali Murid</option>
                            </NativeSelect>
                        </div>

                        <div>
                            <label className="block text-[13px] font-bold text-text-primary mb-1">
                                Isi Pengumuman
                            </label>
                            <textarea
                                required
                                rows={4}
                                value={data.content}
                                onChange={(e) => setData("content", e.target.value)}
                                placeholder="Tuliskan isi pengumuman secara detail..."
                                className="w-full border border-border rounded-lg p-3 text-[13px] text-text-primary bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 font-inter"
                            />
                            {errors.content && (
                                <p className="mt-1 text-[11px] text-danger">{errors.content}</p>
                            )}
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                variant="secondary"
                                onClick={() => setIsCreateOpen(false)}
                                type="button"
                            >
                                Batal
                            </Button>
                            <Button variant="primary" loading={processing} type="submit">
                                Kirim Pengumuman
                            </Button>
                        </div>
                    </form>
                </Modal>
            )}

            <ConfirmDialog
                open={deleteConfirm.open}
                onClose={() => setDeleteConfirm({ open: false, id: null })}
                onConfirm={handleConfirmedDeleteNotification}
                title="Hapus Notifikasi"
                message="Apakah Anda yakin ingin menghapus notifikasi ini?"
                confirmLabel="Ya, Hapus"
                variant="danger"
            />
        </AppShell>
    );
}
