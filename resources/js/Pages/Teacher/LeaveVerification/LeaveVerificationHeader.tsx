import type { ReactNode } from "react";
import { PageHeader } from "@/Components";

interface LeaveVerificationHeaderProps {
    classNameStr: string;
    desktopAction?: ReactNode;
}

export default function LeaveVerificationHeader({
    classNameStr,
    desktopAction,
}: LeaveVerificationHeaderProps) {
    return (
        <PageHeader
            title="Verifikasi Izin Siswa"
            description={`Tinjau dan proses pengajuan izin / sakit siswa rombel ${classNameStr}.`}
            className="hidden lg:flex shrink-0 mb-4"
        >
            {desktopAction}
        </PageHeader>
    );
}
