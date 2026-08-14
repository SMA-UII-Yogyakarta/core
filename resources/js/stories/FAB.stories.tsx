import type { Meta, StoryObj } from '@storybook/react';
import FAB from '../Components/ui/FAB';

const meta: Meta<typeof FAB> = {
    title: 'UI/FAB',
    component: FAB,
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: 'select',
            options: ['accent', 'primary'],
        },
        position: {
            control: 'select',
            options: ['bottom-right', 'bottom-left', 'bottom-center'],
        },
    },
};

export default meta;
type Story = StoryObj<typeof FAB>;

export const DefaultIconOnly: Story = {
    args: {
        variant: 'accent',
        position: 'bottom-right',
    },
};

export const ExtendedWithLabel: Story = {
    args: {
        variant: 'accent',
        label: 'Tambah Siswa',
        position: 'bottom-right',
    },
};

export const PrimaryVariant: Story = {
    args: {
        variant: 'primary',
        label: 'Presensi Baru',
        position: 'bottom-right',
    },
};
