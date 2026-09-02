import { useForm } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { Drawer, DrawerHeaderActions, Input, SelectInput, Button } from "@/Components";
import { teacherSchema } from "@/schemas";
import { validateForm } from "@/utils/zodHelper";
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
    const isCreate = mode === "create";
    const [unlockedByUser, setUnlockedByUser] = useState(false);
    const isUnlocked = isCreate || mode === "edit" || unlockedByUser;

    const handleClose = () => {
        setUnlockedByUser(false);
        onClose();
    };

    const {
        data,
        setData,
        post,
        patch,
        processing,
        reset,
        errors,
        clearErrors,
        setError,
    } = useForm({
        teacher_code: "",
        name: "",
        teacher_type: "duty" as string,
        email: "",
        password: "",
    });

    useEffect(() => {
        if (!open) {
            reset();
            clearErrors();
            return;
        }

        if (isCreate) {
            reset();
            setData({
                teacher_code: "",
                name: "",
                teacher_type: "duty",
                email: "",
                password: "",
            });
        } else if (teacher) {
            let roleStr = "duty";
            if (Array.isArray(teacher.teacher_type)) {
                const hasDuty = teacher.teacher_type.includes("duty") || teacher.teacher_type.includes("piket");
                const hasHome = teacher.teacher_type.includes("homeroom") || teacher.teacher_type.includes("wali");
                if (hasDuty && hasHome) roleStr = "both";
                else if (hasHome) roleStr = "homeroom";
                else roleStr = "duty";
            } else if (teacher.teacher_type) {
                roleStr = String(teacher.teacher_type);
            }

            setData({
                teacher_code: teacher.teacher_code,
                name: teacher.name,
                teacher_type: roleStr,
                email: teacher.user?.email ?? "",
                password: "",
            });
        }
        clearErrors();
    }, [open, mode, teacher, isCreate, setData, clearErrors, reset]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isUnlocked) return;

        const result = validateForm(teacherSchema, data);
        if (!result.success) {
            clearErrors();
            Object.entries(result.errors).forEach(([field, message]) => {
                setError(field as keyof typeof data, message);
            });
            return;
        }

        if (!isCreate && teacher) {
            patch(`/master-data/teachers/${teacher.id}`, {
                onSuccess: () => {
                    setUnlockedByUser(false);
                    onClose();
                },
            });
        } else {
            post("/master-data/teachers", {
                onSuccess: () => {
                    setUnlockedByUser(false);
                    onClose();
                },
            });
        }
    };

    const isReadOnly = !isUnlocked;

    const copyFields = teacher
        ? [
              { label: "Kode Guru / NIP", value: teacher.teacher_code },
              { label: "Nama Lengkap", value: teacher.name },
              { label: "Tipe Penugasan", value: String(teacher.teacher_type || "duty") },
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
        ? "Lengkapi data guru untuk membuat akun dan penugasan baru."
        : isUnlocked
        ? "Formulir terbuka. Perbarui data guru dan simpan perubahan."
        : "Mode lihat. Klik tombol 'Edit' di kanan atas untuk mengubah data.";

    const headerActions = !isCreate && teacher ? (
        <DrawerHeaderActions
            isUnlocked={isUnlocked}
            onToggleUnlock={() => setUnlockedByUser((prev) => !prev)}
            onDelete={
                onRequestDelete
                    ? () => {
                          handleClose();
                          onRequestDelete("teachers", teacher.id, teacher.name);
                      }
                    : undefined
            }
            copyFields={copyFields}
            entityTitle={`Data Guru - ${teacher.name}`}
        />
    ) : null;

    return (
        <Drawer
            open={open}
            onClose={handleClose}
            title={title}
            description={description}
            headerActions={headerActions}
            width="md"
            showFooter={isUnlocked}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-[13px] font-medium text-text-primary mb-1">
                        Kode Guru / NIP <span className="text-danger">*</span>
                    </label>
                    <Input
                        placeholder="Contoh: TCH-001 atau NIP"
                        value={data.teacher_code}
                        onChange={(e) => setData("teacher_code", e.target.value)}
                        disabled={isReadOnly}
                    />
                    {errors.teacher_code && (
                        <p className="text-[12px] text-danger mt-1">
                            {errors.teacher_code}
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-[13px] font-medium text-text-primary mb-1">
                        Nama Lengkap Beserta Gelar <span className="text-danger">*</span>
                    </label>
                    <Input
                        placeholder="Contoh: Budi Hartono, S.Pd., M.Pd."
                        value={data.name}
                        onChange={(e) => setData("name", e.target.value)}
                        disabled={isReadOnly}
                    />
                    {errors.name && (
                        <p className="text-[12px] text-danger mt-1">{errors.name}</p>
                    )}
                </div>

                <div>
                    <label className="block text-[13px] font-medium text-text-primary mb-1">
                        Tipe Penugasan Guru <span className="text-danger">*</span>
                    </label>
                    <SelectInput
                        value={data.teacher_type}
                        onChange={(val) => setData("teacher_type", val ? String(val) : "duty")}
                        options={[
                            { value: "duty", label: "Guru Piket" },
                            { value: "homeroom", label: "Wali Kelas" },
                            { value: "both", label: "Guru Piket & Wali Kelas (Multi-Peran)" },
                        ]}
                        disabled={isReadOnly}
                    />
                </div>

                <div>
                    <label className="block text-[13px] font-medium text-text-primary mb-1">
                        Email Resmi Sekolah (Opsional)
                    </label>
                    <Input
                        type="email"
                        placeholder="nama@smauii.sch.id"
                        value={data.email}
                        onChange={(e) => setData("email", e.target.value)}
                        disabled={isReadOnly}
                    />
                    {errors.email && (
                        <p className="text-[12px] text-danger mt-1">{errors.email}</p>
                    )}
                </div>

                {isUnlocked && (
                    <div>
                        <label className="block text-[13px] font-medium text-text-primary mb-1">
                            {isCreate
                                ? "Password Akun Login"
                                : "Password Baru (Kosongkan jika tetap)"}
                        </label>
                        <Input
                            type="password"
                            placeholder="••••••••"
                            value={data.password}
                            onChange={(e) => setData("password", e.target.value)}
                        />
                        {errors.password && (
                            <p className="text-[12px] text-danger mt-1">
                                {errors.password}
                            </p>
                        )}
                    </div>
                )}

                {isUnlocked && (
                    <div className="flex justify-end gap-2 pt-4 border-t border-border">
                        <Button
                            variant="secondary"
                            type="button"
                            onClick={() => (isCreate ? handleClose() : setUnlockedByUser(false))}
                        >
                            Batal
                        </Button>
                        <Button variant="primary" type="submit" disabled={processing}>
                            {processing
                                ? "Menyimpan..."
                                : isCreate
                                ? "Simpan Guru"
                                : "Perbarui Guru"}
                        </Button>
                    </div>
                )}
            </form>
        </Drawer>
    );
}
