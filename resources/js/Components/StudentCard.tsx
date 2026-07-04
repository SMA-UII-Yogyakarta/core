interface StudentCardProps {
    name: string;
    nisn: string;
    gender?: string;
    instagram?: string;
    email?: string;
}

export default function StudentCard({
    name,
    nisn,
    gender,
    instagram,
    email,
}: StudentCardProps) {
    return (
        <article className="bg-surface border border-border rounded-lg p-4 font-inter">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-[15px] font-bold text-primary truncate">
                    {name}
                </h3>
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
                        <div className="flex items-center gap-2 text-text-muted">
                            <i className="fab fa-instagram w-4 text-primary" />
                            <span className="truncate">{instagram}</span>
                        </div>
                    )}
                    {email && (
                        <div className="flex items-center gap-2 text-text-muted">
                            <i className="fas fa-envelope w-4 text-primary" />
                            <span className="truncate">{email}</span>
                        </div>
                    )}
                </div>
            )}
        </article>
    );
}
