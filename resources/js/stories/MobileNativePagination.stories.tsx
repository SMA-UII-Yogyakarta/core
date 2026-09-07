import type { Meta, StoryObj } from '@storybook/react';
import MobileNativePagination from '../Components/ui/MobileNativePagination';

const meta: Meta<typeof MobileNativePagination> = {
    title: 'UI/MobileNativePagination',
    component: MobileNativePagination,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MobileNativePagination>;

export const Default: Story = {
    args: {
        currentPage: 2,
        totalPages: 8,
        totalItems: 75,
        perPage: 10,
        itemLabel: 'siswa',
        onPageChange: () => {},
    },
};

export const FirstPage: Story = {
    args: {
        currentPage: 1,
        totalPages: 4,
        totalItems: 38,
        perPage: 10,
        itemLabel: 'data presensi',
        onPageChange: () => {},
    },
};

export const StickyBottom: Story = {
    args: {
        currentPage: 3,
        totalPages: 6,
        totalItems: 52,
        perPage: 10,
        sticky: true,
        itemLabel: 'riwayat izin',
        onPageChange: () => {},
    },
};
