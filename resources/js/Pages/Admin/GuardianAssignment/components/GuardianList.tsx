import { useMemo } from "react";
import { FiCheckCircle } from "react-icons/fi";
import { Avatar, SearchBar, Pagination } from "@/Components";
import type { Guardian } from "../types";

interface GuardianListProps {
    guardians: Guardian[];
    selectedGuardianId: string | null;
    guardianSearch: string;
    onSearchChange: (val: string) => void;
    onSelect: (id: string) => void;
    guardianPage: number;
    onPageChange: (page: number) => void;
    guardianPageSize: number;
}

export default function GuardianList({
    guardians,
    selectedGuardianId,
    guardianSearch,
    onSearchChange,
    onSelect,
    guardianPage,
    onPageChange,
    guardianPageSize,
}: GuardianListProps) {
    const filteredGuardians = useMemo(() => {
        return guardians.filter(
            (g) =>
                g.name.toLowerCase().includes(guardianSearch.toLowerCase()) ||
                (g.phone && g.phone.includes(guardianSearch)) ||
                (g.user?.email && g.user.email.toLowerCase().includes(guardianSearch.toLowerCase())),
        );
    }, [guardians, guardianSearch]);

    const guardianTotalPages = Math.max(1, Math.ceil(filteredGuardians.length / guardianPageSize));
    const guardianSafePage = Math.min(Math.max(1, guardianPage), guardianTotalPages);
    const paginatedGuardians = useMemo(() => {
        const start = (guardianSafePage - 1) * guardianPageSize;
        return filteredGuardians.slice(start, start + guardianPageSize);
    }, [filteredGuardians, guardianSafePage, guardianPageSize]);

    return (
        <div className="flex flex-col gap-4 bg-surface border border-border rounded-xl p-5 shadow-card">
            <div className="flex items-center justify-between border-b border-border pb-3">
                <h2 className="text-[15px] font-bold text-primary font-inter">
                    Pilih Wali Murid ({guardians.length})
                </h2>
            </div>

            <SearchBar
                value={guardianSearch}
                onChange={(val) => {
                    onSearchChange(val);
                    onPageChange(1);
                }}
                onSearch={() => onPageChange(1)}
                placeholder="Cari nama atau telepon wali..."
            />

            <div className="flex flex-col gap-2 max-h-[520px] overflow-y-auto pr-1">
                {paginatedGuardians.map((g) => {
                    const isSelected = g.id.toString() === selectedGuardianId;
                    return (
                        <button
                            key={g.id}
                            type="button"
                            onClick={() => onSelect(g.id.toString())}
                            data-testid={`guardian-item-${g.id}`}
                            className={`text-left p-3 rounded-lg border transition-all cursor-pointer flex items-start gap-3 ${
                                isSelected
                                    ? "border-primary bg-primary/5 shadow-sm"
                                    : "border-border/60 hover:border-primary/40 bg-surface"
                            }`}
                        >
                            <Avatar name={g.name} size="sm" variant={isSelected ? "primary" : "muted"} />
                            <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-bold text-text-primary truncate">{g.name}</p>
                                <p className="text-[12px] text-text-secondary truncate">
                                    {g.phone || "Tidak ada telepon"} &middot; {g.user?.email || "-"}
                                </p>
                                {g.address && (
                                    <p className="text-[11px] text-text-inactive truncate mt-0.5">
                                        {g.address}
                                    </p>
                                )}
                            </div>
                            {isSelected && (
                                <span className="text-primary font-bold text-[12px]">
                                    <FiCheckCircle />
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {filteredGuardians.length > guardianPageSize && (
                <div className="pt-2">
                    <Pagination
                        currentPage={guardianSafePage}
                        totalPages={guardianTotalPages}
                        totalItems={filteredGuardians.length}
                        perPage={guardianPageSize}
                        onPageChange={onPageChange}
                        compact
                    />
                </div>
            )}
        </div>
    );
}