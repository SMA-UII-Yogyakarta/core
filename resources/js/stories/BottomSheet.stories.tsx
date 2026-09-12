import type { Meta, StoryObj } from "@storybook/react";
import BottomSheet from "../Components/common/BottomSheet";
import Button from "../Components/ui/Button";

const meta: Meta<typeof BottomSheet> = {
    title: "Common/BottomSheet",
    component: BottomSheet,
    tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof BottomSheet>;

export const Default: Story = {
    args: {
        open: true,
        title: "Pilih Halaman",
        subtitle: "Lompat langsung ke halaman yang diinginkan",
        onClose: () => {},
        children: (
            <div className="grid grid-cols-4 gap-2 py-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((page) => (
                    <Button
                        key={page}
                        variant={page === 2 ? "primary" : "outline"}
                        size="sm"
                        className="h-10 text-[13px] font-bold"
                    >
                        {page}
                    </Button>
                ))}
            </div>
        ),
    },
};
