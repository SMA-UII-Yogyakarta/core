import { useMemo } from "react";
import StatusDot from "@/Components/ui/StatusDot";
import { INDONESIAN_MONTHS } from "@/utils/helpers";

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
    compact?: boolean;
}

const MONTH_NAMES = INDONESIAN_MONTHS;

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
    compact = false,
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

    return (
        <div
            className={`w-full min-w-0 bg-surface border border-border rounded-2xl shadow-card font-inter ${
                compact ? "p-3.5 sm:p-4" : "p-4 sm:p-5"
            } ${className}`}
            dusk={dusk}
            data-testid={dusk}
        >
            <div className={`flex items-center justify-between ${compact ? "mb-2.5" : "mb-4"}`}>
                <h2 className="text-[14px] sm:text-[15px] font-bold text-text-primary font-inter">
                    Kalender {MONTH_NAMES[month - 1]} {year}
                </h2>
            </div>

            {/* Day headers */}
            <div className={`grid grid-cols-7 w-full gap-1 ${compact ? "mb-1.5" : "mb-2.5"}`}>
                {DAY_LABELS.map((d, i) => (
                    <div
                        key={d}
                        className={`text-center text-[11px] sm:text-[12px] font-bold py-0.5 select-none truncate ${
                            i === 0 ? "text-danger" : "text-text-muted"
                        }`}
                    >
                        {d}
                    </div>
                ))}
            </div>

            {/* Date cells */}
            <div className={`grid grid-cols-7 w-full gap-1 ${compact ? "gap-y-1" : "gap-y-2"}`}>
                {cells.map((day, idx) => {
                    if (!day) return <div key={`empty-${idx}`} className={compact ? "h-7 w-full" : "h-9 w-full"} />;

                    const att = attendanceMap.get(day);
                    const holiday = holidayMap.get(day);
                    const isToday =
                        day === today.getDate() && month === today.getMonth() + 1 && year === today.getFullYear();
                    const isSelected = selectedDay === day;

                    return (
                        <button
                            key={day}
                            type="button"
                            onClick={() => onSelectDay?.(day, att, holiday)}
                            className={`w-full flex flex-col items-center justify-center gap-0.5 ${
                                compact ? "py-0.5" : "py-1"
                            } rounded-xl transition-all cursor-pointer hover:bg-muted/70 focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                                isSelected ? "ring-2 ring-primary bg-primary/10 shadow-2xs" : ""
                            }`}
                            aria-label={`Tanggal ${day} ${MONTH_NAMES[month - 1]} ${year}${
                                att ? `, Status: ${att.status}` : ""
                            }${holiday ? `, Libur: ${holiday.description}` : ""}`}
                        >
                            <span
                                className={`text-[12px] font-semibold flex items-center justify-center rounded-full transition-colors ${
                                    compact ? "w-7 h-7 sm:w-8 sm:h-8" : "w-8 h-8 sm:w-9 sm:h-9"
                                } ${
                                    isToday
                                        ? "bg-primary text-white font-bold shadow-xs"
                                        : holiday
                                          ? "text-danger font-bold bg-danger/10"
                                          : "text-text-primary"
                                }`}
                            >
                                {day}
                            </span>
                            <div className="h-1 flex items-center justify-center">
                                {holiday ? (
                                    <StatusDot status="absent" size="xs" pulse />
                                ) : att ? (
                                    <StatusDot status={att.status} size="xs" />
                                ) : null}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Legend */}
            <div
                className={`flex items-center border-t border-border flex-wrap ${
                    compact ? "gap-2.5 sm:gap-3 mt-3 pt-3" : "gap-3 sm:gap-4 mt-5 pt-4"
                }`}
            >
                <div className="flex items-center gap-1.5">
                    <StatusDot status="present" size="sm" />
                    <span className="text-[11px] text-text-muted font-medium">Hadir</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <StatusDot status="late" size="sm" />
                    <span className="text-[11px] text-text-muted font-medium">Terlambat</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <StatusDot status="sick" size="sm" />
                    <span className="text-[11px] text-text-muted font-medium">Sakit/Izin</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <StatusDot status="absent" size="sm" />
                    <span className="text-[11px] text-text-muted font-medium">Alpa / Libur</span>
                </div>
            </div>
        </div>
    );
}
