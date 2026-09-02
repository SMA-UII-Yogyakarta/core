import TruncatedText from "@/Components/ui/TruncatedText";

interface StudentCardProps {
    name: string;
    nisn: string;
    gender?: string;
    instagram?: string;
    email?: string;
}

export default function StudentCard({ name, nisn, gender, instagram, email }: StudentCardProps) {
    return (
        <article className="bg-surface border border-border rounded-lg p-4 font-inter">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <TruncatedText
                    as="h3"
                    text={name}
                    className="text-[15px] font-bold text-primary"
                    tooltipPosition="top"
                />
                <button
                    className="text-text-inactive hover:text-text-muted shrink-0 ml-2"
                    aria-label="Aksi"
                    type="button"
                >
                    <i className="fas fa-ellipsis-v" />
                </button>
            </div>

            {/* NISN & Gender */}
            <p className="text-[13px] text-text-muted mb-3">
                NISN: {nisn}
                {gender && <span> &bull; {gender}</span>}
            </p>

            {/* Contact Info */}
            {(instagram || email) && (
                <div className="bg-muted rounded-lg p-3 flex flex-col gap-2 text-[13px]">
                    {instagram && (
                        <div className="flex items-center gap-2 text-text-muted min-w-0">
                            <i className="fab fa-instagram w-4 text-primary shrink-0" />
                            <TruncatedText text={instagram} className="min-w-0" />
                        </div>
                    )}
                    {email && (
                        <div className="flex items-center gap-2 text-text-muted min-w-0">
                            <i className="fas fa-envelope w-4 text-primary shrink-0" />
                            <TruncatedText text={email} className="min-w-0" />
                        </div>
                    )}
                </div>
            )}
        </article>
    );
}
