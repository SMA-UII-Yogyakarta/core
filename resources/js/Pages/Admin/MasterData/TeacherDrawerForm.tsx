import { useForm } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { Drawer, DrawerHeaderActions, Input } from "@/Components";
import { teacherSchema } from "@/schemas";
import { validateForm } from "@/utils/zodHelper";
import { FiCheck, FiUserCheck, FiShield } from "react-icons/fi";
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

    const [isHomeroom, setIsHomeroom] = useState(false);
    const [isDuty, setIsDuty] = useState(true);
    const [roleError, setRoleError] = useState<string | null>(null);

    const handleClose = () => {
        setUnlockedByUser(false);
        setRoleError(null);
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
            setRoleError(null);
            return;
        }

        if (isCreate) {
            reset();
            setIsHomeroom(false);
            setIsDuty(true);
            setData({
                teacher_code: "",
                name: "",
                teacher_type: "duty",
                email: "",
                password: "",
            });
        } else if (teacher) {
            let roleStr = "duty";
            let hasDuty = false;
            let hasHome = false;

            if (Array.isArray(teacher.teacher_type)) {
                hasDuty = teacher.teacher_type.some((t) => String(t).includes("duty") || String(t).includes("piket"));
                hasHome = teacher.teacher_type.some((t) => String(t).includes("homeroom") || String(t).includes("wali"));
            } else if (teacher.teacher_type) {
                const str = String(teacher.teacher_type).toLowerCase();
                hasDuty = str.includes("duty") || str.includes("piket") || str === "both";
                hasHome = str.includes("homeroom") || str.includes("wali") || str === "both";
            }

            if (!hasDuty && !hasHome) hasDuty = true;

            setIsDuty(hasDuty);
            setIsHomeroom(hasHome);

            if (hasDuty && hasHome) roleStr = "both";
            else if (hasHome) roleStr = "homeroom";
            else roleStr = "duty";

            setData({
                teacher_code: teacher.teacher_code,
                name: teacher.name,
                teacher_type: roleStr,
                email: teacher.user?.email ?? "",
                password: "",
            });
        }
        clearErrors();
        setRoleError(null);
    }, [open, mode, teacher, isCreate, setData, clearErrors, reset]);

    const handleToggleDuty = () => {
        if (!isUnlocked) return;
        const next = !isDuty;
        setIsDuty(next);
        setRoleError(null);
        syncTeacherType(next, isHomeroom);
    };

    const handleToggleHomeroom = () => {
        if (!isUnlocked) return;
        const next = !isHomeroom;
        setIsHomeroom(next);
        setRoleError(null);
        syncTeacherType(isDuty, next);
    };

    const syncTeacherType = (duty: boolean, homeroom: boolean) => {
        if (duty && homeroom) setData("teacher_type", "both");
        else if (homeroom) setData("teacher_type", "homeroom");
        else if (duty) setData("teacher_type", "duty");
        else setData("teacher_type", "");
    };

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!isUnlocked) return;

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
        ? "Lengkapi data guru untuk membuat akun dan penugasan baru."
        : undefined;

    const headerActions = (
        <DrawerHeaderActions
            mode={isCreate ? "create" : isUnlocked ? "edit" : "detail"}
            isUnlocked={isUnlocked}
            onToggleUnlock={() => setUnlockedByUser((prev) => !prev)}
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
            onSubmit={handleSubmit}
            onCancel={() => (isCreate ? handleClose() : setUnlockedByUser(false))}
            submitLabel={isCreate ? "Simpan Guru" : "Perbarui Guru"}
            cancelLabel={isCreate ? "Batal" : "Batal Edit"}
            loading={processing}
            showFooter={isUnlocked}
        >
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
                <label className="block text-[13px] font-medium text-text-primary mb-1.5">
                    Tipe Penugasan Guru <span className="text-danger">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Option 1: Wali Kelas */}
                    <div
                        onClick={handleToggleHomeroom}
                        className={`p-3 rounded-xl border flex items-start gap-3 transition-all ${
                            isReadOnly ? "opacity-75 cursor-default" : "cursor-pointer"
                        } ${
                            isHomeroom
                                ? "bg-primary/5 border-primary ring-1 ring-primary/20 shadow-xs"
                                : "bg-surface border-border hover:bg-muted/40"
                        }`}
                    >
                        <div
                            className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                                isHomeroom
                                    ? "bg-primary border-primary text-white"
                                    : "border-border bg-surface text-transparent"
                            }`}
                        >
                            <FiCheck size={13} className="stroke-[3]" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                                <FiUserCheck className={`text-[13px] ${isHomeroom ? "text-primary" : "text-text-muted"}`} />
                                <span className="text-[13px] font-bold text-text-primary">Wali Kelas</span>
                            </div>
                            <p className="text-[11px] text-text-secondary mt-0.5 leading-snug">
                                Mendampingi kelas binaan & rekap siswa
                            </p>
                        </div>
                    </div>

                    {/* Option 2: Guru Piket */}
                    <div
                        onClick={handleToggleDuty}
                        className={`p-3 rounded-xl border flex items-start gap-3 transition-all ${
                            isReadOnly ? "opacity-75 cursor-default" : "cursor-pointer"
                        } ${
                            isDuty
                                ? "bg-primary/5 border-primary ring-1 ring-primary/20 shadow-xs"
                                : "bg-surface border-border hover:bg-muted/40"
                        }`}
                    >
                        <div
                            className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                                isDuty
                                    ? "bg-primary border-primary text-white"
                                    : "border-border bg-surface text-transparent"
                            }`}
                        >
                            <FiCheck size={13} className="stroke-[3]" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                                <FiShield className={`text-[13px] ${isDuty ? "text-primary" : "text-text-muted"}`} />
                                <span className="text-[13px] font-bold text-text-primary">Guru Piket</span>
                            </div>
                            <p className="text-[11px] text-text-secondary mt-0.5 leading-snug">
                                Kelola presensi harian & verifikasi izin
                            </p>
                        </div>
                    </div>
                </div>
                {roleError && (
                    <p className="text-[12px] text-danger mt-1.5 font-medium">{roleError}</p>
                )}
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

            {/* Account Credentials (Only when unlocked) */}
            {isUnlocked && (
                <div className="p-3 bg-muted/40 border border-border rounded-xl space-y-2">
                    <p className="text-[12px] font-bold text-text-primary">
                        Kredensial Akun Login
                    </p>
                    <div>
                        <label className="block text-[13px] font-medium text-text-primary mb-1">
                            {isCreate
                                ? "Password Akun"
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
                </div>
            )}
        </Drawer>
    );
}
