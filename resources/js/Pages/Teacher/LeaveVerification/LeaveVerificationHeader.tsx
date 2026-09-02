import { PageHeader } from "@/Components";

interface LeaveVerificationHeaderProps {
    classNameStr: string;
    pendingCount: number;
    approvedCount: number;
    rejectedCount: number;
}

export default function LeaveVerificationHeader({
    classNameStr,
    pendingCount,
    approvedCount,
    rejectedCount,
}: LeaveVerificationHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <PageHeader
                title="Verifikasi Izin Siswa"
                description={`Tinjau dan proses pengajuan izin / sakit siswa rombel ${classNameStr}.`}
            />

            <div className="flex items-center gap-2 self-start sm:self-auto">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[13px] font-semibold">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    {pendingCount} Menunggu
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-status-success/10 text-status-success border border-status-success/20 text-[13px] font-medium">
                    {approvedCount} Disetujui
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-status-danger/10 text-status-danger border border-status-danger/20 text-[13px] font-medium">
                    {rejectedCount} Ditolak
                </div>
            </div>
        </div>
    );
}
