import type { Meta, StoryObj } from '@storybook/react';
import NotificationPopover from '../Components/layout/NotificationPopover';

const meta: Meta<typeof NotificationPopover> = {
    title: 'Layout/NotificationPopover',
    component: NotificationPopover,
    tags: ['autodocs'],
    parameters: {
        backgrounds: {
            default: 'primary',
            values: [{ name: 'primary', value: '#2E3391' }],
        },
    },
};

export default meta;
type Story = StoryObj<typeof NotificationPopover>;

const mockNotifications = [
    {
        id: 1,
        title: 'Presensi Anomali Terdeteksi',
        content: 'Siswa Ahmad Reza (X-A) tercatat melakukan presensi di luar radius geofence sekolah.',
        created_at: '5 menit yang lalu',
        is_read: false,
    },
    {
        id: 2,
        title: 'Pengajuan Izin Sakit',
        content: 'Wali murid Bunga Citra mengajukan izin sakit untuk tanggal 14-15 Agustus 2026.',
        created_at: '25 menit yang lalu',
        is_read: false,
    },
    {
        id: 3,
        title: 'Verifikasi Izin Disetujui',
        content: 'Wali Kelas X-B telah memverifikasi permohonan izin izin lomba OSN Clara Sinta.',
        created_at: '2 jam yang lalu',
        is_read: true,
    },
    {
        id: 4,
        title: 'Sinkronisasi Dapodik Berhasil',
        content: '450 data rombongan belajar semester ganjil telah tersinkronisasi sempurna.',
        created_at: '1 hari yang lalu',
        is_read: true,
    },
];

export const WithUnreadNotifications: Story = {
    args: {
        unreadCount: 2,
        notifications: mockNotifications,
    },
    render: (args) => (
        <div className="p-8 bg-primary rounded-2xl flex justify-end">
            <NotificationPopover {...args} />
        </div>
    ),
};

export const EmptyState: Story = {
    args: {
        unreadCount: 0,
        notifications: [],
    },
    render: (args) => (
        <div className="p-8 bg-primary rounded-2xl flex justify-end">
            <NotificationPopover {...args} />
        </div>
    ),
};
