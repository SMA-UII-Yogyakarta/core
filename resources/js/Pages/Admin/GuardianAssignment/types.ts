export interface Guardian {
    id: number;
    name: string;
    phone: string | null;
    address: string | null;
    user?: { email?: string; username?: string } | null;
    students?: Student[];
}

export interface Student {
    id: number;
    nis: string;
    nisn: string;
    name: string;
    class?: { id: number; name: string } | null;
    guardian_id?: number | null;
    guardian?: { id: number; name: string } | null;
}

export interface PageProps {
    guardians: Guardian[];
    unassignedStudents: Student[];
    allStudents: Student[];
    selectedGuardianId?: number | null;
    selectedGuardian?: Guardian | null;
    linkedStudents?: Student[];
}
