import { useState, useEffect, type ReactNode } from "react";

export interface DashboardHeroBadge {
    icon?: ReactNode;
    label: ReactNode;
}

export interface DashboardHeroProps {
    title: ReactNode;
    subtitle?: ReactNode;
    description?: ReactNode;
    descriptionClassName?: string;
    time?: string;
    timezone?: string;
    showClock?: boolean;
    badges?: DashboardHeroBadge[];
    children?: ReactNode;
    className?: string;
    dusk?: string;
    "data-testid"?: string;
}

function getFormattedDate(): string {
    return new Date().toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

function getFormattedTime(): string {
    return new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function DashboardHero({
    title,
    subtitle,
    description,
    descriptionClassName,
    time,
    timezone = "WIB",
    showClock = true,
    badges,
    children,
    className = "",
    dusk,
    "data-testid": dataTestId,
}: DashboardHeroProps) {
    const [liveTime, setLiveTime] = useState<string>(time ?? getFormattedTime);
    const [liveDate, setLiveDate] = useState<string>(
        typeof subtitle === "string" ? subtitle : getFormattedDate,
    );

    useEffect(() => {
        if (time !== undefined && subtitle !== undefined) return;

        const updateClock = () => {
            if (time === undefined) {
                setLiveTime(getFormattedTime());
            }
            if (subtitle === undefined) {
                setLiveDate(getFormattedDate());
            }
        };

        const timer = setInterval(updateClock, 1000);
        return () => clearInterval(timer);
    }, [time, subtitle]);

    const displaySubtitle = subtitle !== undefined ? subtitle : liveDate;
    const displayTime = time !== undefined ? time : liveTime;

    return (
        <div
            className={`relative bg-primary text-white rounded-2xl p-5 sm:p-6 shadow-card overflow-hidden ${className}`}
            dusk={dusk}
            data-testid={dataTestId ?? dusk}
        >
            {/* Ambient Background Glows */}
            <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-accent/15 blur-2xl pointer-events-none" />
            <div className="absolute -left-6 -top-6 w-32 h-32 rounded-full bg-white/5 blur-xl pointer-events-none" />

            <div className="relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="min-w-0">
                        {displaySubtitle && (
                            <p className="text-white/70 text-[11px] sm:text-[12px] font-bold tracking-wider uppercase mb-1">
                                {displaySubtitle}
                            </p>
                        )}
                        <h2 className="text-white text-[20px] sm:text-[24px] font-bold leading-tight truncate">
                            {title}
                        </h2>
                        {description && (
                            <p
                                className={`text-[13px] mt-1 ${
                                    descriptionClassName ?? "text-white/80 font-medium"
                                }`}
                            >
                                {description}
                            </p>
                        )}
                    </div>

                    {showClock && (
                        <div className="self-start sm:self-auto shrink-0 bg-white/10 backdrop-blur-md border border-white/15 rounded-xl px-3.5 py-2 sm:px-4 sm:py-2.5 text-right">
                            <p className="text-[20px] sm:text-[22px] font-extrabold font-mono text-white leading-none">
                                {displayTime || "--:--"}
                            </p>
                            <p className="text-[9px] font-bold text-accent uppercase tracking-widest mt-0.5 sm:mt-1">
                                {timezone}
                            </p>
                        </div>
                    )}
                </div>

                {badges && badges.length > 0 && (
                    <div className="flex items-center gap-2.5 mt-5 flex-wrap">
                        {badges.map((badge, idx) => (
                            <div
                                key={idx}
                                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[12px] font-medium backdrop-blur-xs border ${
                                    idx === 0
                                        ? "bg-white/15 text-white border-white/10"
                                        : "bg-white/10 text-white/90 border border-white/5"
                                }`}
                            >
                                {badge.icon}
                                <span>{badge.label}</span>
                            </div>
                        ))}
                    </div>
                )}

                {children}
            </div>
        </div>
    );
}
