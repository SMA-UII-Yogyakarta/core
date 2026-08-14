import type { Meta, StoryObj } from '@storybook/react';
import Drawer from '../Components/common/Drawer';
import Input from '../Components/ui/Input';

const meta: Meta<typeof Drawer> = {
    title: 'Common/Drawer',
    component: Drawer,
    tags: ['autodocs'],
    argTypes: {
        width: {
            control: 'select',
            options: ['sm', 'md', 'lg', 'xl'],
        },
        open: {
            control: 'boolean',
        },
        loading: {
            control: 'boolean',
        },
    },
};

export default meta;
type Story = StoryObj<typeof Drawer>;

export const AddStudentDrawer: Story = {
    args: {
        open: true,
        title: 'Tambah Siswa Baru',
        width: 'md',
        submitLabel: 'Simpan Siswa',
        onClose: () => {},
        children: (
            <div className="space-y-4">
                <Input label="NIS" placeholder="Contoh: 24250001" />
                <Input label="NISN" placeholder="Contoh: 0081234501" />
                <Input label="Nama Lengkap" placeholder="Nama siswa" />
            </div>
        ),
    },
};

export const AddTeacherDrawer: Story = {
    args: {
        open: true,
        title: 'Tambah Guru Baru',
        width: 'md',
        submitLabel: 'Simpan Guru',
        onClose: () => {},
        children: (
            <div className="space-y-4">
                <Input label="Kode Guru" placeholder="Contoh: TCH-001" />
                <Input label="Nama Lengkap & Gelar" placeholder="Nama guru" />
            </div>
        ),
    },
};
