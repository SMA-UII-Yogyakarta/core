import type { Meta, StoryObj } from '@storybook/react';
import LiveBadge from '../Components/ui/LiveBadge';

const meta: Meta<typeof LiveBadge> = {
    title: 'UI/LiveBadge',
    component: LiveBadge,
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: 'select',
            options: ['danger', 'success', 'warning', 'primary', 'dark'],
        },
        pulse: { control: 'boolean' },
        size: {
            control: 'select',
            options: ['sm', 'md'],
        },
    },
};

export default meta;
type Story = StoryObj<typeof LiveBadge>;

export const DangerLive: Story = {
    args: {
        label: 'LIVE WEBCAM',
        variant: 'danger',
        pulse: true,
    },
};

export const DarkOverlay: Story = {
    args: {
        label: 'LIVE STREAM',
        variant: 'dark',
        pulse: true,
    },
};

export const SuccessGPS: Story = {
    args: {
        label: 'GPS LOCKED',
        variant: 'success',
        pulse: false,
    },
};

export const AllVariants: Story = {
    render: () => (
        <div className="flex flex-wrap items-center gap-3 p-4 bg-surface rounded-xl">
            <LiveBadge label="LIVE WEBCAM" variant="danger" pulse />
            <LiveBadge label="GPS LOCKED" variant="success" pulse={false} />
            <LiveBadge label="5 ANOMALI" variant="warning" pulse />
            <LiveBadge label="REALTIME SYNC" variant="primary" pulse />
            <div className="p-3 bg-black rounded-lg inline-block">
                <LiveBadge label="CAMERA ON" variant="dark" pulse />
            </div>
        </div>
    ),
};
