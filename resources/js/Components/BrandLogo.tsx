interface BrandLogoProps {
    variant?: 'light' | 'dark';
    size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
    sm: 'w-9 h-9 text-sm',
    md: 'w-14 h-14 text-xl',
    lg: 'w-20 h-20 text-3xl',
};

const variantClasses = {
    light: 'bg-accent text-primary',
    dark: 'bg-primary text-accent',
};

export default function BrandLogo({ variant = 'light', size = 'sm' }: BrandLogoProps) {
    return (
        <div
            className={`${sizeClasses[size]} ${variantClasses[variant]} rounded-full flex items-center justify-center font-bold font-inter shrink-0`}
        >
            UII
        </div>
    );
}
