import type { Meta, StoryObj } from '@storybook/react';
import MetricPill from '../Components/ui/MetricPill';

const meta: Meta<typeof MetricPill> = {
    title: 'UI/MetricPill',
    component: MetricPill,
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: 'select',
            options: ['success', 'warning', 'danger', 'primary', 'neutral'],
        },
        size: {
            control: 'select',
            options: ['sm', 'md'],
        },
    },
};

export default meta;
type Story = StoryObj<typeof MetricPill>;

export const SuccessHadir: Story = {
    args: {
        label: 'HADIR',
        value: 28,
        variant: 'success',
    },
};

export const WarningTelat: Story = {
    args: {
        label: 'TELAT',
        value: 3,
        variant: 'warning',
    },
};

export const DangerAlpa: Story = {
    args: {
        label: 'ALPA',
        value: 1,
        variant: 'danger',
    },
};

export const StudentRecapGrid: Story = {
    render: () => (
        <div className="grid grid-cols-3 gap-2.5 max-w-sm">
            <MetricPill label="HADIR" value={28} variant="success" />
            <MetricPill label="TELAT" value={3} variant="warning" />
            <MetricPill label="ALPA" value={1} variant="danger" />
        </div>
    ),
};
