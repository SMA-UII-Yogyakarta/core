import { useState } from "react";
import { Head, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Button, TabSwitcher, Input } from "@/Components/ui/index";
import { FaArrowLeft, FaFileExport } from "react-icons/fa";

const kelasOptions = [
    { value: "", label: "Semua Kelas" },
    { value: "X-A", label: "X-A" },
    { value: "X-B", label: "X-B" },
    { value: "XI-A", label: "XI-A" },
    { value: "XI-B", label: "XI-B" },
    { value: "XII-A", label: "XII-A" },
    { value: "XII-B", label: "XII-B" },
];

const bulanOptions = [
    { value: "01", label: "Januari" },
    { value: "02", label: "Februari" },
    { value: "03", label: "Maret" },
    { value: "04", label: "April" },
    { value: "05", label: "Mei" },
    { value: "06", label: "Juni" },
    { value: "07", label: "Juli" },
    { value: "08", label: "Agustus" },
    { value: "09", label: "September" },
    { value: "10", label: "Oktober" },
    { value: "11", label: "November" },
    { value: "12", label: "Desember" },
];

const tahunOptions = ["2025", "2026", "2027"];

export default function EksporLaporan() {
    const [activeTab, setActiveTab] = useState("harian");
    const [kelas, setKelas] = useState("");
    const [bulan, setBulan] = useState("06");
    const [tahun, setTahun] = useState("2025");
    const [tanggal, setTanggal] = useState(() => {
        const d = new Date();
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
    });

    const tabs = [
        { key: "harian", label: "Harian" },
        { key: "bulanan", label: "Bulanan" },
    ];

    function handleEkspor() {
        const params: Record<string, string> = {
            kelas,
            tipe: activeTab,
        };

        if (activeTab === "harian") {
            params.tanggal = tanggal;
        } else {
            params.bulan = bulan;
            params.tahun = tahun;
        }

        const searchParams = new URLSearchParams(params).toString();
        router.get(`/admin/ekspor-laporan/download?${searchParams}`);
    }

    return (
        <>
            <Head title="Ekspor Laporan" />

            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-4.5 bg-primary">
                <button
                    onClick={() => router.visit("/admin/dashboard")}
                    className="flex items-center justify-center w-5 h-5"
                    aria-label="Kembali"
                >
                    <FaArrowLeft className="w-3.5 h-3.5 text-white" />
                </button>
                <h1 className="text-sm font-bold text-white">Ekspor Laporan</h1>
            </div>

            {/* Content */}
            <div className="flex-1 bg-muted p-4">
                <div className="flex flex-col gap-5 max-w-85 mx-auto">
                    {/* TabSwitcher */}
                    <div className="flex justify-center">
                        <TabSwitcher
                            tabs={tabs}
                            activeTab={activeTab}
                            onChange={setActiveTab}
                        />
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col gap-3">
                        {/* Kelas - shared filter */}
                        <div className="w-full">
                            <label className="block text-xs font-medium text-text-secondary mb-1">
                                Kelas
                            </label>
                            <select
                                value={kelas}
                                onChange={(e) => setKelas(e.target.value)}
                                className="w-full h-10 px-3 bg-surface border border-border-input rounded-md text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            >
                                {kelasOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Harian filters */}
                        {activeTab === "harian" && (
                            <div className="w-full">
                                <label className="block text-xs font-medium text-text-secondary mb-1">
                                    Tanggal
                                </label>
                                <input
                                    type="date"
                                    value={tanggal}
                                    onChange={(e) => setTanggal(e.target.value)}
                                    className="w-full h-10 px-3 bg-surface border border-border-input rounded-md text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>
                        )}

                        {/* Bulanan filters */}
                        {activeTab === "bulanan" && (
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-text-secondary mb-1">
                                        Bulan
                                    </label>
                                    <select
                                        value={bulan}
                                        onChange={(e) =>
                                            setBulan(e.target.value)
                                        }
                                        className="w-full h-10 px-3 bg-surface border border-border-input rounded-md text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    >
                                        {bulanOptions.map((opt) => (
                                            <option
                                                key={opt.value}
                                                value={opt.value}
                                            >
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-text-secondary mb-1">
                                        Tahun
                                    </label>
                                    <select
                                        value={tahun}
                                        onChange={(e) =>
                                            setTahun(e.target.value)
                                        }
                                        className="w-full h-10 px-3 bg-surface border border-border-input rounded-md text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    >
                                        {tahunOptions.map((opt) => (
                                            <option key={opt} value={opt}>
                                                {opt}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Export Button */}
                    <Button
                        variant="import"
                        size="lg"
                        icon={FaFileExport}
                        className="w-full"
                        onClick={handleEkspor}
                    >
                        Ekspor
                    </Button>
                </div>
            </div>
        </>
    );
}

EksporLaporan.layout = (page: React.ReactNode) => (
    <AdminLayout title="Ekspor Laporan">{page}</AdminLayout>
);
