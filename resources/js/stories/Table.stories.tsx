import type { Meta, StoryObj } from '@storybook/react';
import Table, { Column } from '../Components/ui/Table';
import StatusBadge from '../Components/ui/StatusBadge';

interface StudentRow {
    id: number;
    nis: string;
    name: string;
    className: string;
    status: 'present' | 'late' | 'sick' | 'absent';
}

const meta: Meta<typeof Table<StudentRow>> = {
    title: 'UI/Table',
    component: Table,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Table<StudentRow>>;

const columns: Column<StudentRow>[] = [
    { key: 'nis', header: 'NIS' },
    { key: 'name', header: 'Nama Siswa' },
    { key: 'className', header: 'Kelas' },
    {
        key: 'status',
        header: 'Status Kehadiran',
        render: (item) => <StatusBadge variant={item.status} />,
    },
];

const mockData: StudentRow[] = [
    { id: 1, nis: '24250001', name: 'Ahmad Reza Pahlevi', className: 'X-A', status: 'present' },
    { id: 2, nis: '24250002', name: 'Bunga Citra Lestari', className: 'X-A', status: 'present' },
    { id: 3, nis: '24250003', name: 'Clara Sinta Dewi', className: 'X-B', status: 'late' },
    { id: 4, nis: '24250004', name: 'Danang Suryo', className: 'XI-MIPA 1', status: 'sick' },
];

export const Default: Story = {
    args: {
        columns,
        data: mockData,
        keyExtractor: (item) => item.id,
    },
};

export const Loading: Story = {
    args: {
        columns,
        data: [],
        keyExtractor: (item) => item.id,
        loading: true,
    },
};

export const Empty: Story = {
    args: {
        columns,
        data: [],
        keyExtractor: (item) => item.id,
        emptyMessage: 'Tidak ada data siswa yang ditemukan.',
    },
};
