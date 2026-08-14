import Button from "../ui/Button";

export interface ExportButtonGroupProps {
    onExportExcel?: () => void;
    onExportPdf?: () => void;
    onPrint?: () => void;
    loadingExcel?: boolean;
    loadingPdf?: boolean;
    disabled?: boolean;
    className?: string;
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
    dusk = "export-btn-group",
}: ExportButtonGroupProps) {
    return (
        <div
            className={`flex flex-wrap items-center gap-2.5 ${className}`}
            dusk={dusk}
            data-testid={dusk}
        >
            {onExportExcel && (
                <Button
                    variant="success"
                    size="sm"
                    onClick={onExportExcel}
                    loading={loadingExcel}
                    disabled={disabled}
                    dusk="btn-export-excel"
                    data-testid="btn-export-excel"
                >
                    <i className="fas fa-file-excel mr-1.5" />
                    Unduh Excel
                </Button>
            )}

            {onExportPdf && (
                <Button
                    variant="danger"
                    size="sm"
                    onClick={onExportPdf}
                    loading={loadingPdf}
                    disabled={disabled}
                    dusk="btn-export-pdf"
                    data-testid="btn-export-pdf"
                >
                    <i className="fas fa-file-pdf mr-1.5" />
                    Unduh PDF
                </Button>
            )}

            {onPrint && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onPrint}
                    disabled={disabled}
                    dusk="btn-print"
                    data-testid="btn-print"
                >
                    <i className="fas fa-print mr-1.5" />
                    Cetak
                </Button>
            )}
        </div>
    );
}
