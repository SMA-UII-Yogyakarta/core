import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../Components/ui/Button';

const meta: Meta<typeof Button> = {
    title: 'UI/Button',
    component: Button,
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: 'select',
            options: ['primary', 'secondary', 'outline', 'danger', 'success', 'ghost'],
        },
        size: {
            control: 'select',
            options: ['sm', 'md', 'lg'],
        },
        loading: {
            control: 'boolean',
        },
        disabled: {
            control: 'boolean',
        },
    },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
    args: {
        children: 'Simpan Data Siswa',
        variant: 'primary',
        size: 'md',
    },
};

export const Secondary: Story = {
    args: {
        children: 'Aksi Cepat (Secondary)',
        variant: 'secondary',
        size: 'md',
    },
};

export const Outline: Story = {
    args: {
        children: 'Batal / Kembali',
        variant: 'outline',
        size: 'md',
    },
};

export const Danger: Story = {
    args: {
        children: 'Hapus Data',
        variant: 'danger',
        size: 'md',
    },
};

export const Loading: Story = {
    args: {
        children: 'Menyimpan...',
        variant: 'primary',
        loading: true,
    },
};
