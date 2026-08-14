import type { Meta, StoryObj } from '@storybook/react';
import Input from '../Components/ui/Input';

const meta: Meta<typeof Input> = {
    title: 'UI/Input',
    component: Input,
    tags: ['autodocs'],
    argTypes: {
        label: { control: 'text' },
        placeholder: { control: 'text' },
        error: { control: 'text' },
        description: { control: 'text' },
        numeric: { control: 'boolean' },
        disabled: { control: 'boolean' },
    },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
    args: {
        label: 'Nama Lengkap',
        placeholder: 'Masukkan nama siswa...',
    },
};

export const WithDescription: Story = {
    args: {
        label: 'NIS (Nomor Induk Siswa)',
        placeholder: 'Contoh: 24250001',
        description: 'Format: 8 digit angka sesuai tahun angkatan',
        numeric: true,
    },
};

export const WithError: Story = {
    args: {
        label: 'Email Pengguna',
        placeholder: 'siswa@smauiiyk.sch.id',
        value: 'invalid-email',
        error: 'Format email tidak valid',
    },
};

export const NumericOnly: Story = {
    args: {
        label: 'Tahun Masuk (Angkatan)',
        placeholder: '2024',
        numeric: true,
    },
};
