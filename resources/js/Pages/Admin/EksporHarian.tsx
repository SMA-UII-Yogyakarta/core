import { useState } from "react";
import { Head, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Button, TabSwitcher, Input } from "@/Components/ui/index";
import {
    FaArrowLeft,
    FaDownload,
    FaFileAlt,
    FaCheck,
    FaTimes,
    FaClock,
} from "react-icons/fa";

const kelasOptions = [
    { value: "", label: "Semua Kelas" },
    { value: "X-A", label: "X-A" },
    { value: "X-B", label: "X-B" },
    { value: "XI-A", label: "XI-A" },
    { value: "XI-B", label: "XI-B" },
    { value: "XII-A", label: "XII-A" },
    { value: "XII-B", label: "XII-B" },
];

const previewData = {
    totalSiswa: 28,
    hadir: 24,
    sakit: 2,
    izin: 1,
    alpha: 1,
};

export default function EksporHarian() {
    const [tanggal, setTanggal] = useState(() => {
        const d = new Date();
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
    });
    const [kelas, setKelas] = useState("");

    function handleEkspor() {
        const params = new URLSearchParams({
            tanggal,
            kelas,
        }).toString();
        router.get(`/admin/ekspor-harian/download?${params}`);
    }

    return (
        <>
            <Head title="Ekspor Harian" />

            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-4.5 bg-primary">
                <button
                    onClick={() => router.visit("/admin/dashboard")}
                    className="flex items-center justify-center w-5 h-5"
                    aria-label="Kembali"
                >
                    <FaArrowLeft className="w-3.5 h-3.5 text-white" />
                </button>
                <h1 className="text-sm font-bold text-white">Ekspor Harian</h1>
            </div>

            {/* Content */}
            <div className="flex-1 bg-muted p-4">
                <div className="flex flex-col gap-5 max-w-85 mx-auto">
                    {/* TabSwitcher */}
                    <div className="flex justify-center">
                        <TabSwitcher
                            tabs={[
                                { key: "harian", label: "Harian" },
                                { key: "bulanan", label: "Bulanan" },
                            ]}
                            activeTab="harian"
                            onChange={() => {}}
                        />
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col gap-3">
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
                    </div>

                    {/* Export Button */}
                    <Button
                        variant="import"
                        size="lg"
                        icon={FaDownload}
                        className="w-full"
                        onClick={handleEkspor}
                    >
                        Ekspor
                    </Button>

                    {/* Preview Card */}
                    <div className="bg-surface border border-border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <FaFileAlt className="w-4 h-4 text-text-secondary" />
                            <h3 className="text-sm font-semibold text-text-primary">
                                Pratinjau Data
                            </h3>
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between py-1.5 border-b border-border">
                                <span className="text-xs text-text-secondary">
                                    Total Siswa
                                </span>
                                <span className="text-xs font-semibold text-text-primary">
                                    {previewData.totalSiswa}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-1.5 border-b border-border">
                                <span className="flex items-center gap-1.5 text-xs text-text-secondary">
                                    <FaCheck className="w-3 h-3 text-success" />
                                    Hadir
                                </span>
                                <span className="text-xs font-semibold text-success">
                                    {previewData.hadir}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-1.5 border-b border-border">
                                <span className="flex items-center gap-1.5 text-xs text-text-secondary">
                                    <FaClock className="w-3 h-3 text-amber-500" />
                                    Sakit
                                </span>
                                <span className="text-xs font-semibold text-amber-500">
                                    {previewData.sakit}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-1.5 border-b border-border">
                                <span className="flex items-center gap-1.5 text-xs text-text-secondary">
                                    <FaFileAlt className="w-3 h-3 text-primary" />
                                    Izin
                                </span>
                                <span className="text-xs font-semibold text-primary">
                                    {previewData.izin}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-1.5">
                                <span className="flex items-center gap-1.5 text-xs text-text-secondary">
                                    <FaTimes className="w-3 h-3 text-danger" />
                                    Alpha
                                </span>
                                <span className="text-xs font-semibold text-danger">
                                    {previewData.alpha}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

EksporHarian.layout = (page: React.ReactNode) => (
    <AdminLayout title="Ekspor Harian">{page}</AdminLayout>
);
