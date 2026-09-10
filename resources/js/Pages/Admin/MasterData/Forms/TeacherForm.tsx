import { useForm } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { FiCheck, FiSave, FiShield, FiUserCheck } from "react-icons/fi";
import { Button, Input } from "@/Components";
import { teacherSchema } from "@/schemas";
import { validateForm } from "@/utils/zodHelper";
import type { Teacher } from "../types";

export interface TeacherFormProps {
    teacher?: Teacher | null;
    mode?: "create" | "edit" | "detail";
    isUnlocked?: boolean;
    onSuccess?: () => void;
    onCancel?: () => void;
    formId?: string;
    showSubmitButton?: boolean;
}

export default function TeacherForm({
    teacher,
    mode = "create",
    isUnlocked,
    onSuccess,
    onCancel,
    formId = "teacher-form",
    showSubmitButton = false,
}: TeacherFormProps) {
    const isCreate = mode === "create";
    const activeUnlocked = isUnlocked ?? isCreate;
    const isReadOnly = !activeUnlocked;

    const [isHomeroom, setIsHomeroom] = useState(false);
    const [isDuty, setIsDuty] = useState(true);
    const [roleError, setRoleError] = useState<string | null>(null);

    const { data, setData, post, patch, processing, reset, errors, clearErrors, setError } = useForm({
        teacher_code: "",
        name: "",
        teacher_type: "duty" as string,
        email: "",
        password: "",
    });

    const [prevTeacher, setPrevTeacher] = useState<Teacher | null | undefined>(teacher);
    const [prevIsCreate, setPrevIsCreate] = useState(isCreate);

    if (teacher !== prevTeacher || isCreate !== prevIsCreate) {
        setPrevTeacher(teacher);
        setPrevIsCreate(isCreate);
        if (isCreate) {
            setIsHomeroom(false);
            setIsDuty(true);
        } else if (teacher) {
            let hasDuty = false;
            let hasHome = false;

            if (Array.isArray(teacher.teacher_type)) {
                hasDuty = teacher.teacher_type.some((t) => String(t).includes("duty") || String(t).includes("piket"));
                hasHome = teacher.teacher_type.some(
                    (t) => String(t).includes("homeroom") || String(t).includes("wali"),
                );
            } else if (teacher.teacher_type) {
                const str = String(teacher.teacher_type).toLowerCase();
                hasDuty = str.includes("duty") || str.includes("piket") || str === "both";
                hasHome = str.includes("homeroom") || str.includes("wali") || str === "both";
            }

            if (!hasDuty && !hasHome) hasDuty = true;

            setIsDuty(hasDuty);
            setIsHomeroom(hasHome);
        }
    }

    useEffect(() => {
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
            let roleStr: string;
            let hasDuty = false;
            let hasHome = false;

            if (Array.isArray(teacher.teacher_type)) {
                hasDuty = teacher.teacher_type.some((t) => String(t).includes("duty") || String(t).includes("piket"));
                hasHome = teacher.teacher_type.some(
                    (t) => String(t).includes("homeroom") || String(t).includes("wali"),
                );
            } else if (teacher.teacher_type) {
                const str = String(teacher.teacher_type).toLowerCase();
                hasDuty = str.includes("duty") || str.includes("piket") || str === "both";
                hasHome = str.includes("homeroom") || str.includes("wali") || str === "both";
            }

            if (!hasDuty && !hasHome) hasDuty = true;

            if (hasDuty && hasHome) roleStr = "both";
            else if (hasHome) roleStr = "homeroom";
            else roleStr = "duty";

            setData({
                teacher_code: teacher.teacher_code || "",
                name: teacher.name || "",
                teacher_type: roleStr,
                email: teacher.user?.email ?? "",
                password: "",
            });
        }
        clearErrors();
    }, [teacher, isCreate, clearErrors, reset, setData]);

    const syncTeacherType = (duty: boolean, homeroom: boolean) => {
        if (duty && homeroom) setData("teacher_type", "both");
        else if (homeroom) setData("teacher_type", "homeroom");
        else if (duty) setData("teacher_type", "duty");
        else setData("teacher_type", "");
    };

    const handleToggleDuty = () => {
        if (isReadOnly) return;
        const next = !isDuty;
        setIsDuty(next);
        setRoleError(null);
        syncTeacherType(next, isHomeroom);
    };

    const handleToggleHomeroom = () => {
        if (isReadOnly) return;
        const next = !isHomeroom;
        setIsHomeroom(next);
        setRoleError(null);
        syncTeacherType(isDuty, next);
    };

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (isReadOnly) return;

        if (!isDuty && !isHomeroom) {
            setRoleError("Pilih minimal satu penugasan guru (Guru Piket atau Wali Kelas).");
            return;
        }

        const result = validateForm(teacherSchema, data);
        if (!result.success) {
            clearErrors();
            Object.entries(result.errors).forEach(([field, message]) => {
                setError(field as keyof typeof data, message);
            });
            return;
        }

        if (!isCreate && teacher?.id) {
            patch(`/master-data/teachers/${teacher.id}`, {
                onSuccess: () => onSuccess?.(),
            });
        } else {
            post("/master-data/teachers", {
                onSuccess: () => onSuccess?.(),
            });
        }
    };

    return (
        <form id={formId} onSubmit={handleSubmit} className="space-y-4 font-inter">
            <div>
                <label className="block text-[13px] font-medium text-text-primary mb-1">
                    Kode Guru / NIP <span className="text-danger">*</span>
                </label>
                <Input
                    placeholder="Contoh: TCH-001 atau NIP"
                    value={data.teacher_code}
                    onChange={(e) => setData("teacher_code", e.target.value.trim())}
                    disabled={isReadOnly}
                />
                {errors.teacher_code && <p className="text-[12px] text-danger mt-1">{errors.teacher_code}</p>}
            </div>

            <div>
                <label className="block text-[13px] font-medium text-text-primary mb-1">
                    Nama Lengkap Beserta Gelar <span className="text-danger">*</span>
                </label>
                <Input
                    placeholder="Contoh: Ahmad Hanif Hasan Rosyidi, S.Kom"
                    value={data.name}
                    onChange={(e) => setData("name", e.target.value)}
                    disabled={isReadOnly}
                />
                {errors.name && <p className="text-[12px] text-danger mt-1">{errors.name}</p>}
            </div>

            <div>
                <label className="block text-[13px] font-medium text-text-primary mb-1.5">
                    Tipe Penugasan Guru <span className="text-danger">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                    {/* Option 1: Wali Kelas */}
                    <div
                        onClick={handleToggleHomeroom}
                        className={`p-2.5 sm:p-3 rounded-xl border flex items-start gap-2 sm:gap-3 transition-all ${
                            isReadOnly ? "opacity-75 cursor-default" : "cursor-pointer"
                        } ${
                            isHomeroom
                                ? "bg-primary/5 border-primary ring-1 ring-primary/20 shadow-xs"
                                : "bg-surface border-border hover:bg-muted/40"
                        }`}
                    >
                        <div
                            className={`w-4 h-4 sm:w-5 sm:h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                                isHomeroom
                                    ? "bg-primary border-primary text-white"
                                    : "border-border bg-surface text-transparent"
                            }`}
                        >
                            <FiCheck size={12} className="stroke-[3]" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1 sm:gap-1.5">
                                <FiUserCheck
                                    className={`text-[12px] sm:text-[13px] shrink-0 ${isHomeroom ? "text-primary" : "text-text-muted"}`}
                                />
                                <span className="text-[12px] sm:text-[13px] font-bold text-text-primary truncate">
                                    Wali Kelas
                                </span>
                            </div>
                            <p className="text-[10px] sm:text-[11px] text-text-secondary mt-0.5 leading-tight">
                                Mendampingi kelas binaan & rekap siswa
                            </p>
                        </div>
                    </div>

                    {/* Option 2: Guru Piket */}
                    <div
                        onClick={handleToggleDuty}
                        className={`p-2.5 sm:p-3 rounded-xl border flex items-start gap-2 sm:gap-3 transition-all ${
                            isReadOnly ? "opacity-75 cursor-default" : "cursor-pointer"
                        } ${
                            isDuty
                                ? "bg-primary/5 border-primary ring-1 ring-primary/20 shadow-xs"
                                : "bg-surface border-border hover:bg-muted/40"
                        }`}
                    >
                        <div
                            className={`w-4 h-4 sm:w-5 sm:h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                                isDuty
                                    ? "bg-primary border-primary text-white"
                                    : "border-border bg-surface text-transparent"
                            }`}
                        >
                            <FiCheck size={12} className="stroke-[3]" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1 sm:gap-1.5">
                                <FiShield
                                    className={`text-[12px] sm:text-[13px] shrink-0 ${isDuty ? "text-primary" : "text-text-muted"}`}
                                />
                                <span className="text-[12px] sm:text-[13px] font-bold text-text-primary truncate">
                                    Guru Piket
                                </span>
                            </div>
                            <p className="text-[10px] sm:text-[11px] text-text-secondary mt-0.5 leading-tight">
                                Kelola presensi harian & verifikasi izin
                            </p>
                        </div>
                    </div>
                </div>
                {roleError && <p className="text-[12px] text-danger mt-1.5 font-medium">{roleError}</p>}
            </div>

            <div>
                <label className="block text-[13px] font-medium text-text-primary mb-1">
                    Email Resmi Sekolah (Opsional)
                </label>
                <Input
                    type="email"
                    placeholder="nama@smauiiyk.sch.id"
                    value={data.email}
                    onChange={(e) => setData("email", e.target.value.trim())}
                    disabled={isReadOnly}
                />
                <p className="text-[11px] text-text-muted mt-1">
                    Kosongkan jika ingin dibuatkan otomatis:{" "}
                    <span className="font-mono text-primary font-medium">
                        {data.name
                            ? `${data.name.split(" ")[0].toLowerCase().replace(/[^a-z0-9]/g, "")}${
                                  data.teacher_code
                                      ? "." + data.teacher_code.toLowerCase().replace(/[^a-z0-9]/g, "")
                                      : ""
                              }@smauiiyk.sch.id`
                            : "[nama].[kode]@smauiiyk.sch.id"}
                    </span>
                </p>
                {errors.email && <p className="text-[12px] text-danger mt-1">{errors.email}</p>}
            </div>

            {/* Account Credentials (Only when unlocked) */}
            {activeUnlocked && (
                <div className="p-3.5 bg-muted/30 border border-border rounded-xl space-y-2.5">
                    <div>
                        <p className="text-[12px] font-bold text-text-primary">Kredensial Akun SSO Guru</p>
                        <p className="text-[11px] text-text-muted">
                            Username akun otomatis menggunakan Kode Guru ({data.teacher_code || "kode"}).
                        </p>
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
                                : "Isi hanya jika ingin mengubah kata sandi guru ini."}
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
                        {isCreate ? "Simpan Guru" : "Perbarui Guru"}
                    </Button>
                </div>
            )}
        </form>
    );
}
