import type { Meta, StoryObj } from '@storybook/react';
import Avatar from '../Components/ui/Avatar';

const meta: Meta<typeof Avatar> = {
    title: 'UI/Avatar',
    component: Avatar,
    tags: ['autodocs'],
    argTypes: {
        size: {
            control: 'select',
            options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'],
        },
        variant: {
            control: 'select',
            options: ['primary', 'accent', 'muted', 'surface'],
        },
        status: {
            control: 'select',
            options: ['online', 'offline', 'busy', 'away'],
        },
    },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Default: Story = {
    args: {
        name: 'Ahmad Reza Pahlevi',
        size: 'md',
        variant: 'primary',
    },
};

export const AccentVariant: Story = {
    args: {
        name: 'Bunga Citra',
        size: 'md',
        variant: 'accent',
        status: 'online',
    },
};

export const WithImage: Story = {
    args: {
        name: 'Dr. H. Sukarno',
        src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        size: 'lg',
        status: 'online',
    },
};

export const AllSizes: Story = {
    render: () => (
        <div className="flex items-end gap-3">
            <Avatar name="Ahmad Reza" size="xs" />
            <Avatar name="Ahmad Reza" size="sm" />
            <Avatar name="Ahmad Reza" size="md" status="online" />
            <Avatar name="Ahmad Reza" size="lg" status="away" />
            <Avatar name="Ahmad Reza" size="xl" status="busy" />
            <Avatar name="Ahmad Reza" size="2xl" status="offline" />
        </div>
    ),
};
