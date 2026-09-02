import { router, useForm, usePage } from "@inertiajs/react";
import { useState } from "react";
import { PageHeader, Card, Button, Modal, NativeSelect, Pagination, Input, Table, ConfirmDialog, TabSwitcher } from "@/Components";
import AppShell from "@/Layouts/AppShell";
import { FiBell, FiTrash2, FiSend, FiCheckSquare } from "react-icons/fi";
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

export default function Notifications({ notifications, sentNotifications, unreadCount }: NotificationsProps) {
    const { auth } = usePage().props as unknown as {
        auth: { user: { role?: string } | null };
    };
    const isAdmin = auth.user?.role === "admin";

    const [activeTab, setActiveTab] = useState<"inbox" | "sent">("inbox");
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const { data, setData, post, processing, errors, reset, setError, clearErrors } = useForm({
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

    const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: number | null }>({
        open: false,
        id: null,
    });

    const handleDeleteNotification = (id: number) => {
        setDeleteConfirm({ open: true, id });
    };

    const handleConfirmedDeleteNotification = () => {
        if (deleteConfirm.id) {
            router.delete(`/notifications/${deleteConfirm.id}`, { preserveScroll: true });
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
                return "Semua Orang";
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

    return (
        <AppShell title="Notifikasi Pengguna">
            <PageHeader
                title="Bilah Notifikasi"
                description="Pantau pengumuman sekolah serta pemberitahuan sistem absensi."
                className="shrink-0 mb-4"
            >
                {activeTab === "inbox" && unreadCount > 0 && (
                    <Button
                        variant="primary"
                        onClick={handleMarkAllAsRead}
                        className="h-10 px-4 font-bold text-[13px] shadow-xs rounded-xl shrink-0"
                        icon={<FiCheckSquare className="text-[14px]" />}
                    >
                        Tandai Semua Dibaca
                    </Button>
                )}
                {isAdmin && activeTab === "sent" && (
                    <Button
                        variant="primary"
                        onClick={() => setIsCreateOpen(true)}
                        className="h-10 px-4 font-bold text-[13px] shadow-xs rounded-xl shrink-0"
                        icon={<FiSend className="text-[14px]" />}
                    >
                        Kirim Notifikasi
                    </Button>
                )}
            </PageHeader>

            {isAdmin && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 shrink-0 font-inter">
                    <TabSwitcher
                        tabs={[
                            { key: "inbox", label: "Notifikasi Masuk", icon: <FiBell className="text-[14px]" />, count: unreadCount },
                            { key: "sent", label: "Kelola Pengiriman", icon: <FiSend className="text-[14px]" /> },
                        ]}
                        activeKey={activeTab}
                        onChange={(key) => setActiveTab(key as "inbox" | "sent")}
                        variant="segmented"
                    />
                </div>
            )}

            {activeTab === "inbox" ? (
                <div className="w-full flex-1 min-h-0 flex flex-col justify-between gap-4">
                    {notifications.data.length === 0 ? (
                        <Card className="p-8 text-center text-text-inactive font-inter flex-1 min-h-0 flex flex-col items-center justify-center">
                            <FiBell className="w-12 h-12 mx-auto mb-3 text-text-inactive/40" />
                            <p className="text-[14px] font-medium">Kotak masuk notifikasi Anda kosong.</p>
                        </Card>
                    ) : (
                        <div className="flex-1 min-h-0 overflow-y-auto pr-1 flex flex-col gap-3">
                            {notifications.data.map((n) => (
                                <div
                                    key={n.id}
                                    onClick={() => !n.is_read && handleMarkAsRead(n.id)}
                                    className={`p-4 border rounded-xl shadow-xs transition-all duration-150 flex items-start gap-4 select-none ${
                                        n.is_read
                                            ? "bg-surface border-border opacity-85"
                                            : "bg-primary/5 border-primary/20 ring-1 ring-primary/10 cursor-pointer hover:bg-primary/10"
                                    }`}
                                >
                                    <div
                                        className={`p-2.5 rounded-lg shrink-0 ${
                                            n.is_read ? "bg-muted text-text-inactive" : "bg-primary text-white"
                                        }`}
                                    >
                                        <FiBell className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0 space-y-1">
                                        <div className="flex items-center justify-between gap-4">
                                            <h3
                                                className={`text-[14px] font-inter truncate ${
                                                    n.is_read
                                                        ? "text-text-primary font-medium"
                                                        : "text-text-primary font-bold"
                                                }`}
                                            >
                                                {n.title}
                                            </h3>
                                            <span className="text-[11px] text-text-inactive shrink-0 whitespace-nowrap">
                                                {formatDate(n.created_at)}
                                            </span>
                                        </div>
                                        <p className="text-[13px] text-text-secondary font-inter leading-relaxed whitespace-pre-line break-words">
                                            {n.content}
                                        </p>
                                        <div className="flex items-center gap-2 pt-1">
                                            <span className="text-[10px] bg-muted px-2 py-0.5 rounded-md text-text-inactive font-semibold font-inter">
                                                Pengirim: {n.sender?.name ?? "Sistem"}
                                            </span>
                                            {!n.is_read && (
                                                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
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
                            />
                        </div>
                    )}
                </div>
            ) : (
                isAdmin &&
                sentNotifications && (
                    <div className="w-full flex-1 min-h-0 flex flex-col justify-between gap-3">
                        <Table
                            columns={[
                                {
                                    key: "title",
                                    header: "Judul",
                                    render: (n) => <span className="font-bold text-text-primary truncate max-w-[180px] block">{n.title}</span>,
                                },
                                {
                                    key: "target_group",
                                    header: "Penerima",
                                    render: (n) => (
                                        <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                                            {getGroupLabel(n.target_group)}
                                        </span>
                                    ),
                                },
                                {
                                    key: "content",
                                    header: "Isi Pengumuman",
                                    render: (n) => <span className="text-text-secondary truncate max-w-[280px] block">{n.content}</span>,
                                },
                                {
                                    key: "created_at",
                                    header: "Waktu Kirim",
                                    render: (n) => <span className="text-text-inactive">{formatDate(n.created_at)}</span>,
                                },
                                {
                                    key: "actions",
                                    header: <div className="text-right w-full">Aksi</div>,
                                    render: (n) => (
                                        <div className="flex justify-end">
                                            <button
                                                onClick={() => handleDeleteNotification(n.id)}
                                                className="text-danger hover:text-danger/80 p-1.5 cursor-pointer transition-transform hover:scale-110"
                                                type="button"
                                                title="Hapus Notifikasi"
                                            >
                                                <FiTrash2 className="text-[14px]" />
                                            </button>
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
                                            { preserveState: true },
                                        )
                                    }
                                />
                            </div>
                        )}
                    </div>
                )
            )}

                {/* Send Notification Modal */}
                {isCreateOpen && (
                    <Modal open={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Buat Notifikasi Baru">
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
                                    onChange={(e) => setData("target_group", e.target.value as "all" | "student" | "teacher" | "guardian")}
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
                                {errors.content && <p className="mt-1 text-[11px] text-danger">{errors.content}</p>}
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button variant="ghost" onClick={() => setIsCreateOpen(false)} type="button">
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
