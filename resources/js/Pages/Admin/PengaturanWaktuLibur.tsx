import { useState, useEffect } from "react";
import { Head } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import {
    Button,
    Input,
    Toggle,
    Table,
    EmptyState,
    LoadingSkeleton,
} from "@/Components/ui/index";
import { FaPlus, FaTrash, FaSave } from "react-icons/fa";

interface Libur {
    id: number;
    tanggal: string;
    keterangan: string;
}

const mockJamPresensi = {
    jamMasuk: "07:00",
    jamPulang: "15:30",
    batasTelat: 15,
};

const mockLibur: Libur[] = [
    { id: 1, tanggal: "2025-01-01", keterangan: "Tahun Baru" },
    { id: 2, tanggal: "2025-03-29", keterangan: "Hari Raya Nyepi" },
    { id: 3, tanggal: "2025-03-31", keterangan: "Idul Fitri" },
    { id: 4, tanggal: "2025-05-01", keterangan: "Hari Buruh" },
];

const days = [
    { key: "senin", label: "Senin" },
    { key: "selasa", label: "Selasa" },
    { key: "rabu", label: "Rabu" },
    { key: "kamis", label: "Kamis" },
    { key: "jumat", label: "Jumat" },
];

export default function PengaturanWaktuLibur() {
    const [jamMasuk, setJamMasuk] = useState(mockJamPresensi.jamMasuk);
    const [jamPulang, setJamPulang] = useState(mockJamPresensi.jamPulang);
    const [batasTelat, setBatasTelat] = useState(mockJamPresensi.batasTelat);
    const [libur, setLibur] = useState<Libur[]>([]);
    const [hariEfektif, setHariEfektif] = useState<Record<string, boolean>>({
        senin: true,
        selasa: true,
        rabu: true,
        kamis: true,
        jumat: true,
    });
    const [liburBaruTanggal, setLiburBaruTanggal] = useState("");
    const [liburBaruKet, setLiburBaruKet] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [savingJam, setSavingJam] = useState(false);

    useEffect(() => {
        simulateFetch();
    }, []);

    function simulateFetch() {
        setLoading(true);
        setError(null);

        setTimeout(() => {
            setLibur(mockLibur);
            setLoading(false);
        }, 500);
    }

    function handleSimpanJam() {
        setSavingJam(true);
        setTimeout(() => {
            setSavingJam(false);
            alert("Pengaturan jam presensi berhasil disimpan");
        }, 600);
    }

    function handleTambahLibur() {
        if (!liburBaruTanggal || !liburBaruKet) {
            alert("Lengkapi tanggal dan keterangan");
            return;
        }
        const newLibur: Libur = {
            id: libur.length + 1,
            tanggal: liburBaruTanggal,
            keterangan: liburBaruKet,
        };
        setLibur([...libur, newLibur]);
        setLiburBaruTanggal("");
        setLiburBaruKet("");
    }

    function handleHapusLibur(id: number) {
        setLibur(libur.filter((l) => l.id !== id));
    }

    function formatDate(dateStr: string) {
        const d = new Date(dateStr + "T00:00:00");
        return d.toLocaleDateString("id-ID", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    }

    const liburColumns = [
        { key: "no", label: "No" },
        {
            key: "tanggal",
            label: "Tanggal",
            render: (value: string) => formatDate(value),
        },
        { key: "keterangan", label: "Keterangan" },
        {
            key: "aksi",
            label: "Aksi",
            render: (_: unknown, row: Libur) => (
                <Button
                    variant="delete"
                    size="sm"
                    icon={FaTrash}
                    onClick={() => handleHapusLibur(row.id)}
                >
                    Hapus
                </Button>
            ),
        },
    ];

    const liburData = libur.map((l, idx) => ({ ...l, no: idx + 1 }));

    return (
        <AdminLayout title="Pengaturan Waktu & Libur">
            <Head title="Pengaturan Waktu & Libur" />

            <div className="space-y-8">
                {/* Section 1: Jam Presensi */}
                <section className="bg-surface border border-border rounded-lg p-4 md:p-6">
                    <h2 className="text-sm font-bold text-text-primary mb-4">
                        Jam Presensi
                    </h2>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="w-full md:w-48">
                            <Input
                                label="Jam Masuk"
                                type="time"
                                value={jamMasuk}
                                onChange={(e) => setJamMasuk(e.target.value)}
                            />
                        </div>
                        <div className="w-full md:w-48">
                            <Input
                                label="Jam Pulang"
                                type="time"
                                value={jamPulang}
                                onChange={(e) => setJamPulang(e.target.value)}
                            />
                        </div>
                        <div className="w-full md:w-48">
                            <Input
                                label="Batas Telat (menit)"
                                type="number"
                                min={0}
                                value={batasTelat}
                                onChange={(e) =>
                                    setBatasTelat(Number(e.target.value))
                                }
                            />
                        </div>
                        <div className="w-full md:w-auto md:flex md:items-end">
                            <Button
                                variant="primary"
                                size="md"
                                icon={FaSave}
                                loading={savingJam}
                                onClick={handleSimpanJam}
                            >
                                Simpan
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Section 2: Hari Libur */}
                <section className="bg-surface border border-border rounded-lg p-4 md:p-6">
                    <h2 className="text-sm font-bold text-text-primary mb-4">
                        Hari Libur / Tanggal Merah
                    </h2>

                    {loading ? (
                        <LoadingSkeleton />
                    ) : error ? (
                        <div className="text-danger text-sm">{error}</div>
                    ) : libur.length === 0 ? (
                        <EmptyState title="Belum ada hari libur" />
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden md:block">
                                <div className="overflow-x-auto rounded-lg border border-border mb-4">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-background border-b border-border">
                                                {liburColumns.map((col) => (
                                                    <th
                                                        key={col.key}
                                                        className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider"
                                                    >
                                                        {col.label}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="bg-surface divide-y divide-border">
                                            {liburData.map((row) => (
                                                <tr
                                                    key={row.id}
                                                    className="hover:bg-background/50 transition-colors"
                                                >
                                                    {liburColumns.map((col) => (
                                                        <td
                                                            key={col.key}
                                                            className="px-4 py-3 text-text-primary"
                                                        >
                                                            {col.render
                                                                ? col.render(
                                                                      (
                                                                          row as any
                                                                      )[
                                                                          col
                                                                              .key
                                                                      ],
                                                                      row,
                                                                  )
                                                                : ((row as any)[
                                                                      col.key
                                                                  ] ?? "-")}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Mobile Card List */}
                            <div className="md:hidden space-y-3 mb-4">
                                {libur.map((l) => (
                                    <div
                                        key={l.id}
                                        className="bg-background border border-border rounded-lg p-3 flex items-center justify-between"
                                    >
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-xs font-semibold text-text-primary">
                                                {formatDate(l.tanggal)}
                                            </span>
                                            <span className="text-xs text-text-muted">
                                                {l.keterangan}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() =>
                                                handleHapusLibur(l.id)
                                            }
                                            className="text-danger hover:text-danger/80 p-1"
                                            aria-label="Hapus"
                                        >
                                            <FaTrash className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* Tambah Hari Libur */}
                    <div className="border-t border-border pt-4 mt-4">
                        <h3 className="text-xs font-semibold text-text-secondary mb-3">
                            Tambah Hari Libur
                        </h3>
                        <div className="flex flex-col md:flex-row gap-3">
                            <div className="w-full md:w-48">
                                <Input
                                    label="Tanggal"
                                    type="date"
                                    value={liburBaruTanggal}
                                    onChange={(e) =>
                                        setLiburBaruTanggal(e.target.value)
                                    }
                                />
                            </div>
                            <div className="flex-1">
                                <Input
                                    label="Keterangan"
                                    placeholder="Nama hari libur..."
                                    value={liburBaruKet}
                                    onChange={(e) =>
                                        setLiburBaruKet(e.target.value)
                                    }
                                />
                            </div>
                            <div className="w-full md:w-auto md:flex md:items-end">
                                <Button
                                    variant="add"
                                    size="md"
                                    icon={FaPlus}
                                    onClick={handleTambahLibur}
                                >
                                    Tambah Hari Libur
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 3: Hari Efektif */}
                <section className="bg-surface border border-border rounded-lg p-4 md:p-6">
                    <h2 className="text-sm font-bold text-text-primary mb-4">
                        Hari Efektif
                    </h2>
                    <p className="text-xs text-text-muted mb-4">
                        Atur hari-hari efektif presensi dalam satu minggu
                    </p>
                    <div className="flex flex-col md:flex-row gap-3">
                        {days.map((day) => (
                            <div
                                key={day.key}
                                className="flex items-center justify-between md:flex-col md:items-center md:justify-center gap-2 p-3 bg-background border border-border rounded-lg md:w-24"
                            >
                                <span className="text-xs font-medium text-text-primary">
                                    {day.label}
                                </span>
                                <Toggle
                                    variant="checkbox"
                                    checked={hariEfektif[day.key]}
                                    onChange={(checked) =>
                                        setHariEfektif((prev) => ({
                                            ...prev,
                                            [day.key]: checked,
                                        }))
                                    }
                                />
                            </div>
                        ))}
                    </div>
                    <div className="mt-4">
                        <Button variant="primary" size="md" icon={FaSave}>
                            Simpan Pengaturan
                        </Button>
                    </div>
                </section>
            </div>
        </AdminLayout>
    );
}
