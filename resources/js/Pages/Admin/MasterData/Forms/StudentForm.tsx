import { useForm } from "@inertiajs/react";
import { useEffect } from "react";
import { FiSave } from "react-icons/fi";
import { Button, Input, SelectInput } from "@/Components";
import { studentSchema } from "@/schemas";
import { validateForm } from "@/utils/zodHelper";
import type { ClassOption, Student } from "../types";

export interface StudentFormProps {
    student?: Student | null;
    mode?: "create" | "edit" | "detail";
    isUnlocked?: boolean;
    classOptions?: ClassOption[];
    allGuardians?: { id: number; name: string }[];
    defaultClassId?: string;
    onSuccess?: () => void;
    onCancel?: () => void;
    formId?: string;
    showSubmitButton?: boolean;
}

export default function StudentForm({
    student,
    mode = "create",
    isUnlocked,
    classOptions = [],
    allGuardians = [],
    defaultClassId = "",
    onSuccess,
    onCancel,
    formId = "student-form",
    showSubmitButton = false,
}: StudentFormProps) {
    const isCreate = mode === "create";
    const activeUnlocked = isUnlocked ?? isCreate;
    const isReadOnly = !activeUnlocked;

    const { data, setData, post, patch, processing, reset, errors, clearErrors, setError } = useForm({
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
                nis: student.nis || "",
                nisn: student.nisn || "",
                name: student.name || "",
                class_id: student.class?.id ?? student.class_id ?? "",
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
    }, [student, defaultClassId, isCreate, clearErrors, reset, setData]);

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (isReadOnly) return;

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

        if (!isCreate && student?.id) {
            patch(`/master-data/students/${student.id}`, {
                onSuccess: () => onSuccess?.(),
            });
        } else {
            post("/master-data/students", {
                onSuccess: () => onSuccess?.(),
            });
        }
    };

    return (
        <form id={formId} onSubmit={handleSubmit} className="space-y-4 font-inter">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-[13px] font-medium text-text-primary mb-1">
                        NIS (Nomor Induk Siswa) <span className="text-danger">*</span>
                    </label>
                    <Input
                        placeholder="Contoh: 2716 (4 digit)"
                        value={data.nis}
                        onChange={(e) => setData("nis", e.target.value.trim())}
                        disabled={isReadOnly}
                    />
                    {errors.nis && <p className="text-[12px] text-danger mt-1">{errors.nis}</p>}
                </div>
                <div>
                    <label className="block text-[13px] font-medium text-text-primary mb-1">
                        NISN <span className="text-danger">*</span>
                    </label>
                    <Input
                        placeholder="Contoh: 0012345678 (10 digit)"
                        value={data.nisn}
                        onChange={(e) => setData("nisn", e.target.value.trim())}
                        disabled={isReadOnly}
                    />
                    {errors.nisn && <p className="text-[12px] text-danger mt-1">{errors.nisn}</p>}
                </div>
            </div>

            <div>
                <label className="block text-[13px] font-medium text-text-primary mb-1">
                    Nama Lengkap Siswa <span className="text-danger">*</span>
                </label>
                <Input
                    placeholder="Contoh: ABIMANYU PANDITA PRABASWARA"
                    value={data.name}
                    onChange={(e) => setData("name", e.target.value)}
                    disabled={isReadOnly}
                />
                {errors.name && <p className="text-[12px] text-danger mt-1">{errors.name}</p>}
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
                    {errors.class_id && <p className="text-[12px] text-danger mt-1">{errors.class_id}</p>}
                </div>
                <div>
                    <label className="block text-[13px] font-medium text-text-primary mb-1">
                        Tahun Masuk / Angkatan <span className="text-danger">*</span>
                    </label>
                    <Input
                        type="number"
                        placeholder="Contoh: 2026"
                        value={data.enrollment_year}
                        onChange={(e) => setData("enrollment_year", Number(e.target.value))}
                        disabled={isReadOnly}
                    />
                    {errors.enrollment_year && <p className="text-[12px] text-danger mt-1">{errors.enrollment_year}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-[13px] font-medium text-text-primary mb-1">Tanggal Lahir</label>
                    <Input
                        type="date"
                        value={data.birth_date}
                        onChange={(e) => setData("birth_date", e.target.value)}
                        disabled={isReadOnly}
                    />
                    {errors.birth_date && <p className="text-[12px] text-danger mt-1">{errors.birth_date}</p>}
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
                    <label className="block text-[13px] font-medium text-text-primary mb-1">Nomor HP / WhatsApp</label>
                    <Input
                        placeholder="Contoh: 08123456789"
                        value={data.phone}
                        onChange={(e) => setData("phone", e.target.value)}
                        disabled={isReadOnly}
                    />
                    {errors.phone && <p className="text-[12px] text-danger mt-1">{errors.phone}</p>}
                </div>
                <div>
                    <label className="block text-[13px] font-medium text-text-primary mb-1">Alamat Domisili</label>
                    <Input
                        placeholder="Contoh: Jl. Kaliurang KM 9"
                        value={data.address}
                        onChange={(e) => setData("address", e.target.value)}
                        disabled={isReadOnly}
                    />
                    {errors.address && <p className="text-[12px] text-danger mt-1">{errors.address}</p>}
                </div>
            </div>

            {/* Account Credentials (Only when unlocked) */}
            {activeUnlocked && (
                <div className="p-3.5 bg-muted/30 border border-border rounded-xl space-y-3.5">
                    <div>
                        <p className="text-[12px] font-bold text-text-primary">Kredensial Akun SSO Siswa</p>
                        <p className="text-[11px] text-text-muted">
                            Username akun otomatis menggunakan NIS ({data.nis || "4 digit"}).
                        </p>
                    </div>

                    <div>
                        <label className="block text-[13px] font-medium text-text-primary mb-1">
                            Email Akun Sekolah (Opsional)
                        </label>
                        <Input
                            type="email"
                            placeholder="nama2716@smauiiyk.sch.id"
                            value={data.email}
                            onChange={(e) => setData("email", e.target.value.trim())}
                        />
                        <p className="text-[11px] text-text-muted mt-1">
                            Kosongkan jika ingin dibuatkan otomatis:{" "}
                            <span className="font-mono text-primary font-medium">
                                {data.name
                                    ? `${data.name
                                          .split(" ")[0]
                                          .toLowerCase()
                                          .replace(/[^a-z0-9]/g, "")}${data.nis || "nis"}@smauiiyk.sch.id`
                                    : "[namadepan][nis]@smauiiyk.sch.id"}
                            </span>
                        </p>
                        {errors.email && <p className="text-[12px] text-danger mt-1">{errors.email}</p>}
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
                        <p className="text-[11px] text-text-muted mt-1">
                            {isCreate
                                ? "Kosongkan untuk menggunakan kata sandi default: SmaUii@2026"
                                : "Isi hanya jika ingin mereset password siswa ini."}
                        </p>
                        {errors.password && <p className="text-[12px] text-danger mt-1">{errors.password}</p>}
                    </div>
                </div>
            )}

            {showSubmitButton && activeUnlocked && (
                <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
                    {onCancel && (
                        <Button type="button" variant="ghost" onClick={onCancel} disabled={processing}>
                            Batal
                        </Button>
                    )}
                    <Button type="submit" variant="primary" loading={processing} icon={<FiSave />}>
                        {isCreate ? "Simpan Siswa" : "Perbarui Data"}
                    </Button>
                </div>
            )}
        </form>
    );
}
