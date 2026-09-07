import { router } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { Drawer, DrawerHeaderActions } from "@/Components";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import ClassForm from "./Forms/ClassForm";
import type { SchoolClass, Teacher } from "./types";

interface ClassDrawerFormProps {
    open: boolean;
    mode: "create" | "edit" | "detail" | null;
    schoolClass: SchoolClass | null;
    allTeachers: Teacher[];
    existingClasses?: SchoolClass[];
    onClose: () => void;
    onRequestDelete?: (entity: string, ids: number | number[], label: string) => void;
}

export default function ClassDrawerForm({
    open,
    mode,
    schoolClass,
    allTeachers,
    existingClasses = [],
    onClose,
    onRequestDelete,
}: ClassDrawerFormProps) {
    const isDesktop = useMediaQuery("(min-width: 640px)");
    const isCreate = mode === "create";
    const [prevOpen, setPrevOpen] = useState(open);
    const [isUnlocked, setIsUnlocked] = useState(() => isCreate || mode === "edit");

    if (open !== prevOpen) {
        setPrevOpen(open);
        if (open) {
            setIsUnlocked(isCreate || mode === "edit");
        }
    }

    useEffect(() => {
        if (open && !isDesktop) {
            onClose();
            if (isCreate) {
                router.visit("/master-data/create?tab=class");
            } else if (schoolClass?.id) {
                router.visit(`/master-data/classes/${schoolClass.id}/edit`);
            }
        }
    }, [open, isDesktop, isCreate, schoolClass, onClose]);

    const handleToggleUnlock = () => {
        if (isCreate) return;
        setIsUnlocked((prev) => !prev);
    };

    const handleClose = () => {
        setIsUnlocked(false);
        onClose();
    };

    const copyFields = schoolClass
        ? [
              { label: "Nama Kelas", value: schoolClass.name },
              { label: "Tingkat", value: `Kelas ${schoolClass.level}` },
              { label: "Tahun Ajaran", value: schoolClass.academic_year || "-" },
              { label: "Kapasitas", value: `${schoolClass.capacity || 36} Siswa` },
              {
                  label: "Wali Kelas",
                  value: schoolClass.teacher?.name || "Belum Ditentukan",
              },
          ]
        : [];

    const title = isCreate
        ? "Tambah Kelas / Rombel Baru"
        : isUnlocked
        ? "Edit Data Kelas"
        : "Detail Data Kelas";

    const description = isCreate
        ? "Tambahkan rombel belajar baru yang selaras dengan tahun ajaran dan standar Moodle."
        : undefined;

    const headerActions = (
        <DrawerHeaderActions
            mode={isCreate ? "create" : isUnlocked ? "edit" : "detail"}
            isUnlocked={isUnlocked}
            onToggleUnlock={handleToggleUnlock}
            hideUnlock={mode === "edit"}
            onDelete={
                !isCreate && schoolClass && onRequestDelete
                    ? () => {
                          handleClose();
                          onRequestDelete("classes", schoolClass.id, schoolClass.name);
                      }
                    : undefined
            }
            copyFields={copyFields}
            entityTitle={`Data Kelas - ${schoolClass?.name || "Baru"}`}
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
            submitFormId="class-drawer-form"
            onCancel={() => (isCreate ? handleClose() : setIsUnlocked(false))}
            submitLabel={isCreate ? "Simpan Kelas" : "Perbarui Kelas"}
            cancelLabel={isCreate ? "Batal" : "Batal Edit"}
            showFooter={isUnlocked}
        >
            <ClassForm
                formId="class-drawer-form"
                schoolClass={schoolClass}
                mode={mode || "create"}
                isUnlocked={isUnlocked}
                allTeachers={allTeachers}
                existingClasses={existingClasses}
                onSuccess={handleClose}
                onCancel={handleClose}
            />
        </Drawer>
    );
}
