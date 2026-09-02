import TabSwitcher from "@/Components/common/TabSwitcher";

export type LeaveTabKey = "pending" | "history" | "approved" | "rejected";

interface LeaveVerificationTabsProps {
    activeTab: LeaveTabKey;
    pendingCount: number;
    approvedCount: number;
    rejectedCount: number;
    totalHistoryCount: number;
    onChange: (key: LeaveTabKey) => void;
}

export default function LeaveVerificationTabs({
    activeTab,
    pendingCount,
    approvedCount,
    rejectedCount,
    totalHistoryCount,
    onChange,
}: LeaveVerificationTabsProps) {
    const tabs = [
        {
            key: "pending",
            label: "Menunggu Verifikasi",
            count: pendingCount,
        },
        {
            key: "history",
            label: "Semua Riwayat",
            count: totalHistoryCount,
        },
        {
            key: "approved",
            label: "Disetujui",
            count: approvedCount,
        },
        {
            key: "rejected",
            label: "Ditolak",
            count: rejectedCount,
        },
    ];

    return (
        <TabSwitcher
            tabs={tabs}
            activeKey={activeTab}
            onChange={(key) => onChange(key as LeaveTabKey)}
        />
    );
}
