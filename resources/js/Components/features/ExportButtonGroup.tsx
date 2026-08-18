import { useState } from "react";
import Button from "../ui/Button";
import Modal from "../common/Modal";

export interface ExportButtonGroupProps {
    onExportExcel?: () => void;
    onExportPdf?: () => void;
    onPrint?: () => void;
    loadingExcel?: boolean;
    loadingPdf?: boolean;
    disabled?: boolean;
    className?: string;
    label?: string;
    dusk?: string;
}

export default function ExportButtonGroup({
    onExportExcel,
    onExportPdf,
    onPrint,
    loadingExcel = false,
    loadingPdf = false,
    disabled = false,
    className = "",
    label = "Unduh Laporan",
    dusk = "export-btn-group",
}: ExportButtonGroupProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleExcel = () => {
        onExportExcel?.();
        setIsModalOpen(false);
    };

    const handlePdf = () => {
        onExportPdf?.();
        setIsModalOpen(false);
    };

    const handlePrint = () => {
        onPrint?.();
        setIsModalOpen(false);
    };

    return (
        <div
            className={`inline-flex items-center gap-2 ${className}`}
            dusk={dusk}
            data-testid={dusk}
        >
            <Button
                variant="primary"
                size="sm"
                onClick={() => setIsModalOpen(true)}
                disabled={disabled}
                dusk="btn-open-export-modal"
                data-testid="btn-open-export-modal"
                className="font-semibold shadow-sm"
            >
                <i className="fas fa-download mr-1.5" />
                {label}
            </Button>

            {/* Export Format Selection Modal */}
            <Modal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Pilih Format Unduhan"
                width="md"
            >
                <div className="space-y-3 font-inter">
                    <p className="text-[13px] text-text-secondary mb-4">
                        Pilih format dokumen laporan presensi yang ingin Anda unduh ke perangkat Anda:
                    </p>

                    {onExportExcel && (
                        <div className="flex items-center justify-between p-4 rounded-xl border border-border/80 bg-background/50 hover:bg-surface hover:border-success/40 transition-all group">
                            <div className="flex items-center gap-3.5">
                                <div className="w-10 h-10 rounded-lg bg-success-bg flex items-center justify-center text-success text-[20px] shrink-0">
                                    <i className="fas fa-file-excel" />
                                </div>
                                <div>
                                    <h4 className="text-[14px] font-bold text-text-primary group-hover:text-success transition-colors">
                                        Microsoft Excel (.xlsx)
                                    </h4>
                                    <p className="text-[12px] text-text-muted mt-0.5">
                                        Format tabel spreadsheet untuk olah data & analisa angka.
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="success"
                                size="sm"
                                onClick={handleExcel}
                                loading={loadingExcel}
                                disabled={disabled}
                                dusk="btn-export-excel"
                                data-testid="btn-export-excel"
                                className="shrink-0 ml-3"
                            >
                                <i className="fas fa-file-excel mr-1.5" />
                                Unduh Excel
                            </Button>
                        </div>
                    )}

                    {onExportPdf && (
                        <div className="flex items-center justify-between p-4 rounded-xl border border-border/80 bg-background/50 hover:bg-surface hover:border-danger/40 transition-all group">
                            <div className="flex items-center gap-3.5">
                                <div className="w-10 h-10 rounded-lg bg-danger-bg flex items-center justify-center text-danger text-[20px] shrink-0">
                                    <i className="fas fa-file-pdf" />
                                </div>
                                <div>
                                    <h4 className="text-[14px] font-bold text-text-primary group-hover:text-danger transition-colors">
                                        Dokumen PDF (.pdf)
                                    </h4>
                                    <p className="text-[12px] text-text-muted mt-0.5">
                                        Format siap cetak resmi dengan tata letak rapi & tanda tangan.
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={handlePdf}
                                loading={loadingPdf}
                                disabled={disabled}
                                dusk="btn-export-pdf"
                                data-testid="btn-export-pdf"
                                className="shrink-0 ml-3"
                            >
                                <i className="fas fa-file-pdf mr-1.5" />
                                Unduh PDF
                            </Button>
                        </div>
                    )}

                    {onPrint && (
                        <div className="flex items-center justify-between p-4 rounded-xl border border-border/80 bg-background/50 hover:bg-surface hover:border-primary/40 transition-all group">
                            <div className="flex items-center gap-3.5">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-[20px] shrink-0">
                                    <i className="fas fa-print" />
                                </div>
                                <div>
                                    <h4 className="text-[14px] font-bold text-text-primary group-hover:text-primary transition-colors">
                                        Cetak Dokumen
                                    </h4>
                                    <p className="text-[12px] text-text-muted mt-0.5">
                                        Buka dialog pencetakan printer browser secara langsung.
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handlePrint}
                                disabled={disabled}
                                dusk="btn-print"
                                data-testid="btn-print"
                                className="shrink-0 ml-3"
                            >
                                <i className="fas fa-print mr-1.5" />
                                Cetak
                            </Button>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
}
