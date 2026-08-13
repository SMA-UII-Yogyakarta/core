interface BrandLogoProps {
    variant?: "light" | "dark";
    size?: "sm" | "md" | "lg";
    badge?: boolean;
    className?: string;
}

const sizeClasses = {
    sm: "w-9 h-9 p-1",
    md: "w-14 h-14 p-2",
    lg: "w-20 h-20 p-2.5",
};

const sizeClassesNoBadge = {
    sm: "w-8 h-8",
    md: "w-11 h-11",
    lg: "w-16 h-16",
};

export default function BrandLogo({ size = "sm", badge = true, className = "" }: BrandLogoProps) {
    if (!badge) {
        return (
            <img
                src="/images/logo-sma-uii.png"
                alt="Logo SMA UII Yogyakarta"
                className={`${sizeClassesNoBadge[size]} object-contain shrink-0 ${className}`}
            />
        );
    }

    return (
        <div
            className={`${sizeClasses[size]} bg-white rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-black/10 ${className}`}
        >
            <img
                src="/images/logo-sma-uii.png"
                alt="Logo SMA UII Yogyakarta"
                className="w-full h-full object-contain"
            />
        </div>
    );
}
