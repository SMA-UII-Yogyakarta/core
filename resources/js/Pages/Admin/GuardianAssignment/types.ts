export interface Guardian {
    id: number;
    name: string;
    phone: string | null;
    address: string | null;
    user?: { email?: string; username?: string } | null;
}

export interface Student {
    id: number;
    nis: string;
    nisn: string;
    name: string;
    class?: { id: number; name: string } | null;
}

export interface PageProps {
    guardians: Guardian[];
    selectedGuardianId: number | null;
    selectedGuardian: Guardian | null;
    linkedStudents: Student[];
    unassignedStudents: Student[];
    allStudents: Student[];
}