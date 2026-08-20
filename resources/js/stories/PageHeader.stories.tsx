import type { Meta, StoryObj } from "@storybook/react";
import PageHeader from "../Components/ui/PageHeader";
import Button from "../Components/ui/Button";

const meta: Meta<typeof PageHeader> = {
    title: "UI/PageHeader",
    component: PageHeader,
    tags: ["autodocs"],
    argTypes: {
        title: { control: "text" },
        description: { control: "text" },
    },
};

export default meta;
type Story = StoryObj<typeof PageHeader>;

export const Default: Story = {
    args: {
        title: "Manajemen Data Siswa",
        description: "Kelola entitas data utama institusi beserta akses kredensial siswa.",
    },
};

export const WithActions: Story = {
    args: {
        title: "Daftar Pengajuan Izin",
        description: "Pantau dan verifikasi permohonan izin dari wali murid.",
        children: (
            <div className="flex gap-2">
                <Button variant="outline" size="sm">
                    Filter Periode
                </Button>
                <Button variant="primary" size="sm">
                    + Tambah Pengajuan
                </Button>
            </div>
        ),
    },
};

export const TitleOnly: Story = {
    args: {
        title: "Pengaturan Sistem",
    },
};
