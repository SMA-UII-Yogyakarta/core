import type { Meta, StoryObj } from '@storybook/react';
import { Toaster as SonnerToaster, toast } from 'sonner';
import Button from '../Components/ui/Button';

const meta: Meta = {
    title: 'UI/Toast',
    tags: ['autodocs'],
};

export default meta;

function ToastDemo() {
    return (
        <div className="space-y-6 p-6">
            <SonnerToaster
                position="top-right"
                richColors
                closeButton
                toastOptions={{
                    className: 'font-inter text-[13px] rounded-xl shadow-lg border border-border',
                }}
            />
            <div>
                <h3 className="text-lg font-bold text-text-primary mb-2">Interactive Toast Previews</h3>
                <p className="text-sm text-text-muted mb-4">
                    Uji notifikasi Toast yang responsif, mendukung tumpukan kartu (stacking) dan gestur swipe pada perangkat seluler.
                </p>
            </div>

            <div className="flex flex-wrap gap-3">
                <Button
                    variant="success"
                    onClick={() =>
                        toast.success('Data Siswa Berhasil Disimpan', {
                            description: 'NIS 24250001 (Ahmad Reza) telah terdaftar di kelas X-A.',
                        })
                    }
                >
                    Trigger Success Toast
                </Button>

                <Button
                    variant="danger"
                    onClick={() =>
                        toast.error('Presensi Gagal', {
                            description: 'Wajah tidak terdeteksi atau berada di luar radius GPS sekolah.',
                        })
                    }
                >
                    Trigger Error Toast
                </Button>

                <Button
                    variant="secondary"
                    onClick={() =>
                        toast.warning('Peringatan Jam Masuk', {
                            description: 'Waktu presensi tersisa 5 menit sebelum toleransi keterlambatan berakhir.',
                        })
                    }
                >
                    Trigger Warning Toast
                </Button>

                <Button
                    variant="outline"
                    onClick={() =>
                        toast.info('Sinkronisasi Dapodik Berjalan', {
                            description: 'Memperbarui 450 data rombel siswa dari server pusat.',
                        })
                    }
                >
                    Trigger Info Toast
                </Button>

                <Button
                    variant="primary"
                    onClick={() => {
                        const promise = new Promise((resolve) => setTimeout(resolve, 2000));
                        toast.promise(promise, {
                            loading: 'Mengunggah foto selfie & verifikasi lokasi...',
                            success: 'Presensi berhasil dicatat pada 06:45 WIB!',
                            error: 'Gagal menghubungi server presensi.',
                        });
                    }}
                >
                    Trigger Promise / Async Toast
                </Button>
            </div>
        </div>
    );
}

export const InteractiveDemo: StoryObj = {
    render: () => <ToastDemo />,
};
