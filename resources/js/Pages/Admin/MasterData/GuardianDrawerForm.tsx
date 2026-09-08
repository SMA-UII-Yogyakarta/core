import { router } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { Drawer, DrawerHeaderActions } from "@/Components";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import GuardianForm from "./Forms/GuardianForm";
import type { Guardian } from "./types";

interface GuardianDrawerFormProps {
    open: boolean;
    mode: "create" | "edit" | "detail" | null;
    guardian: Guardian | null;
    onClose: () => void;
    onRequestDelete?: (entity: string, ids: number | number[], label: string) => void;
}

export default function GuardianDrawerForm({
    open,
    mode,
    guardian,
    onClose,
    onRequestDelete,
}: GuardianDrawerFormProps) {
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
                router.visit("/master-data/create?tab=guardians");
            } else if (guardian?.id) {
                router.visit(`/master-data/guardians/${guardian.id}/${mode === "detail" ? "detail" : "edit"}`);
            }
        }
    }, [open, isDesktop, isCreate, guardian, mode]);

    const handleToggleUnlock = () => {
        if (isCreate) return;
        setIsUnlocked((prev) => !prev);
    };

    const handleClose = () => {
        setIsUnlocked(false);
        onClose();
    };

    const copyFields = guardian
        ? [
              { label: "Nama Lengkap", value: guardian.name },
              { label: "No. HP/WA", value: guardian.phone || "-" },
              { label: "Alamat", value: guardian.address || "-" },
              { label: "Email Akun", value: guardian.user?.email || "-" },
              {
                  label: "Siswa Terhubung",
                  value:
                      guardian.students?.map((s) => `${s.name} (${s.class?.name || "No Class"})`).join(", ") ||
                      "Belum Ada Siswa",
              },
          ]
        : [];

    const title = isCreate
        ? "Tambah Orang Tua / Wali Baru"
        : isUnlocked
          ? "Edit Data Orang Tua / Wali"
          : "Detail Data Orang Tua / Wali";

    const description = isCreate
        ? "Daftarkan orang tua / wali murid untuk pemantauan presensi dan izin siswa."
        : undefined;

    const headerActions = (
        <DrawerHeaderActions
            mode={isCreate ? "create" : isUnlocked ? "edit" : "detail"}
            isUnlocked={isUnlocked}
            onToggleUnlock={handleToggleUnlock}
            hideUnlock={mode === "edit"}
            onDelete={
                !isCreate && guardian && onRequestDelete
                    ? () => {
                          handleClose();
                          onRequestDelete("guardians", guardian.id, guardian.name);
                      }
                    : undefined
            }
            copyFields={copyFields}
            entityTitle={`Data Wali - ${guardian?.name || "Baru"}`}
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
            submitFormId="guardian-drawer-form"
            onCancel={() => (isCreate ? handleClose() : setIsUnlocked(false))}
            submitLabel={isCreate ? "Simpan Wali" : "Perbarui Wali"}
            cancelLabel={isCreate ? "Batal" : "Batal Edit"}
            showFooter={isUnlocked}
        >
            <GuardianForm
                formId="guardian-drawer-form"
                guardian={guardian}
                mode={mode || "create"}
                isUnlocked={isUnlocked}
                onSuccess={handleClose}
                onCancel={handleClose}
            />
        </Drawer>
    );
}
