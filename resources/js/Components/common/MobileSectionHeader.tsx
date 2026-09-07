export interface MobileSectionHeaderProps {
    title: string;
    description?: string;
    className?: string;
}

export default function MobileSectionHeader({
    title,
    description,
    className = "",
}: MobileSectionHeaderProps) {
    return (
        <div className={`sm:hidden flex flex-col gap-1 ${className}`.trimEnd()}>
            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider px-1">
                {title}
            </span>
            {description && (
                <p className="text-[12px] text-text-muted px-1 leading-relaxed">
                    {description}
                </p>
            )}
        </div>
    );
}
