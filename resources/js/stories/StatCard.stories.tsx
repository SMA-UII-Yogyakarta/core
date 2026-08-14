import type { Meta, StoryObj } from '@storybook/react';
import StatCard from '../Components/ui/StatCard';

const meta: Meta<typeof StatCard> = {
    title: 'UI/StatCard',
    component: StatCard,
    tags: ['autodocs'],
    argTypes: {
        color: {
            control: 'select',
            options: ['green', 'amber', 'blue', 'red', 'grey'],
        },
    },
};

export default meta;
type Story = StoryObj<typeof StatCard>;

export const TotalStudents: Story = {
    args: {
        label: 'Total Siswa Terdaftar',
        value: 360,
        subtitle: '10 Rombel Aktif',
        color: 'blue',
    },
};

export const PresentToday: Story = {
    args: {
        label: 'Hadir Hari Ini',
        value: 342,
        subtitle: '95% Kehadiran',
        color: 'green',
    },
};

export const LateToday: Story = {
    args: {
        label: 'Terlambat',
        value: 12,
        subtitle: 'Batas 07:00 WIB',
        color: 'amber',
    },
};

export const AbsentToday: Story = {
    args: {
        label: 'Tanpa Keterangan',
        value: 6,
        subtitle: 'Perlu konfirmasi wali',
        color: 'red',
    },
};
