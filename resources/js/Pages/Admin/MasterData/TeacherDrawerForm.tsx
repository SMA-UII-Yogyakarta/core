import { router } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { Drawer, DrawerHeaderActions } from "@/Components";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import TeacherForm from "./Forms/TeacherForm";
import type { Teacher } from "./types";

interface TeacherDrawerFormProps {
    open: boolean;
    mode: "create" | "edit" | "detail" | null;
    teacher: Teacher | null;
    onClose: () => void;
    onRequestDelete?: (entity: string, ids: number | number[], label: string) => void;
}

export default function TeacherDrawerForm({
    open,
    mode,
    teacher,
    onClose,
    onRequestDelete,
}: TeacherDrawerFormProps) {
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
                router.visit("/master-data/create?tab=teachers");
            } else if (teacher?.id) {
                router.visit(`/master-data/teachers/${teacher.id}/${mode === "detail" ? "detail" : "edit"}`);
            }
        }
    }, [open, isDesktop, isCreate, teacher, mode]);

    const handleToggleUnlock = () => {
        if (isCreate) return;
        setIsUnlocked((prev) => !prev);
    };

    const handleClose = () => {
        setIsUnlocked(false);
        onClose();
    };

    const isDuty = Array.isArray(teacher?.teacher_type)
        ? teacher.teacher_type.some((t) => String(t).includes("duty") || String(t).includes("piket"))
        : String(teacher?.teacher_type || "").includes("duty") || String(teacher?.teacher_type || "").includes("piket");

    const isHomeroom = Array.isArray(teacher?.teacher_type)
        ? teacher.teacher_type.some((t) => String(t).includes("homeroom") || String(t).includes("wali"))
        : String(teacher?.teacher_type || "").includes("homeroom") || String(teacher?.teacher_type || "").includes("wali");

    const copyFields = teacher
        ? [
              { label: "Kode Guru / NIP", value: teacher.teacher_code },
              { label: "Nama Lengkap", value: teacher.name },
              {
                  label: "Tipe Penugasan",
                  value:
                      isDuty && isHomeroom
                          ? "Guru Piket & Wali Kelas"
                          : isHomeroom
                          ? "Wali Kelas"
                          : "Guru Piket",
              },
              { label: "Email", value: teacher.user?.email || "-" },
              {
                  label: "Kelas Binaan",
                  value: teacher.school_classes?.map((c) => c.name).join(", ") || "-",
              },
          ]
        : [];

    const title = isCreate
        ? "Tambah Guru Baru"
        : isUnlocked
        ? "Edit Data Guru"
        : "Detail Data Guru";

    const description = isCreate
        ? "Daftarkan data guru dan tentukan perannya (Wali Kelas / Guru Piket). Akun otomatis terintegrasi SSO."
        : undefined;

    const headerActions = (
        <DrawerHeaderActions
            mode={isCreate ? "create" : isUnlocked ? "edit" : "detail"}
            isUnlocked={isUnlocked}
            onToggleUnlock={handleToggleUnlock}
            hideUnlock={mode === "edit"}
            onDelete={
                !isCreate && teacher && onRequestDelete
                    ? () => {
                          handleClose();
                          onRequestDelete("teachers", teacher.id, teacher.name);
                      }
                    : undefined
            }
            copyFields={copyFields}
            entityTitle={`Data Guru - ${teacher?.name || "Baru"}`}
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
            submitFormId="teacher-drawer-form"
            onCancel={() => (isCreate ? handleClose() : setIsUnlocked(false))}
            submitLabel={isCreate ? "Simpan Guru" : "Perbarui Guru"}
            cancelLabel={isCreate ? "Batal" : "Batal Edit"}
            showFooter={isUnlocked}
        >
            <TeacherForm
                formId="teacher-drawer-form"
                teacher={teacher}
                mode={mode || "create"}
                isUnlocked={isUnlocked}
                onSuccess={handleClose}
                onCancel={handleClose}
            />
        </Drawer>
    );
}
