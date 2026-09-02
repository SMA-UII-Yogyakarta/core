import { useForm } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { Drawer, DrawerHeaderActions, Input, Button } from "@/Components";
import { guardianSchema } from "@/schemas";
import { validateForm } from "@/utils/zodHelper";
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
        phone: "",
        address: "",
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
                name: "",
                phone: "",
                address: "",
                email: "",
                password: "",
            });
        } else if (guardian) {
            setData({
                name: guardian.name,
                phone: guardian.phone ?? "",
                address: guardian.address ?? "",
                email: guardian.user?.email ?? "",
                password: "",
            });
        }
        clearErrors();
    }, [open, mode, guardian, isCreate, setData, clearErrors, reset]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isUnlocked) return;

        const result = validateForm(guardianSchema, data);
        if (!result.success) {
            clearErrors();
            Object.entries(result.errors).forEach(([field, message]) => {
                setError(field as keyof typeof data, message);
            });
            return;
        }

        if (!isCreate && guardian) {
            patch(`/master-data/guardians/${guardian.id}`, {
                onSuccess: () => {
                    setUnlockedByUser(false);
                    onClose();
                },
            });
        } else {
            post("/master-data/guardians", {
                onSuccess: () => {
                    setUnlockedByUser(false);
                    onClose();
                },
            });
        }
    };

    const isReadOnly = !isUnlocked;

    const copyFields = guardian
        ? [
              { label: "Nama Lengkap Wali", value: guardian.name },
              { label: "Nomor WhatsApp", value: guardian.phone || "-" },
              { label: "Alamat Domisili", value: guardian.address || "-" },
              { label: "Email Akun", value: guardian.user?.email || "-" },
              {
                  label: "Siswa Terhubung",
                  value: guardian.students?.map((s) => `${s.name} (${s.class?.name || "No Class"})`).join(", ") || "Belum Ada Siswa",
              },
          ]
        : [];

    const title = isCreate
        ? "Tambah Orang Tua / Wali Baru"
        : isUnlocked
        ? "Edit Data Orang Tua / Wali"
        : "Detail Data Orang Tua / Wali";

    const description = isCreate
        ? "Buat akun wali murid baru untuk pemantauan presensi."
        : isUnlocked
        ? "Formulir terbuka. Perbarui data wali murid dan simpan perubahan."
        : "Mode lihat. Klik tombol 'Edit' di kanan atas untuk mengubah data.";

    const headerActions = !isCreate && guardian ? (
        <DrawerHeaderActions
            isUnlocked={isUnlocked}
            onToggleUnlock={() => setUnlockedByUser((prev) => !prev)}
            onDelete={
                onRequestDelete
                    ? () => {
                          handleClose();
                          onRequestDelete("guardians", guardian.id, guardian.name);
                      }
                    : undefined
            }
            copyFields={copyFields}
            entityTitle={`Data Wali - ${guardian.name}`}
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
                        placeholder="Alamat lengkap orang tua / wali"
                        value={data.address}
                        onChange={(e) => setData("address", e.target.value)}
                        disabled={isReadOnly}
                    />
                </div>

                <div>
                    <label className="block text-[13px] font-medium text-text-primary mb-1">
                        Email Akun Login (Opsional)
                    </label>
                    <Input
                        type="email"
                        placeholder="wali@smauii.sch.id"
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
                                ? "Password Akun"
                                : "Password Baru (Kosongkan jika tidak diubah)"}
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
                                ? "Simpan Wali"
                                : "Perbarui Wali"}
                        </Button>
                    </div>
                )}
            </form>
        </Drawer>
    );
}
