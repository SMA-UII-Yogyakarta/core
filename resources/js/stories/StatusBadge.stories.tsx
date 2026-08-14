import type { Meta, StoryObj } from '@storybook/react';
import StatusBadge from '../Components/ui/StatusBadge';

const meta: Meta<typeof StatusBadge> = {
    title: 'UI/StatusBadge',
    component: StatusBadge,
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: 'select',
            options: [
                'present',
                'late',
                'absent',
                'sick',
                'permission',
                'active',
                'inactive',
                'pending',
                'approved',
                'rejected',
            ],
        },
        label: {
            control: 'text',
        },
    },
};

export default meta;
type Story = StoryObj<typeof StatusBadge>;

export const Present: Story = {
    args: {
        variant: 'present',
    },
};

export const Late: Story = {
    args: {
        variant: 'late',
    },
};

export const Absent: Story = {
    args: {
        variant: 'absent',
    },
};

export const Sick: Story = {
    args: {
        variant: 'sick',
    },
};

export const Approved: Story = {
    args: {
        variant: 'approved',
    },
};
