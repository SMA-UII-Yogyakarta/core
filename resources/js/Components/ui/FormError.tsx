interface FormErrorProps {
    message?: string;
    className?: string;
}

export default function FormError({ message, className = "" }: FormErrorProps) {
    if (!message) return null;
    return <p className={`mt-1 text-[12px] text-danger font-inter ${className}`}>{message}</p>;
}
