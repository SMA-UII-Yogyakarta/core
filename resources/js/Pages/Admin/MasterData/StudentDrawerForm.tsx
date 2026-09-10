import { router } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { Drawer, DrawerHeaderActions } from "@/Components";
import { useLanguage } from "@/Contexts/LanguageContext";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import StudentForm from "./Forms/StudentForm";
import type { ClassOption, Student } from "./types";

interface StudentDrawerFormProps {
    open: boolean;
    mode: "create" | "edit" | "detail" | null;
    student: Student | null;
    classOptions: ClassOption[];
    allGuardians: { id: number; name: string }[];
    defaultClassId?: string;
    onClose: () => void;
    onRequestDelete?: (entity: string, ids: number | number[], label: string) => void;
}

export default function StudentDrawerForm({
    open,
    mode,
    student,
    classOptions,
    allGuardians,
    defaultClassId = "",
    onClose,
    onRequestDelete,
}: StudentDrawerFormProps) {
    const { t } = useLanguage();
    const isDesktop = useMediaQuery("(min-width: 640px)");
    const isCreate = mode === "create";
    const [prevOpen, setPrevOpen] = useState(open);
    const [prevMode, setPrevMode] = useState(mode);
    const [isUnlocked, setIsUnlocked] = useState(() => isCreate || mode === "edit");

    if (open !== prevOpen || mode !== prevMode) {
        setPrevOpen(open);
        setPrevMode(mode);
        if (open) {
            setIsUnlocked(isCreate || mode === "edit");
        }
    }

    useEffect(() => {
        if (open && !isDesktop) {
            if (isCreate) {
                router.visit("/master-data/create?tab=students");
            } else if (student?.id) {
                router.visit(`/master-data/students/${student.id}/${mode === "detail" ? "detail" : "edit"}`);
            }
        }
    }, [open, isDesktop, isCreate, student, mode]);

    const handleToggleUnlock = () => {
        if (isCreate) return;
        setIsUnlocked((prev) => !prev);
    };

    const handleClose = () => {
        setIsUnlocked(false);
        onClose();
    };

    const title = isCreate
        ? t("masterdata.studentAddTitle")
        : isUnlocked
          ? t("masterdata.studentEditTitle")
          : t("masterdata.studentDetailTitle");

    const description = isCreate
        ? t("masterdata.studentAddDesc")
        : isUnlocked
          ? t("masterdata.studentEditDesc")
          : t("masterdata.studentDetailDesc");

    const copyFields = student
        ? [
              { label: "NIS", value: student.nis },
              { label: "NISN", value: student.nisn },
              { label: "Nama Lengkap", value: student.name },
              { label: "Kelas", value: student.class?.name || "Belum Masuk Kelas" },
              { label: "Tahun Masuk", value: student.enrollment_year },
              { label: "Tanggal Lahir", value: student.birth_date },
              { label: "No. HP/WA", value: student.phone },
              {
                  label: "Wali Murid",
                  value: allGuardians.find((g) => g.id === student.guardian_id)?.name || "Belum Ada",
              },
              { label: "Alamat", value: student.address },
              { label: "Email", value: student.user?.email || "-" },
              { label: "Status", value: student.status || "Active" },
          ]
        : undefined;

    const headerActions = (
        <DrawerHeaderActions
            mode={isCreate ? "create" : isUnlocked ? "edit" : "detail"}
            isUnlocked={isUnlocked}
            onToggleUnlock={handleToggleUnlock}
            hideUnlock={mode === "edit"}
            onDelete={
                !isCreate && student && onRequestDelete
                    ? () => {
                          handleClose();
                          onRequestDelete("students", student.id, student.name);
                      }
                    : undefined
            }
            copyFields={copyFields}
            entityTitle={`Data Siswa - ${student?.name || "Baru"}`}
        />
    );

    return (
        <Drawer
            open={open}
            onClose={handleClose}
            title={title}
            description={description}
            headerActions={headerActions}
            width="md"
            submitFormId="student-drawer-form"
            onCancel={() => (isCreate ? handleClose() : setIsUnlocked(false))}
            submitLabel={isCreate ? t("masterdata.saveStudent") : t("masterdata.updateData")}
            cancelLabel={isCreate ? t("masterdata.cancel") : t("masterdata.cancelEdit")}
            showFooter={isUnlocked}
        >
            <StudentForm
                formId="student-drawer-form"
                student={student}
                mode={mode || "create"}
                isUnlocked={isUnlocked}
                classOptions={classOptions}
                allGuardians={allGuardians}
                defaultClassId={defaultClassId}
                onSuccess={handleClose}
                onCancel={handleClose}
            />
        </Drawer>
    );
}
