import MonthlyTable from "./MonthlyTable";

interface StudentRecap {
    id: number;
    name: string;
    nis: string;
    masuk: number;
    izin: number;
    sakit: number;
    alpha: number;
}

interface SemesterTableProps {
    students: StudentRecap[];
}

export default function SemesterTable({ students }: SemesterTableProps) {
    return <MonthlyTable students={students} />;
}
