import type { Meta, StoryObj } from '@storybook/react';
import Modal from '../Components/common/Modal';
import Input from '../Components/ui/Input';

const meta: Meta<typeof Modal> = {
    title: 'Common/Modal',
    component: Modal,
    tags: ['autodocs'],
    argTypes: {
        width: {
            control: 'select',
            options: ['sm', 'md', 'lg'],
        },
        open: { control: 'boolean' },
        loading: { control: 'boolean' },
    },
};

export default meta;
type Story = StoryObj<typeof Modal>;

export const ConfirmationModal: Story = {
    args: {
        open: true,
        title: 'Konfirmasi Hapus Data Siswa',
        width: 'sm',
        submitLabel: 'Ya, Hapus',
        onClose: () => {},
        children: (
            <p className="text-[14px] text-text-secondary font-inter">
                Apakah Anda yakin ingin menghapus data siswa ini? Tindakan ini tidak dapat dibatalkan.
            </p>
        ),
    },
};

export const FormModal: Story = {
    args: {
        open: true,
        title: 'Impor Data Siswa via Excel',
        width: 'md',
        submitLabel: 'Unggah Berkas',
        onClose: () => {},
        children: (
            <div className="space-y-4">
                <p className="text-[13px] text-text-muted font-inter">
                    Pilih berkas template Excel (.xlsx) yang telah diisi sesuai format Dapodik SMA UII.
                </p>
                <Input type="file" label="Berkas Excel" />
            </div>
        ),
    },
};
