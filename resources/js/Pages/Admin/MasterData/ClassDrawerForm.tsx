import { useForm } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { Drawer, DrawerHeaderActions, Input, SelectInput, Button } from "@/Components";
import { schoolClassSchema } from "@/schemas";
import { validateForm } from "@/utils/zodHelper";
import type { SchoolClass, Teacher } from "./types";

interface ClassDrawerFormProps {
    open: boolean;
    mode: "create" | "edit" | "detail" | null;
    schoolClass: SchoolClass | null;
    allTeachers: Teacher[];
    onClose: () => void;
    onRequestDelete?: (entity: string, ids: number | number[], label: string) => void;
}

export default function ClassDrawerForm({
    open,
    mode,
    schoolClass,
    allTeachers,
    onClose,
    onRequestDelete,
}: ClassDrawerFormProps) {
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
        name: "",
        level: "X",
        teacher_id: "" as string | number,
        capacity: "36",
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
                name: "",
                level: "X",
                teacher_id: "",
                capacity: "36",
            });
        } else if (schoolClass) {
            setData({
                name: schoolClass.name,
                level: schoolClass.level || "X",
                teacher_id: schoolClass.teacher?.id ?? "",
                capacity: String(schoolClass.capacity || 36),
            });
        }
        clearErrors();
    }, [open, mode, schoolClass, isCreate, setData, clearErrors, reset]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isUnlocked) return;

        const validationData = {
            name: data.name,
            level: data.level,
            teacher_id: data.teacher_id ? Number(data.teacher_id) : undefined,
            capacity: Number(data.capacity),
        };

        const result = validateForm(schoolClassSchema, validationData);
        if (!result.success) {
            clearErrors();
            Object.entries(result.errors).forEach(([field, message]) => {
                setError(field as keyof typeof data, message);
            });
            return;
        }

        if (!isCreate && schoolClass) {
            patch(`/master-data/classes/${schoolClass.id}`, {
                onSuccess: () => {
                    setUnlockedByUser(false);
                    onClose();
                },
            });
        } else {
            post("/master-data/classes", {
                onSuccess: () => {
                    setUnlockedByUser(false);
                    onClose();
                },
            });
        }
    };

    const isReadOnly = !isUnlocked;

    const copyFields = schoolClass
        ? [
              { label: "Nama Rombel / Kelas", value: schoolClass.name },
              { label: "Tingkat / Jenjang", value: schoolClass.level || "X" },
              { label: "Wali Kelas", value: schoolClass.teacher?.name || "Belum Ada" },
              { label: "Kapasitas Siswa", value: schoolClass.capacity || 36 },
              { label: "Jumlah Siswa Terdaftar", value: schoolClass.students_count || 0 },
          ]
        : [];

    const title = isCreate
        ? "Tambah Kelas / Rombel Baru"
        : isUnlocked
        ? "Edit Rombongan Belajar"
        : "Detail Rombongan Belajar";

    const description = isCreate
        ? "Buat rombongan belajar baru dan tentukan wali kelas."
        : isUnlocked
        ? "Formulir terbuka. Perbarui data rombel dan simpan perubahan."
        : "Mode lihat. Klik tombol 'Edit' di kanan atas untuk mengubah data.";

    const headerActions = !isCreate && schoolClass ? (
        <DrawerHeaderActions
            isUnlocked={isUnlocked}
            onToggleUnlock={() => setUnlockedByUser((prev) => !prev)}
            onDelete={
                onRequestDelete
                    ? () => {
                          handleClose();
                          onRequestDelete("classes", schoolClass.id, schoolClass.name);
                      }
                    : undefined
            }
            copyFields={copyFields}
            entityTitle={`Data Kelas - ${schoolClass.name}`}
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
                        Nama Kelas / Rombel <span className="text-danger">*</span>
                    </label>
                    <Input
                        placeholder="Contoh: X-A (Fase E - 1)"
                        value={data.name}
                        onChange={(e) => setData("name", e.target.value)}
                        disabled={isReadOnly}
                    />
                    {errors.name && (
                        <p className="text-[12px] text-danger mt-1">{errors.name}</p>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[13px] font-medium text-text-primary mb-1">
                            Tingkat / Jenjang <span className="text-danger">*</span>
                        </label>
                        <SelectInput
                            value={data.level}
                            onChange={(val) => setData("level", val ? String(val) : "X")}
                            options={[
                                { value: "X", label: "Kelas X (Fase E)" },
                                { value: "XI", label: "Kelas XI (Fase F)" },
                                { value: "XII", label: "Kelas XII (Fase F)" },
                            ]}
                            disabled={isReadOnly}
                        />
                    </div>
                    <div>
                        <label className="block text-[13px] font-medium text-text-primary mb-1">
                            Kapasitas Maksimal Siswa <span className="text-danger">*</span>
                        </label>
                        <Input
                            type="number"
                            placeholder="Contoh: 36"
                            value={data.capacity}
                            onChange={(e) => setData("capacity", e.target.value)}
                            disabled={isReadOnly}
                        />
                        {errors.capacity && (
                            <p className="text-[12px] text-danger mt-1">{errors.capacity}</p>
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-[13px] font-medium text-text-primary mb-1">
                        Wali Kelas Terpilih
                    </label>
                    <SelectInput
                        value={data.teacher_id ? String(data.teacher_id) : ""}
                        onChange={(val) => setData("teacher_id", val ? String(val) : "")}
                        options={[
                            { value: "", label: "Belum Ditentukan (Kosongkan)" },
                            ...allTeachers.map((t) => ({
                                value: String(t.id),
                                label: `${t.name} (${t.teacher_code})`,
                            })),
                        ]}
                        disabled={isReadOnly}
                    />
                </div>

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
                                ? "Simpan Kelas"
                                : "Perbarui Kelas"}
                        </Button>
                    </div>
                )}
            </form>
        </Drawer>
    );
}
