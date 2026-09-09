import { Drawer } from "@/Components";
import LeaveForm, { type StudentOption } from "./Forms/LeaveForm";

interface LeaveDrawerFormProps {
    open: boolean;
    onClose: () => void;
    students: StudentOption[];
    onSuccess?: () => void;
}

export default function LeaveDrawerForm({ open, onClose, students, onSuccess }: LeaveDrawerFormProps) {
    const handleFormSuccess = () => {
        if (onSuccess) {
            onSuccess();
        }
        onClose();
    };

    return (
        <Drawer
            open={open}
            onClose={onClose}
            title="Formulir Permohonan Izin"
            description="Ajukan permohonan izin ketidakhadiran anak Anda langsung ke Wali Kelas."
            width="lg"
            submitFormId="leave-drawer-form"
            submitLabel="Kirim Permohonan Izin"
            showFooter={true}
        >
            <div className="py-1">
                <LeaveForm
                    formId="leave-drawer-form"
                    students={students}
                    onSuccess={handleFormSuccess}
                    showSubmitButton={false}
                />
            </div>
        </Drawer>
    );
}
