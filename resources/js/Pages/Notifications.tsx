import { router, useForm, usePage } from "@inertiajs/react";
import { useState } from "react";
import { PageHeader, Card, Button, Modal, NativeSelect, StickyContainer, Pagination } from "@/Components";
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

    const handleDeleteNotification = (id: number) => {
        if (confirm("Apakah Anda yakin ingin menghapus notifikasi ini?")) {
            router.delete(`/notifications/${id}`, { preserveScroll: true });
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
            <div className="space-y-6">
                <PageHeader
                    title="Bilah Notifikasi"
                    description="Pantau pengumuman sekolah serta pemberitahuan sistem absensi."
                >
                    {isAdmin && activeTab === "sent" && (
                        <Button
                            variant="primary"
                            onClick={() => setIsCreateOpen(true)}
                            icon={<FiSend className="text-[14px]" />}
                        >
                            Kirim Notifikasi
                        </Button>
                    )}
                </PageHeader>

                {isAdmin && (
                    <StickyContainer>
                        <div className="flex gap-8 border-b border-border select-none">
                            <button
                                type="button"
                                onClick={() => setActiveTab("inbox")}
                                className={`pb-2 text-[14px] font-semibold transition-colors border-b-2 -mb-px inline-flex items-center gap-2 cursor-pointer ${
                                    activeTab === "inbox"
                                        ? "text-primary border-primary font-bold"
                                        : "text-text-inactive border-transparent hover:text-text-primary"
                                }`}
                            >
                                <FiBell className="text-[15px]" />
                                <span>Notifikasi Masuk ({unreadCount})</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab("sent")}
                                className={`pb-2 text-[14px] font-semibold transition-colors border-b-2 -mb-px inline-flex items-center gap-2 cursor-pointer ${
                                    activeTab === "sent"
                                        ? "text-primary border-primary font-bold"
                                        : "text-text-inactive border-transparent hover:text-text-primary"
                                }`}
                            >
                                <FiSend className="text-[15px]" />
                                <span>Kelola Pengiriman</span>
                            </button>
                        </div>
                    </StickyContainer>
                )}

                {activeTab === "inbox" ? (
                    <div className="max-w-4xl space-y-4">
                        {unreadCount > 0 && (
                            <div className="flex justify-end">
                                <Button
                                    variant="outline"
                                    onClick={handleMarkAllAsRead}
                                    icon={<FiCheckSquare className="text-[14px]" />}
                                >
                                    Tandai Semua Dibaca
                                </Button>
                            </div>
                        )}

                        {notifications.data.length === 0 ? (
                            <Card className="p-8 text-center text-text-inactive font-inter">
                                <FiBell className="w-12 h-12 mx-auto mb-3 text-text-inactive/40" />
                                <p className="text-[14px] font-medium">Kotak masuk notifikasi Anda kosong.</p>
                            </Card>
                        ) : (
                            <div className="space-y-3">
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

                                {notifications.last_page > 1 && (
                                    <div className="pt-4">
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
                        )}
                    </div>
                ) : (
                    isAdmin &&
                    sentNotifications && (
                        <div className="max-w-5xl space-y-4">
                            <Card className="overflow-hidden">
                                <div className="p-6">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-border">
                                                    <th className="pb-3 text-[12px] font-bold text-text-inactive uppercase tracking-wider font-inter">
                                                        Judul
                                                    </th>
                                                    <th className="pb-3 text-[12px] font-bold text-text-inactive uppercase tracking-wider font-inter">
                                                        Penerima
                                                    </th>
                                                    <th className="pb-3 text-[12px] font-bold text-text-inactive uppercase tracking-wider font-inter">
                                                        Isi Pengumuman
                                                    </th>
                                                    <th className="pb-3 text-[12px] font-bold text-text-inactive uppercase tracking-wider font-inter">
                                                        Waktu Kirim
                                                    </th>
                                                    <th className="pb-3 text-[12px] font-bold text-text-inactive uppercase tracking-wider font-inter text-right">
                                                        Aksi
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border/60">
                                                {sentNotifications.data.length === 0 ? (
                                                    <tr>
                                                        <td
                                                            colSpan={5}
                                                            className="py-8 text-center text-text-inactive text-[13px] font-inter"
                                                        >
                                                            Anda belum pernah mengirim notifikasi.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    sentNotifications.data.map((n) => (
                                                        <tr key={n.id} className="hover:bg-muted/40 transition-colors">
                                                            <td className="py-3.5 pr-4 text-[13px] text-text-primary font-bold font-inter truncate max-w-[180px]">
                                                                {n.title}
                                                            </td>
                                                            <td className="py-3.5 pr-4 text-[13px]">
                                                                <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-[11px] font-bold font-inter">
                                                                    {getGroupLabel(n.target_group)}
                                                                </span>
                                                            </td>
                                                            <td className="py-3.5 pr-4 text-[13px] text-text-secondary font-inter truncate max-w-[280px]">
                                                                {n.content}
                                                            </td>
                                                            <td className="py-3.5 pr-4 text-[13px] text-text-inactive font-inter">
                                                                {formatDate(n.created_at)}
                                                            </td>
                                                            <td className="py-3.5 text-right">
                                                                <button
                                                                    onClick={() => handleDeleteNotification(n.id)}
                                                                    className="text-danger hover:text-danger/80 p-1.5 cursor-pointer transition-transform hover:scale-110"
                                                                    type="button"
                                                                >
                                                                    <FiTrash2 className="text-[14px]" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {sentNotifications.last_page > 1 && (
                                        <div className="pt-4 border-t border-border/40 mt-4">
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
                            </Card>
                        </div>
                    )
                )}

                {/* Send Notification Modal */}
                {isCreateOpen && (
                    <Modal open={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Buat Notifikasi Baru">
                        <form onSubmit={handleCreateNotification} className="space-y-4 font-inter">
                            <div>
                                <label className="block text-[13px] font-bold text-text-primary mb-1">
                                    Judul Notifikasi
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.title}
                                    onChange={(e) => setData("title", e.target.value)}
                                    placeholder="Masukkan judul pengumuman..."
                                    className="w-full border border-border rounded-lg px-3 py-2 text-[13px] text-text-primary bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                                {errors.title && <p className="mt-1 text-[11px] text-danger">{errors.title}</p>}
                            </div>

                            <div>
                                <label className="block text-[13px] font-bold text-text-primary mb-1">
                                    Target Penerima
                                </label>
                                <NativeSelect
                                    value={data.target_group}
                                    onChange={(e) =>
                                        setData(
                                            "target_group",
                                            e.target.value as "all" | "student" | "teacher" | "guardian",
                                        )
                                    }
                                    className="w-full text-[13px] py-2 font-normal"
                                >
                                    <option value="all">Semua Orang</option>
                                    <option value="student">Siswa</option>
                                    <option value="teacher">Guru</option>
                                    <option value="guardian">Wali Murid</option>
                                </NativeSelect>
                                {errors.target_group && (
                                    <p className="mt-1 text-[11px] text-danger">{errors.target_group}</p>
                                )}
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
                                    placeholder="Tuliskan detail informasi di sini..."
                                    className="w-full border border-border rounded-lg px-3 py-2 text-[13px] text-text-primary bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                                />
                                {errors.content && <p className="mt-1 text-[11px] text-danger">{errors.content}</p>}
                            </div>

                            <div className="flex justify-end gap-3 pt-3 border-t border-border">
                                <Button variant="outline" type="button" onClick={() => setIsCreateOpen(false)}>
                                    Batal
                                </Button>
                                <Button
                                    variant="primary"
                                    type="submit"
                                    disabled={processing}
                                    icon={<FiSend className="text-[14px]" />}
                                >
                                    Kirim Sekarang
                                </Button>
                            </div>
                        </form>
                    </Modal>
                )}
            </div>
        </AppShell>
    );
}
