import type { Meta, StoryObj } from '@storybook/react';
import ExportButtonGroup from '../Components/features/ExportButtonGroup';

const meta: Meta<typeof ExportButtonGroup> = {
    title: 'Features/ExportButtonGroup',
    component: ExportButtonGroup,
    tags: ['autodocs'],
    argTypes: {
        loadingExcel: { control: 'boolean' },
        loadingPdf: { control: 'boolean' },
        disabled: { control: 'boolean' },
    },
};

export default meta;
type Story = StoryObj<typeof ExportButtonGroup>;

export const Default: Story = {
    args: {
        onExportExcel: () => alert('Mengunduh Laporan Excel (.xlsx)...'),
        onExportPdf: () => alert('Mengunduh Laporan PDF (.pdf)...'),
        onPrint: () => window.print(),
    },
};

export const ExcelAndPdfOnly: Story = {
    args: {
        onExportExcel: () => alert('Mengunduh Excel...'),
        onExportPdf: () => alert('Mengunduh PDF...'),
    },
};

export const LoadingState: Story = {
    args: {
        onExportExcel: () => {},
        onExportPdf: () => {},
        loadingExcel: true,
    },
};
