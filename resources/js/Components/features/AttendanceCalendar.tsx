import { useMemo } from "react";

export interface AttendanceRecord {
    id?: number;
    attendance_date: string;
    status: string;
    check_in_time?: string | null;
    notes?: string;
}

export interface HolidayRecord {
    id?: number;
    holiday_date: string;
    description: string;
}

export interface AttendanceCalendarProps {
    month: number; // 1-12
    year: number;
    attendances?: AttendanceRecord[];
    holidays?: HolidayRecord[];
    selectedDay?: number | null;
    onSelectDay?: (day: number, record?: AttendanceRecord, holiday?: HolidayRecord) => void;
    className?: string;
    dusk?: string;
}

const MONTH_NAMES = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
];

const DAY_LABELS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export default function AttendanceCalendar({
    month,
    year,
    attendances = [],
    holidays = [],
    selectedDay,
    onSelectDay,
    className = "",
    dusk = "attendance-calendar",
}: AttendanceCalendarProps) {
    const today = new Date();

    // Map attendances by day
    const attendanceMap = useMemo(() => {
        const map = new Map<number, AttendanceRecord>();
        for (const att of attendances) {
            const d = new Date(att.attendance_date);
            if (d.getMonth() + 1 === month && d.getFullYear() === year) {
                map.set(d.getDate(), att);
            }
        }
        return map;
    }, [attendances, month, year]);

    // Map holidays by day
    const holidayMap = useMemo(() => {
        const map = new Map<number, HolidayRecord>();
        for (const h of holidays) {
            const d = new Date(h.holiday_date);
            if (d.getMonth() + 1 === month && d.getFullYear() === year) {
                map.set(d.getDate(), h);
            }
        }
        return map;
    }, [holidays, month, year]);

    // Calendar grid calculation
    const cells = useMemo(() => {
        const firstDay = new Date(year, month - 1, 1).getDay();
        const daysInMonth = new Date(year, month, 0).getDate();
        const grid: (number | null)[] = [];

        for (let i = 0; i < firstDay; i++) {
            grid.push(null);
        }
        for (let d = 1; d <= daysInMonth; d++) {
            grid.push(d);
        }
        return grid;
    }, [month, year]);

    const getStatusDotColor = (status: string): string => {
        const s = status.toLowerCase();
        if (s === "present" || s === "hadir") return "bg-success";
        if (s === "late" || s === "terlambat") return "bg-warning";
        if (s === "sick" || s === "sakit") return "bg-blue-500";
        if (s === "leave" || s === "izin" || s === "permit") return "bg-indigo-500";
        if (s === "absent" || s === "alpa") return "bg-danger";
        return "bg-slate-300";
    };

    return (
        <div
            className={`bg-surface border border-border rounded-xl p-5 shadow-card font-inter ${className}`}
            dusk={dusk}
            data-testid={dusk}
        >
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-[15px] font-bold text-text-primary font-inter">
                    Kalender {MONTH_NAMES[month - 1]} {year}
                </h2>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-2">
                {DAY_LABELS.map((d, i) => (
                    <div
                        key={d}
                        className={`flex items-center justify-center text-[11px] font-bold py-1 select-none ${
                            i === 0 ? "text-danger" : "text-text-muted"
                        }`}
                    >
                        {d}
                    </div>
                ))}
            </div>

            {/* Date cells */}
            <div className="grid grid-cols-7 gap-y-1.5">
                {cells.map((day, idx) => {
                    if (!day) return <div key={`empty-${idx}`} className="h-9" />;

                    const att = attendanceMap.get(day);
                    const holiday = holidayMap.get(day);
                    const isToday =
                        day === today.getDate() &&
                        month === today.getMonth() + 1 &&
                        year === today.getFullYear();
                    const isSelected = selectedDay === day;

                    return (
                        <button
                            key={day}
                            type="button"
                            onClick={() => onSelectDay?.(day, att, holiday)}
                            className={`flex flex-col items-center justify-center gap-0.5 py-1 rounded-lg transition-all cursor-pointer hover:bg-muted focus:outline-none focus:ring-1 focus:ring-primary/40
                                ${isSelected ? "ring-2 ring-primary bg-primary/5" : ""}
                            `}
                            aria-label={`Tanggal ${day} ${MONTH_NAMES[month - 1]} ${year}${
                                att ? `, Status: ${att.status}` : ""
                            }${holiday ? `, Libur: ${holiday.description}` : ""}`}
                        >
                            <span
                                className={`text-[12px] font-semibold w-7 h-7 flex items-center justify-center rounded-full transition-colors ${
                                    isToday
                                        ? "bg-primary text-white font-bold shadow-sm"
                                        : holiday
                                          ? "text-danger font-bold"
                                          : "text-text-primary"
                                }`}
                            >
                                {day}
                            </span>
                            <div className="h-1.5 flex items-center justify-center">
                                {holiday ? (
                                    <span className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse" />
                                ) : att ? (
                                    <span
                                        className={`w-1.5 h-1.5 rounded-full ${getStatusDotColor(att.status)}`}
                                    />
                                ) : null}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3.5 mt-5 pt-4 border-t border-border flex-wrap">
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-success" />
                    <span className="text-[11px] text-text-muted">Hadir</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-warning" />
                    <span className="text-[11px] text-text-muted">Terlambat</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-[11px] text-text-muted">Sakit/Izin</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-danger" />
                    <span className="text-[11px] text-text-muted">Alpa / Libur</span>
                </div>
            </div>
        </div>
    );
}
