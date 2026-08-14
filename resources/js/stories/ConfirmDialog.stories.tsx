import type { Meta, StoryObj } from '@storybook/react';
import ConfirmDialog from '../Components/common/ConfirmDialog';

const meta: Meta<typeof ConfirmDialog> = {
    title: 'Common/ConfirmDialog',
    component: ConfirmDialog,
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: 'select',
            options: ['danger', 'warning', 'primary'],
        },
        open: { control: 'boolean' },
        loading: { control: 'boolean' },
    },
};

export default meta;
type Story = StoryObj<typeof ConfirmDialog>;

export const DeleteStudent: Story = {
    args: {
        open: true,
        title: 'Hapus Data Siswa?',
        message: 'Data siswa Ahmad Reza (NIS: 24250001) akan dihapus secara permanen beserta riwayat presensinya.',
        confirmLabel: 'Ya, Hapus Siswa',
        variant: 'danger',
        onClose: () => {},
        onConfirm: () => {},
    },
};

export const ResetPasswordWarning: Story = {
    args: {
        open: true,
        title: 'Reset Kata Sandi?',
        message: 'Kata sandi pengguna akan diatur ulang ke default (password123). Pengguna harus menggantinya saat login berikutnya.',
        confirmLabel: 'Reset Kata Sandi',
        variant: 'warning',
        onClose: () => {},
        onConfirm: () => {},
    },
};
