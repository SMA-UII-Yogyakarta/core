import { useForm } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { Drawer, DrawerHeaderActions, Input, SelectInput } from "@/Components";
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

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
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

    const headerActions = (
        <DrawerHeaderActions
            mode={isCreate ? "create" : isUnlocked ? "edit" : "detail"}
            isUnlocked={isUnlocked}
            onToggleUnlock={() => setUnlockedByUser((prev) => !prev)}
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
            onSubmit={handleSubmit}
            onCancel={() => (isCreate ? handleClose() : setUnlockedByUser(false))}
            submitLabel={isCreate ? "Simpan Siswa" : "Perbarui Data"}
            cancelLabel={isCreate ? "Batal" : "Batal Edit"}
            loading={processing}
            showFooter={isUnlocked}
        >
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
                        placeholder="Contoh: 0012345678"
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
                    Nama Lengkap Siswa <span className="text-danger">*</span>
                </label>
                <Input
                    placeholder="Contoh: Muhammad Rizky Pratama"
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
                        Rombongan Belajar / Kelas
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
                    {errors.class_id && (
                        <p className="text-[12px] text-danger mt-1">{errors.class_id}</p>
                    )}
                </div>
                <div>
                    <label className="block text-[13px] font-medium text-text-primary mb-1">
                        Tahun Masuk / Angkatan <span className="text-danger">*</span>
                    </label>
                    <Input
                        type="number"
                        placeholder="Contoh: 2024"
                        value={data.enrollment_year}
                        onChange={(e) => setData("enrollment_year", Number(e.target.value))}
                        disabled={isReadOnly}
                    />
                    {errors.enrollment_year && (
                        <p className="text-[12px] text-danger mt-1">
                            {errors.enrollment_year}
                        </p>
                    )}
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
                    {errors.birth_date && (
                        <p className="text-[12px] text-danger mt-1">{errors.birth_date}</p>
                    )}
                </div>
                <div>
                    <label className="block text-[13px] font-medium text-text-primary mb-1">
                        Status Kesiswaan <span className="text-danger">*</span>
                    </label>
                    <SelectInput
                        value={data.status}
                        onChange={(val) => setData("status", val ? String(val) : "Active")}
                        options={[
                            { value: "Active", label: "Aktif" },
                            { value: "Graduated", label: "Lulus" },
                            { value: "Transferred", label: "Pindah Sekolah" },
                            { value: "Dropped", label: "Keluar / Drop Out" },
                        ]}
                        disabled={isReadOnly}
                    />
                </div>
            </div>

            <div>
                <label className="block text-[13px] font-medium text-text-primary mb-1">
                    Orang Tua / Wali Terdaftar
                </label>
                <SelectInput
                    value={data.guardian_id ? String(data.guardian_id) : ""}
                    onChange={(val) => setData("guardian_id", val ? String(val) : "")}
                    options={[
                        { value: "", label: "Belum Dihubungkan" },
                        ...allGuardians.map((g) => ({
                            value: String(g.id),
                            label: g.name,
                        })),
                    ]}
                    disabled={isReadOnly}
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-[13px] font-medium text-text-primary mb-1">
                        Nomor HP / WhatsApp
                    </label>
                    <Input
                        placeholder="Contoh: 08123456789"
                        value={data.phone}
                        onChange={(e) => setData("phone", e.target.value)}
                        disabled={isReadOnly}
                    />
                    {errors.phone && (
                        <p className="text-[12px] text-danger mt-1">{errors.phone}</p>
                    )}
                </div>
                <div>
                    <label className="block text-[13px] font-medium text-text-primary mb-1">
                        Alamat Domisili
                    </label>
                    <Input
                        placeholder="Contoh: Jl. Kaliurang KM 9"
                        value={data.address}
                        onChange={(e) => setData("address", e.target.value)}
                        disabled={isReadOnly}
                    />
                    {errors.address && (
                        <p className="text-[12px] text-danger mt-1">{errors.address}</p>
                    )}
                </div>
            </div>

            {/* Account Credentials (Only when unlocked) */}
            {isUnlocked && (
                <div className="p-3 bg-muted/40 border border-border rounded-xl space-y-3">
                    <p className="text-[12px] font-bold text-text-primary">
                        Kredensial Akun Pengguna
                    </p>
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
                        {errors.email && (
                            <p className="text-[12px] text-danger mt-1">{errors.email}</p>
                        )}
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
                        {errors.password && (
                            <p className="text-[12px] text-danger mt-1">{errors.password}</p>
                        )}
                    </div>
                </div>
            )}
        </Drawer>
    );
}
