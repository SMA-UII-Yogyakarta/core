import { useForm } from "@inertiajs/react";
import { useEffect, useState, useMemo } from "react";
import { Drawer, DrawerHeaderActions, Input, SelectInput, Button } from "@/Components";
import { schoolClassSchema } from "@/schemas";
import { validateForm } from "@/utils/zodHelper";
import { FiTag, FiCalendar } from "react-icons/fi";
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
        academic_year: "2024/2025",
        teacher_id: "" as string | number,
        capacity: "36",
    });

    // Unique existing class names for quick tag suggestions
    const existingClassNames = useMemo(() => {
        const names = existingClasses.map((c) => c.name.trim()).filter(Boolean);
        return Array.from(new Set(names)).slice(0, 10);
    }, [existingClasses]);

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
                academic_year: "2024/2025",
                teacher_id: "",
                capacity: "36",
            });
        } else if (schoolClass) {
            setData({
                name: schoolClass.name,
                level: schoolClass.level || "X",
                academic_year: schoolClass.academic_year || "2024/2025",
                teacher_id: schoolClass.teacher?.id ?? "",
                capacity: String(schoolClass.capacity || 36),
            });
        }
        clearErrors();
    }, [open, mode, schoolClass, isCreate, setData, clearErrors, reset]);

    const handleSelectExistingName = (name: string) => {
        if (!isUnlocked) return;
        setData("name", name);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isUnlocked) return;

        const validationData = {
            name: data.name,
            level: data.level,
            academic_year: data.academic_year,
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
              { label: "Tahun Ajaran / Angkatan", value: schoolClass.academic_year || "2024/2025" },
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
        ? "Buat rombongan belajar baru atau gunakan tag nama kelas yang sudah ada untuk angkatan baru."
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
            <form onSubmit={handleSubmit} className="space-y-4 font-inter">
                <div>
                    <label className="block text-[13px] font-medium text-text-primary mb-1">
                        Nama Kelas / Rombel <span className="text-danger">*</span>
                    </label>
                    <Input
                        placeholder="Contoh: X-A atau X-A (Fase E - 1)"
                        value={data.name}
                        onChange={(e) => setData("name", e.target.value)}
                        disabled={isReadOnly}
                    />
                    {errors.name && (
                        <p className="text-[12px] text-danger mt-1">{errors.name}</p>
                    )}

                    {/* Quick Tag Suggestions for Existing Class Names */}
                    {isUnlocked && existingClassNames.length > 0 && (
                        <div className="mt-2 p-2.5 bg-muted/20 border border-border rounded-xl">
                            <p className="text-[11px] font-bold text-text-secondary mb-1.5 flex items-center gap-1.5">
                                <FiTag className="text-primary text-[11px]" />
                                Tag Nama Kelas Yang Sudah Ada:
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {existingClassNames.map((name) => {
                                    const isSelected = data.name.trim().toLowerCase() === name.toLowerCase();
                                    return (
                                        <button
                                            key={name}
                                            type="button"
                                            onClick={() => handleSelectExistingName(name)}
                                            className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-colors cursor-pointer ${
                                                isSelected
                                                    ? "bg-primary text-white border-primary shadow-xs"
                                                    : "bg-surface text-text-primary border-border hover:border-primary/40 hover:bg-primary/5"
                                            }`}
                                        >
                                            {name}
                                        </button>
                                    );
                                })}
                            </div>
                            <p className="text-[10px] text-text-muted mt-1.5 leading-snug">
                                Klik nama kelas di atas jika ingin membuat kelas yang sama untuk angkatan / tahun ajaran baru.
                            </p>
                        </div>
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
                        <label className="block text-[13px] font-medium text-text-primary mb-1 flex items-center gap-1.5">
                            <FiCalendar className="text-primary text-[12px]" />
                            Tahun Ajaran / Angkatan <span className="text-danger">*</span>
                        </label>
                        <Input
                            placeholder="Contoh: 2024/2025"
                            value={data.academic_year}
                            onChange={(e) => setData("academic_year", e.target.value)}
                            disabled={isReadOnly}
                        />
                        {errors.academic_year && (
                            <p className="text-[12px] text-danger mt-1">{errors.academic_year}</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <div>
                        <label className="block text-[13px] font-medium text-text-primary mb-1">
                            Wali Kelas Terpilih
                        </label>
                        <SelectInput
                            value={data.teacher_id ? String(data.teacher_id) : ""}
                            onChange={(val) => setData("teacher_id", val ? String(val) : "")}
                            options={[
                                { value: "", label: "Belum Ditentukan" },
                                ...allTeachers.map((t) => ({
                                    value: String(t.id),
                                    label: `${t.name} (${t.teacher_code})`,
                                })),
                            ]}
                            disabled={isReadOnly}
                        />
                    </div>
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
