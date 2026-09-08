import type { DailyBreakdown, StudentRecap, Summary } from "@/types/Report";
import RecapTable from "./RecapTable";

export interface MonthlyTableProps {
    students: StudentRecap[];
    summary?: Summary;
    chartData?: DailyBreakdown[];
    month: number;
    year: number;
    onExportPdf?: () => void;
    onExportExcel?: () => void;
}

export default function MonthlyTable(props: MonthlyTableProps) {
    return <RecapTable mode="monthly" {...props} />;
}
