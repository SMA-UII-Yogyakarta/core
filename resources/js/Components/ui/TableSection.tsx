import type { ReactNode } from "react";

export interface TableSectionProps {
    children: ReactNode;
    /** Render the dense table layout only from tablet width upward. */
    desktopOnly?: boolean;
    /** Keep the section hidden when a tab or view is inactive. */
    visible?: boolean;
    className?: string;
}

/**
 * Canonical layout boundary for data tables.
 *
 * The `min-w-0`/`max-w-full` pair is intentional: without it, a wide table
 * expands the page and the browser scrolls the whole document instead of the
 * table viewport. The table itself owns horizontal and vertical scrolling.
 */
export default function TableSection({
    children,
    desktopOnly = false,
    visible = true,
    className = "",
}: TableSectionProps) {
    return (
        <div
            className={`${desktopOnly ? (visible ? "hidden sm:flex" : "hidden") : "flex"} min-w-0 max-w-full flex-1 min-h-0 flex-col gap-3 overflow-hidden ${className}`}
        >
            {children}
        </div>
    );
}
