import { useEffect, useRef, useState } from "react";
import { FaSearch } from "react-icons/fa";
import Button from "@/Components/ui/Button";
import { useDebounce } from "@/hooks/useDebounce";

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    onSearch: (value: string) => void;
    autoSearch?: boolean;
    debounceMs?: number;
    placeholder?: string;
}

export default function SearchBar({
    value,
    onChange,
    onSearch,
    autoSearch = true,
    debounceMs = 300,
    placeholder = "Cari data...",
}: SearchBarProps) {
    const [prevValue, setPrevValue] = useState(value);
    const [localValue, setLocalValue] = useState(value);
    const debouncedValue = useDebounce(localValue, debounceMs);
    const onSearchRef = useRef(onSearch);

    if (prevValue !== value) {
        setPrevValue(value);
        setLocalValue(value);
    }

    useEffect(() => {
        onSearchRef.current = onSearch;
    }, [onSearch]);

    useEffect(() => {
        if (autoSearch) {
            onSearchRef.current(debouncedValue);
        }
    }, [debouncedValue, autoSearch]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearchRef.current(localValue);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setLocalValue(newValue);
        if (autoSearch) {
            onChange(newValue);
        } else {
            onSearchRef.current(newValue);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full">
            <div className="relative w-full">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-inactive text-sm pointer-events-none" />
                <input
                    type="text"
                    value={localValue}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className="pl-10 pr-4 py-2 w-full border border-border rounded-lg text-[14px] font-inter text-text-primary bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-text-inactive"
                />
            </div>
            {!autoSearch && (
                <Button type="submit" variant="ghost" size="sm">
                    Cari
                </Button>
            )}
        </form>
    );
}
