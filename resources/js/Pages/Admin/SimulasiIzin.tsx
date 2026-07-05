import { Head } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { FaExclamationCircle } from "react-icons/fa";

interface DataIzin {
    nama: string;
    status: string;
    keterangan: string;
    warning: string;
}

const mockData: DataIzin = {
    nama: "Nadia Salsabila",
    status: "MENUNGGU",
    keterangan: "Sakit (1 Hari) - Demam tinggi",
    warning: "Hanya Wali Kelas yang dapat memverifikasi",
};

export default function SimulasiIzin() {
    return (
        <AdminLayout title="Simulasi Izin">
            <Head title="Simulasi Izin" />

            <div className="max-w-[340px] mx-auto flex flex-col items-center gap-3">
                {/* Heading */}
                <h2 className="font-primary font-bold text-[11px] leading-[13px] text-text-inactive text-center">
                    SIMULASI TAB &quot;DATA IZIN&quot;
                </h2>

                {/* Card */}
                <div className="w-full bg-muted border border-dashed border-border rounded-xl p-3 flex flex-col gap-[5px]">
                    {/* Row: Nama + Badge */}
                    <div className="flex items-start justify-between w-full">
                        <span className="font-primary font-bold text-[13px] leading-[16px] text-text-primary">
                            {mockData.nama}
                        </span>
                        <span className="bg-border text-text-secondary font-bold text-[11px] leading-[13px] px-[10px] py-[5px] rounded-md">
                            {mockData.status}
                        </span>
                    </div>

                    {/* Keterangan */}
                    <p className="font-primary font-normal text-[10px] leading-[12px] text-text-muted">
                        {mockData.keterangan}
                    </p>

                    {/* Warning bar */}
                    <div className="flex items-center gap-1 bg-danger-light text-danger rounded p-[6px]">
                        <FaExclamationCircle className="w-[9px] h-[9px] shrink-0" />
                        <span className="font-primary font-bold text-[9px] leading-[11px]">
                            {mockData.warning}
                        </span>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
