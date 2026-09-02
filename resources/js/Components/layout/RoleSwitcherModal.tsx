import { router } from "@inertiajs/react";
import { FiCheck, FiUser, FiCalendar } from "react-icons/fi";
import Modal from "@/Components/common/Modal";

interface RoleSwitcherModalProps {
    isOpen: boolean;
    onClose: () => void;
    activeRole: string;
    availableRoles: string[];
}

export default function RoleSwitcherModal({ isOpen, onClose, activeRole, availableRoles }: RoleSwitcherModalProps) {
    const handleSwitch = (role: string) => {
        if (role === activeRole) {
            onClose();
            return;
        }
        router.post(
            "/profile/switch-role",
            { role },
            {
                preserveScroll: true,
                onSuccess: () => {
                    onClose();
                },
            }
        );
    };

    if (!availableRoles.includes("homeroom") || !availableRoles.includes("duty")) {
        return null;
    }

    return (
        <Modal open={isOpen} onClose={onClose} title="Ganti Peran Aktif" width="sm">
            <p className="text-[13px] text-text-secondary mb-5">
                Pilih peran mana yang ingin Anda gunakan saat ini. Ini akan mengubah menu navigasi Anda.
            </p>

            <div className="space-y-2.5">
                <button
                    onClick={() => handleSwitch('homeroom')}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                        activeRole === 'homeroom'
                            ? 'bg-brand-primary/5 border-brand-primary text-brand-primary'
                            : 'bg-surface border-border-color text-text-primary hover:border-brand-primary/40'
                    }`}
                >
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${activeRole === 'homeroom' ? 'bg-brand-primary/10' : 'bg-surface-hover'}`}>
                            <FiUser size={18} className={activeRole === 'homeroom' ? 'text-brand-primary' : 'text-text-muted'} />
                        </div>
                        <div className="text-left">
                            <div className="font-semibold text-[14px]">Wali Kelas</div>
                            <div className="text-[11px] opacity-70">Verifikasi Izin & Rekap Kelas</div>
                        </div>
                    </div>
                    {activeRole === 'homeroom' && <FiCheck size={18} className="text-brand-primary" />}
                </button>

                <button
                    onClick={() => handleSwitch('duty')}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                        activeRole === 'duty'
                            ? 'bg-brand-primary/5 border-brand-primary text-brand-primary'
                            : 'bg-surface border-border-color text-text-primary hover:border-brand-primary/40'
                    }`}
                >
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${activeRole === 'duty' ? 'bg-brand-primary/10' : 'bg-surface-hover'}`}>
                            <FiCalendar size={18} className={activeRole === 'duty' ? 'text-brand-primary' : 'text-text-muted'} />
                        </div>
                        <div className="text-left">
                            <div className="font-semibold text-[14px]">Guru Piket</div>
                            <div className="text-[11px] opacity-70">Pantau Presensi Harian Siswa</div>
                        </div>
                    </div>
                    {activeRole === 'duty' && <FiCheck size={18} className="text-brand-primary" />}
                </button>
            </div>
        </Modal>
    );
}
