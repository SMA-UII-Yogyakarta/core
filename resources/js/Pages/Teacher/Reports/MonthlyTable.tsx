import RecapTable from "./RecapTable";
import type { StudentRecap, Summary, DailyBreakdown } from "@/types/Report";

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
