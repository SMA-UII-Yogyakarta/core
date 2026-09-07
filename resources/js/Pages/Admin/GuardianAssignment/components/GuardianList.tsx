import { useMemo } from "react";
import { FiCheckCircle, FiSearch } from "react-icons/fi";
import { Avatar, SearchBar, Pagination } from "@/Components";
import type { Guardian } from "../types";

export interface GuardianListProps {
    guardians: Guardian[];
    selectedGuardianId: string;
    selectedGuardianName?: string;
    onSelect: (id: string) => void;
    guardianSearch: string;
    onSearchChange?: (val: string) => void;
    guardianPage: number;
    onPageChange: (page: number) => void;
    guardianPageSize?: number;
    showSearch?: boolean;
    className?: string;
}

export default function GuardianList({
    guardians,
    selectedGuardianId,
    selectedGuardianName,
    onSelect,
    guardianSearch,
    onSearchChange,
    guardianPage,
    onPageChange,
    guardianPageSize = 10,
    showSearch = false,
    className = "",
}: GuardianListProps) {
    const filteredGuardians = useMemo(() => {
        const q = guardianSearch.toLowerCase();
        return guardians.filter(
            (g) =>
                g.name.toLowerCase().includes(q) ||
                (g.phone && g.phone.includes(q)) ||
                (g.user?.email && g.user.email.toLowerCase().includes(q)),
        );
    }, [guardians, guardianSearch]);

    const guardianTotalPages = Math.max(1, Math.ceil(filteredGuardians.length / guardianPageSize));
    const guardianSafePage = Math.min(Math.max(1, guardianPage), guardianTotalPages);
    const paginatedGuardians = useMemo(() => {
        const start = (guardianSafePage - 1) * guardianPageSize;
        return filteredGuardians.slice(start, start + guardianPageSize);
    }, [filteredGuardians, guardianSafePage, guardianPageSize]);

    return (
        <div className={`bg-surface border border-border rounded-2xl shadow-card h-full min-h-0 flex flex-col overflow-hidden font-inter ${className}`}>
            {/* Card Header */}
            <div className="flex items-center justify-between px-4 py-3.5 sm:px-5 sm:py-4 border-b border-border shrink-0">
                <h2 className="text-[15px] font-bold text-primary">
                    Pilih Wali Murid ({guardians.length})
                </h2>
                {selectedGuardianName && (
                    <span className="text-[12.5px] font-semibold text-text-muted truncate max-w-[200px]">
                        Wali: <strong className="text-text-primary font-bold">{selectedGuardianName}</strong>
                    </span>
                )}
            </div>

            {showSearch && onSearchChange && (
                <div className="p-3 sm:px-4 border-b border-border/50 shrink-0">
                    <SearchBar
                        value={guardianSearch}
                        onChange={(val) => {
                            onSearchChange(val);
                            onPageChange(1);
                        }}
                        onSearch={() => onPageChange(1)}
                        placeholder="Cari nama atau telepon wali..."
                    />
                </div>
            )}

            {/* Edge-to-Edge List Body */}
            <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-border/40">
                {paginatedGuardians.length > 0 ? (
                    paginatedGuardians.map((g) => {
                        const isSelected = g.id.toString() === selectedGuardianId;
                        return (
                            <button
                                key={g.id}
                                type="button"
                                onClick={() => onSelect(g.id.toString())}
                                data-testid={`guardian-item-${g.id}`}
                                className={`w-full text-left px-4 py-3 transition-all cursor-pointer flex items-center justify-between gap-3 text-left focus:outline-none ${
                                    isSelected
                                        ? "bg-primary/5 border-l-4 border-l-primary"
                                        : "hover:bg-muted/40 border-l-4 border-l-transparent"
                                }`}
                            >
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <Avatar name={g.name} size="sm" variant={isSelected ? "primary" : "muted"} className="shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className={`text-[13.5px] truncate ${isSelected ? "font-extrabold text-primary" : "font-bold text-text-primary"}`}>
                                                {g.name}
                                            </p>
                                            <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">
                                                {g.students?.length ?? 0} Siswa
                                            </span>
                                        </div>
                                        <p className="text-[12px] text-text-secondary mt-0.5 truncate">
                                            {g.phone || "Tidak ada telepon"}{g.user?.email ? ` · ${g.user.email}` : ""}
                                        </p>
                                        {g.address && (
                                            <p className="text-[11px] text-text-muted mt-0.5 truncate">
                                                {g.address}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                {isSelected && (
                                    <span className="text-primary font-bold text-[16px] shrink-0">
                                        <FiCheckCircle />
                                    </span>
                                )}
                            </button>
                        );
                    })
                ) : (
                    <div className="py-12 text-center text-text-muted my-auto">
                        <FiSearch className="text-2xl mx-auto mb-2 opacity-50" />
                        <p className="text-[13px] font-medium">Tidak ada wali murid yang sesuai pencarian.</p>
                    </div>
                )}
            </div>

            {/* Footer Pagination */}
            {filteredGuardians.length > guardianPageSize && (
                <div className="px-4 py-3 shrink-0 mt-auto border-t border-border bg-surface/50 font-inter">
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