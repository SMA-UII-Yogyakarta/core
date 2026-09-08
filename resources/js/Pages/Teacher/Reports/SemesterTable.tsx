import type { MonthlyBreakdown, StudentRecap, Summary } from "@/types/Report";
import RecapTable from "./RecapTable";

export interface SemesterTableProps {
    students: StudentRecap[];
    summary?: Summary;
    chartData?: MonthlyBreakdown[];
    semester: string;
    year: number;
    onExportPdf?: () => void;
    onExportExcel?: () => void;
}

export default function SemesterTable(props: SemesterTableProps) {
    return <RecapTable mode="semester" {...props} />;
}
