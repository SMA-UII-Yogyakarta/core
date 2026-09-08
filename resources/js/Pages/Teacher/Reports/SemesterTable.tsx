import RecapTable from "./RecapTable";
import type { StudentRecap, Summary, MonthlyBreakdown } from "@/types/Report";

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
