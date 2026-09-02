import { router, useForm, usePage } from "@inertiajs/react";
import { useState } from "react";
import {
    PageHeader,
    Card,
    Button,
    Modal,
    NativeSelect,
    Pagination,
    Input,
    Table,
    ConfirmDialog,
    TabSwitcher,
    Tooltip,
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
    FiPlus,
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

    const [deleteConfirm, setDeleteConfirm] = useState<{
        open: boolean;
        id: number | null;
    }>({
        open: false,
        id: null,
    });

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

    // Mobile Header Segmented Switcher (Height matched to h-8 / 32px profile avatar button)
    const mobileHeaderActions = isAdmin ? (
        <div className="h-8 flex sm:hidden items-center bg-white/15 p-0.5 rounded-xl border border-white/20 select-none box-border shrink-0">
            <button
                type="button"
                onClick={() => setActiveTab("inbox")}
                className={`h-full px-2.5 rounded-lg text-[11.5px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer select-none leading-none ${
                    activeTab === "inbox"
                        ? "bg-white text-primary shadow-xs"
                        : "text-white/80 hover:text-white"
                }`}
                aria-label="Notifikasi Masuk"
            >
                <FiInbox className="text-[12px] shrink-0" />
                <span>Masuk</span>
                {unreadCount > 0 && (
                    <span className="h-4 min-w-4 px-1 rounded-full text-[9px] font-extrabold bg-danger text-white flex items-center justify-center shrink-0">
                        {unreadCount}
                    </span>
                )}
            </button>
            <button
                type="button"
                onClick={() => setActiveTab("sent")}
                className={`h-full px-2.5 rounded-lg text-[11.5px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer select-none leading-none ${
                    activeTab === "sent"
                        ? "bg-white text-primary shadow-xs"
                        : "text-white/80 hover:text-white"
                }`}
                aria-label="Kelola Pengiriman"
            >
                <FiSend className="text-[11.5px] shrink-0" />
                <span>Terkirim</span>
            </button>
        </div>
    ) : null;

    const handleNavigateBack = () => {
        if (typeof window !== "undefined" && window.history.length > 1) {
            window.history.back();
        } else {
            router.visit("/dashboard");
        }
    };

    return (
        <AppShell
            title="Notifikasi"
            onBack={handleNavigateBack}
            headerActions={mobileHeaderActions}
        >
            {/* Desktop Page Header */}
            <PageHeader
                title="Bilah Notifikasi"
                description="Pantau pengumuman sekolah serta pemberitahuan sistem absensi."
                className="hidden sm:flex shrink-0 mb-4"
            >
                {activeTab === "inbox" && unreadCount > 0 && (
                    <Button
                        variant="secondary"
                        onClick={handleMarkAllAsRead}
                        className="h-9 px-3.5 font-bold text-[12.5px] shadow-xs rounded-xl shrink-0"
                        icon={<FiCheckSquare className="text-[13px]" />}
                    >
                        Tandai Semua Dibaca
                    </Button>
                )}
                {isAdmin && (
                    <Button
                        variant="primary"
                        onClick={() => setIsCreateOpen(true)}
                        className="h-9 px-3.5 font-bold text-[12.5px] shadow-xs rounded-xl shrink-0"
                        icon={<FiSend className="text-[13px]" />}
                    >
                        Kirim Notifikasi
                    </Button>
                )}
            </PageHeader>

            {/* Desktop Tab Switcher */}
            {isAdmin && (
                <div className="hidden sm:flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 shrink-0 font-inter">
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
                    />
                </div>
            )}

            {/* Mobile Mark All Read Quick Banner if unread */}
            {activeTab === "inbox" && unreadCount > 0 && (
                <div className="sm:hidden flex items-center justify-between p-2.5 mb-3 bg-primary/10 border border-primary/20 rounded-xl text-[12px] font-inter">
                    <span className="text-text-primary font-medium">
                        Ada <strong>{unreadCount}</strong> notifikasi belum dibaca
                    </span>
                    <button
                        type="button"
                        onClick={handleMarkAllAsRead}
                        className="text-primary font-bold hover:underline cursor-pointer"
                    >
                        Tandai Dibaca
                    </button>
                </div>
            )}

            {/* MAIN CONTENT AREA */}
            {activeTab === "inbox" ? (
                /* INBOX NOTIFICATIONS (NATIVE CARD STACK) */
                <div className="w-full flex-1 min-h-0 flex flex-col justify-between gap-4 font-inter">
                    {notifications.data.length === 0 ? (
                        <Card className="p-8 text-center text-text-inactive font-inter flex-1 min-h-0 flex flex-col items-center justify-center">
                            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center text-text-inactive/40 mb-3">
                                <FiBell className="w-7 h-7" />
                            </div>
                            <p className="text-[14px] font-bold text-text-primary mb-1">
                                Kotak Masuk Kosong
                            </p>
                            <p className="text-[12px] text-text-secondary max-w-xs">
                                Saat ini tidak ada notifikasi atau pengumuman baru untuk Anda.
                            </p>
                        </Card>
                    ) : (
                        <div className="flex-1 min-h-0 overflow-y-auto pr-0.5 flex flex-col gap-2.5 sm:gap-3">
                            {notifications.data.map((n) => (
                                <div
                                    key={n.id}
                                    onClick={() => !n.is_read && handleMarkAsRead(n.id)}
                                    className={`p-3.5 sm:p-4 rounded-xl border transition-all duration-150 flex items-start gap-3 select-none ${
                                        n.is_read
                                            ? "bg-surface border-border opacity-85 hover:border-text-inactive/30"
                                            : "bg-primary/5 border-primary/30 ring-1 ring-primary/10 cursor-pointer hover:bg-primary/10 shadow-xs"
                                    }`}
                                >
                                    <div
                                        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
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
                                            <span className="text-[10.5px] sm:text-[11px] text-text-inactive shrink-0 whitespace-nowrap pt-0.5">
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

                    {notifications.last_page > 1 && (
                        <div className="pt-2 shrink-0 mt-auto font-inter">
                            <Pagination
                                currentPage={notifications.current_page}
                                totalPages={notifications.last_page}
                                totalItems={notifications.total}
                                perPage={notifications.per_page}
                                onPageChange={(page) =>
                                    router.get("/notifications", { page }, { preserveState: true })
                                }
                                compact
                            />
                        </div>
                    )}
                </div>
            ) : (
                /* SENT NOTIFICATIONS (MOBILE NATIVE CARD STACK + DESKTOP TABLE) */
                isAdmin &&
                sentNotifications && (
                    <div className="w-full flex-1 min-h-0 flex flex-col justify-between gap-3 font-inter">
                        {sentNotifications.data.length === 0 ? (
                            <Card className="p-8 text-center text-text-inactive font-inter flex-1 min-h-0 flex flex-col items-center justify-center">
                                <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center text-text-inactive/40 mb-3">
                                    <FiSend className="w-7 h-7" />
                                </div>
                                <p className="text-[14px] font-bold text-text-primary mb-1">
                                    Belum Ada Pengiriman
                                </p>
                                <p className="text-[12px] text-text-secondary max-w-xs">
                                    Anda belum pernah mengirim notifikasi siaran atau pengumuman.
                                </p>
                            </Card>
                        ) : (
                            <>
                                {/* Mobile-Native UI Card Stack (< sm) */}
                                <div className="sm:hidden flex-1 min-h-0 overflow-y-auto pr-0.5 flex flex-col gap-2.5">
                                    {sentNotifications.data.map((n) => (
                                        <div
                                            key={n.id}
                                            className="p-3.5 bg-surface border border-border rounded-xl shadow-xs space-y-2 select-none"
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

                                {/* Desktop Table View (>= sm) */}
                                <div className="hidden sm:flex flex-1 min-h-0 flex-col">
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
                                                        <Tooltip content="Hapus Pengumuman" position="left">
                                                            <button
                                                                onClick={() => handleDeleteNotification(n.id)}
                                                                className="text-danger hover:text-danger/80 p-1.5 cursor-pointer transition-transform hover:scale-110"
                                                                type="button"
                                                                aria-label="Hapus Notifikasi"
                                                            >
                                                                <FiTrash2 className="text-[14px]" />
                                                            </button>
                                                        </Tooltip>
                                                    </div>
                                                ),
                                                className: "text-right",
                                            },
                                        ]}
                                        data={sentNotifications.data}
                                        keyExtractor={(n) => n.id}
                                        emptyMessage="Anda belum pernah mengirim notifikasi."
                                        containerClassName="flex-1 min-h-0 overflow-auto bg-surface"
                                        dense
                                    />
                                </div>
                            </>
                        )}

                        {sentNotifications.last_page > 1 && (
                            <div className="pt-2 shrink-0 mt-auto font-inter">
                                <Pagination
                                    currentPage={sentNotifications.current_page}
                                    totalPages={sentNotifications.last_page}
                                    totalItems={sentNotifications.total}
                                    perPage={sentNotifications.per_page}
                                    onPageChange={(page) =>
                                        router.get(
                                            "/notifications",
                                            { sent_page: page },
                                            { preserveState: true }
                                        )
                                    }
                                    compact
                                />
                            </div>
                        )}
                    </div>
                )
            )}

            {/* MOBILE FLOATING ACTION BALLOON (FAB) FOR SEND NOTIFICATION */}
            {isAdmin && (
                <div className="sm:hidden fixed bottom-20 right-4 z-40">
                    <button
                        type="button"
                        onClick={() => setIsCreateOpen(true)}
                        className="flex items-center gap-2 px-4 py-3 bg-primary text-white rounded-full shadow-2xl hover:bg-primary-hover active:scale-95 transition-all font-inter font-bold text-[13px] cursor-pointer border border-white/20"
                        aria-label="Buat Notifikasi"
                    >
                        <FiPlus className="text-[16px] stroke-[2.5]" />
                        <span>Kirim Notifikasi</span>
                    </button>
                </div>
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
                                className="w-full border border-border rounded-lg p-3 text-[13px] text-text-primary bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
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
