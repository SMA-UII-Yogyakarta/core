import { useForm } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { Drawer, DrawerHeaderActions, Input, SelectInput, Button } from "@/Components";
import { studentSchema } from "@/schemas";
import { validateForm } from "@/utils/zodHelper";
import type { Student, ClassOption } from "./types";

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
        nis: "",
        nisn: "",
        name: "",
        class_id: "" as string | number,
        birth_date: "",
        phone: "",
        address: "",
        enrollment_year: new Date().getFullYear(),
        guardian_id: "" as string | number,
        email: "",
        password: "",
        status: "Active",
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
                nis: "",
                nisn: "",
                name: "",
                class_id: defaultClassId,
                birth_date: "",
                phone: "",
                address: "",
                enrollment_year: new Date().getFullYear(),
                guardian_id: "",
                email: "",
                password: "",
                status: "Active",
            });
        } else if (student) {
            setData({
                nis: student.nis,
                nisn: student.nisn,
                name: student.name,
                class_id: student.class?.id ?? "",
                birth_date: student.birth_date ?? "",
                phone: student.phone ?? "",
                address: student.address ?? "",
                enrollment_year: student.enrollment_year ?? new Date().getFullYear(),
                guardian_id: student.guardian_id ?? "",
                email: student.user?.email ?? "",
                password: "",
                status: student.status ?? "Active",
            });
        }
        clearErrors();
    }, [open, mode, student, defaultClassId, isCreate, setData, clearErrors, reset]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isUnlocked) return;

        const validationData = {
            ...data,
            class_id: data.class_id ? Number(data.class_id) : undefined,
            guardian_id: data.guardian_id ? Number(data.guardian_id) : undefined,
        };

        const result = validateForm(studentSchema, validationData);
        if (!result.success) {
            clearErrors();
            Object.entries(result.errors).forEach(([field, message]) => {
                setError(field as keyof typeof data, message);
            });
            return;
        }

        if (!isCreate && student) {
            patch(`/master-data/students/${student.id}`, {
                onSuccess: () => {
                    setUnlockedByUser(false);
                    onClose();
                },
            });
        } else {
            post("/master-data", {
                onSuccess: () => {
                    setUnlockedByUser(false);
                    onClose();
                },
            });
        }
    };

    const isReadOnly = !isUnlocked;

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
                  value:
                      allGuardians.find((g) => g.id === student.guardian_id)?.name ||
                      "Belum Ada",
              },
              { label: "Alamat", value: student.address },
              { label: "Email", value: student.user?.email || "-" },
              { label: "Status", value: student.status || "Active" },
          ]
        : [];

    const title = isCreate
        ? "Tambah Siswa Baru"
        : isUnlocked
        ? "Edit Data Siswa"
        : "Detail Data Siswa";

    const description = isCreate
        ? "Lengkapi data siswa untuk membuat akun dan data baru."
        : undefined;

    const headerActions = !isCreate && student ? (
        <DrawerHeaderActions
            isUnlocked={isUnlocked}
            onToggleUnlock={() => setUnlockedByUser((prev) => !prev)}
            onDelete={
                onRequestDelete
                    ? () => {
                          handleClose();
                          onRequestDelete("students", student.id, student.name);
                      }
                    : undefined
            }
            copyFields={copyFields}
            entityTitle={`Data Siswa - ${student.name}`}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[13px] font-medium text-text-primary mb-1">
                            NIS <span className="text-danger">*</span>
                        </label>
                        <Input
                            placeholder="Contoh: 2024001"
                            value={data.nis}
                            onChange={(e) => setData("nis", e.target.value)}
                            disabled={isReadOnly}
                        />
                        {errors.nis && (
                            <p className="text-[12px] text-danger mt-1">{errors.nis}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-[13px] font-medium text-text-primary mb-1">
                            NISN <span className="text-danger">*</span>
                        </label>
                        <Input
                            placeholder="Contoh: 0071234567"
                            value={data.nisn}
                            onChange={(e) => setData("nisn", e.target.value)}
                            disabled={isReadOnly}
                        />
                        {errors.nisn && (
                            <p className="text-[12px] text-danger mt-1">{errors.nisn}</p>
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-[13px] font-medium text-text-primary mb-1">
                        Nama Lengkap <span className="text-danger">*</span>
                    </label>
                    <Input
                        placeholder="Nama lengkap siswa"
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
                            Kelas
                        </label>
                        <SelectInput
                            value={data.class_id ? String(data.class_id) : ""}
                            onChange={(val) => setData("class_id", val ? String(val) : "")}
                            options={[
                                { value: "", label: "Belum Masuk Kelas" },
                                ...classOptions.map((c) => ({
                                    value: String(c.id),
                                    label: c.name,
                                })),
                            ]}
                            disabled={isReadOnly}
                        />
                    </div>
                    <div>
                        <label className="block text-[13px] font-medium text-text-primary mb-1">
                            Tahun Masuk <span className="text-danger">*</span>
                        </label>
                        <Input
                            type="number"
                            placeholder="Tahun masuk"
                            value={data.enrollment_year}
                            onChange={(e) =>
                                setData("enrollment_year", Number(e.target.value))
                            }
                            disabled={isReadOnly}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[13px] font-medium text-text-primary mb-1">
                            Tanggal Lahir
                        </label>
                        <Input
                            type="date"
                            value={data.birth_date}
                            onChange={(e) => setData("birth_date", e.target.value)}
                            disabled={isReadOnly}
                        />
                    </div>
                    <div>
                        <label className="block text-[13px] font-medium text-text-primary mb-1">
                            No. Telepon / WhatsApp
                        </label>
                        <Input
                            placeholder="Contoh: 08123456789"
                            value={data.phone}
                            onChange={(e) => setData("phone", e.target.value)}
                            disabled={isReadOnly}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-[13px] font-medium text-text-primary mb-1">
                        Wali Murid
                    </label>
                    <SelectInput
                        value={data.guardian_id ? String(data.guardian_id) : ""}
                        onChange={(val) => setData("guardian_id", val ? String(val) : "")}
                        options={[
                            { value: "", label: "Pilih Wali Murid (Opsional)" },
                            ...allGuardians.map((g) => ({
                                value: String(g.id),
                                label: g.name,
                            })),
                        ]}
                        disabled={isReadOnly}
                    />
                </div>

                <div>
                    <label className="block text-[13px] font-medium text-text-primary mb-1">
                        Alamat Tinggal
                    </label>
                    <Input
                        placeholder="Alamat domisili siswa"
                        value={data.address}
                        onChange={(e) => setData("address", e.target.value)}
                        disabled={isReadOnly}
                    />
                </div>

                {/* Account Credentials (Only shown when editing or creating) */}
                {isUnlocked && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border">
                        <div>
                            <label className="block text-[13px] font-medium text-text-primary mb-1">
                                Email Akun (Opsional)
                            </label>
                            <Input
                                type="email"
                                placeholder="email@smauii.sch.id"
                                value={data.email}
                                onChange={(e) => setData("email", e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-[13px] font-medium text-text-primary mb-1">
                                {isCreate ? "Password Akun" : "Password Baru (Kosongkan jika tetap)"}
                            </label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={data.password}
                                onChange={(e) => setData("password", e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {/* Form Action Buttons (Only when unlocked) */}
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
                                ? "Simpan Siswa"
                                : "Perbarui Data"}
                        </Button>
                    </div>
                )}
            </form>
        </Drawer>
    );
}
