import { useForm } from "@inertiajs/react";
import { useEffect } from "react";
import { Input, Button } from "@/Components";
import { guardianSchema } from "@/schemas";
import { validateForm } from "@/utils/zodHelper";
import { FiSave } from "react-icons/fi";
import type { Guardian } from "../types";

export interface GuardianFormProps {
    guardian?: Guardian | null;
    mode?: "create" | "edit" | "detail";
    isUnlocked?: boolean;
    onSuccess?: () => void;
    onCancel?: () => void;
    formId?: string;
    showSubmitButton?: boolean;
}

export default function GuardianForm({
    guardian,
    mode = "create",
    isUnlocked,
    onSuccess,
    onCancel,
    formId = "guardian-form",
    showSubmitButton = false,
}: GuardianFormProps) {
    const isCreate = mode === "create";
    const activeUnlocked = isUnlocked ?? isCreate;
    const isReadOnly = !activeUnlocked;

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
        phone: "",
        address: "",
        email: "",
        password: "",
    });

    useEffect(() => {
        if (isCreate) {
            reset();
            setData({
                name: "",
                phone: "",
                address: "",
                email: "",
                password: "",
            });
        } else if (guardian) {
            setData({
                name: guardian.name || "",
                phone: guardian.phone ?? "",
                address: guardian.address ?? "",
                email: guardian.user?.email ?? "",
                password: "",
            });
        }
        clearErrors();
    }, [guardian, isCreate, clearErrors, reset, setData]);

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (isReadOnly) return;

        const result = validateForm(guardianSchema, data);
        if (!result.success) {
            clearErrors();
            Object.entries(result.errors).forEach(([field, message]) => {
                setError(field as keyof typeof data, message);
            });
            return;
        }

        if (!isCreate && guardian?.id) {
            patch(`/master-data/guardians/${guardian.id}`, {
                onSuccess: () => onSuccess?.(),
            });
        } else {
            post("/master-data/guardians", {
                onSuccess: () => onSuccess?.(),
            });
        }
    };

    return (
        <form id={formId} onSubmit={handleSubmit} className="space-y-4 font-inter">
            <div>
                <label className="block text-[13px] font-medium text-text-primary mb-1">
                    Nama Lengkap Orang Tua / Wali <span className="text-danger">*</span>
                </label>
                <Input
                    placeholder="Contoh: Ir. Wahyu Hidayat, M.T."
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
                    Nomor WhatsApp / Telepon Aktif
                </label>
                <Input
                    placeholder="Contoh: 081298765432"
                    value={data.phone}
                    onChange={(e) => setData("phone", e.target.value.trim())}
                    disabled={isReadOnly}
                />
                <p className="text-[11px] text-text-muted mt-1">
                    Nomor WhatsApp aktif digunakan sebagai username login akun wali murid.
                </p>
                {errors.phone && (
                    <p className="text-[12px] text-danger mt-1">{errors.phone}</p>
                )}
            </div>

            <div>
                <label className="block text-[13px] font-medium text-text-primary mb-1">
                    Alamat Domisili
                </label>
                <Input
                    placeholder="Contoh: Jl. Sorowajan Baru No. 8"
                    value={data.address}
                    onChange={(e) => setData("address", e.target.value)}
                    disabled={isReadOnly}
                />
                {errors.address && (
                    <p className="text-[12px] text-danger mt-1">{errors.address}</p>
                )}
            </div>

            <div>
                <label className="block text-[13px] font-medium text-text-primary mb-1">
                    Email Akun Pengguna (Opsional)
                </label>
                <Input
                    type="email"
                    placeholder="wali@gmail.com"
                    value={data.email}
                    onChange={(e) => setData("email", e.target.value.trim())}
                    disabled={isReadOnly}
                />
                {errors.email && (
                    <p className="text-[12px] text-danger mt-1">{errors.email}</p>
                )}
            </div>

            {/* Account Credentials (Only when unlocked) */}
            {activeUnlocked && (
                <div className="p-3.5 bg-muted/30 border border-border rounded-xl space-y-2.5">
                    <div>
                        <p className="text-[12px] font-bold text-text-primary">
                            Kredensial Akun Wali Murid
                        </p>
                        <p className="text-[11px] text-text-muted">
                            Username otomatis menggunakan Nomor WhatsApp ({data.phone || "nomor HP"}).
                        </p>
                    </div>
                    <div>
                        <label className="block text-[13px] font-medium text-text-primary mb-1">
                            {isCreate
                                ? "Password Akun"
                                : "Password Baru (Kosongkan jika tidak diubah)"}
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
                                : "Isi hanya jika ingin mereset password wali murid ini."}
                        </p>
                        {errors.password && (
                            <p className="text-[12px] text-danger mt-1">
                                {errors.password}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {showSubmitButton && activeUnlocked && (
                <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
                    {onCancel && (
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onCancel}
                            disabled={processing}
                        >
                            Batal
                        </Button>
                    )}
                    <Button
                        type="submit"
                        variant="primary"
                        loading={processing}
                        icon={<FiSave />}
                    >
                        {isCreate ? "Simpan Wali" : "Perbarui Wali"}
                    </Button>
                </div>
            )}
        </form>
    );
}
