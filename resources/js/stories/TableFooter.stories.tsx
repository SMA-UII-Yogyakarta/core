import type { Meta, StoryObj } from '@storybook/react';
import TableFooter from '../Components/ui/TableFooter';

const meta: Meta<typeof TableFooter> = {
    title: 'UI/TableFooter',
    component: TableFooter,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TableFooter>;

export const DeclarativePagination: Story = {
    args: {
        currentPage: 1,
        totalPages: 5,
        totalItems: 48,
        perPage: 10,
        itemLabel: 'siswa',
        onPageChange: () => {},
    },
};

export const SinglePage: Story = {
    args: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 8,
        perPage: 10,
        itemLabel: 'pengajuan izin',
        onPageChange: () => {},
    },
};
