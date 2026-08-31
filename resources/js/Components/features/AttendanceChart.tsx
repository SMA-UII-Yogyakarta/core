import { useEffect, useRef } from "react";
import {
    Chart,
    BarController,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    LineController,
    LineElement,
    PointElement,
    Filler,
} from "chart.js";

Chart.register(
    BarController,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    LineController,
    LineElement,
    PointElement,
    Filler,
);

export interface ChartDataPoint {
    label: string;
    present: number;
    late: number;
    absent?: number;
    permission?: number;
    sick?: number;
    /** Pending leave count shown as its own stacked series */
    pending?: number;
    /** Optional precomputed attendance rate 0–100 for single-line mode */
    rate?: number;
    /** True when the point is not a school day (weekend / holiday / inactive) */
    isNonSchool?: boolean;
    /** Human-readable reason shown in tooltip for non-school days */
    note?: string;
    /** True for non-school days that have already elapsed (before today) */
    isPast?: boolean;
    /** Total active students in the class (height of the "Libur" bar) */
    totalStudents?: number;
    /** ISO date (YYYY-MM-DD) used to render the weekday in tooltips */
    date?: string;
}

interface Props {
    data: ChartDataPoint[];
    /** bar = multi series; line = multi series; rate = single attendance % trend (Figma admin); stacked = 5-series stacked bar */
    type?: "bar" | "line" | "rate" | "stacked";
    height?: number;
    /** Render an extra "Libur" (solid gray) bar for past non-school days */
    showHolidayBar?: boolean;
}

const capitalizeFirst = (s: string): string =>
    s.length > 0 ? s.charAt(0).toUpperCase() + s.slice(1) : s;

const weekdayOf = (dateStr?: string): string =>
    dateStr
        ? new Intl.DateTimeFormat("id-ID", { weekday: "long", timeZone: "UTC" }).format(new Date(dateStr))
        : "";

export default function AttendanceChart({ data, type = "bar", height = 300, showHolidayBar = false }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<Chart | null>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        if (chartRef.current) {
            chartRef.current.destroy();
        }

        const isRate = type === "rate";
        const isLine = type === "line" || isRate;
        const isStacked = type === "stacked";

        const holidayData = data.map((d) =>
            d.isNonSchool && d.isPast ? d.totalStudents ?? 0 : null,
        );

        const datasets = isStacked
            ? [
                  {
                      label: "Tepat Waktu",
                      data: data.map((d) => (d.isNonSchool ? null : d.present)),
                      backgroundColor: "#14b8a6",
                      borderRadius: 2,
                  },
                  {
                      label: "Terlambat",
                      data: data.map((d) => (d.isNonSchool ? null : d.late)),
                      backgroundColor: "#f59e0b",
                      borderRadius: 2,
                  },
                  {
                      label: "Izin",
                      data: data.map((d) => (d.isNonSchool ? null : d.permission ?? 0)),
                      backgroundColor: "#1e3a5f",
                      borderRadius: 2,
                  },
                  {
                      label: "Izin Tertunda",
                      data: data.map((d) => (d.isNonSchool ? null : d.pending ?? 0)),
                      backgroundColor: "#0EA5E9",
                      borderRadius: 2,
                  },
                  {
                      label: "Sakit",
                      data: data.map((d) => (d.isNonSchool ? null : d.sick ?? 0)),
                      backgroundColor: "#a855f7",
                      borderRadius: 2,
                  },
                  {
                      label: "Alpa",
                      data: data.map((d) => (d.isNonSchool ? null : d.absent ?? 0)),
                      backgroundColor: "#ef4444",
                      borderRadius: 2,
                  },
                  ...(showHolidayBar
                      ? [
                            {
                                label: "Libur",
                                data: holidayData,
                                backgroundColor: "#94A3B8",
                                borderRadius: 2,
                            },
                        ]
                      : []),
              ]
            : isRate
              ? [
                    {
                        label: "Rata-rata Kehadiran (%)",
                        data: data.map((d) => {
                            if (typeof d.rate === "number") return d.rate;
                            if (d.rate === null) return null;
                            const total = d.present + d.late + (d.absent ?? 0);
                            if (total <= 0) return null;
                            return Math.round(((d.present + d.late) / total) * 1000) / 10;
                        }),
                        backgroundColor: "rgba(46, 51, 145, 0.12)",
                        borderColor: "#2E3391",
                        borderWidth: 2.5,
                        fill: true,
                        tension: 0.3,
                        cubicInterpolationMode: "monotone" as const,
                        pointRadius: 2,
                        pointHoverRadius: 5,
                        pointBackgroundColor: "#2E3391",
                        spanGaps: false,
                    },
                ]
              : [
                    {
                        label: "Hadir",
                        data: data.map((d) => d.present),
                        backgroundColor: isLine ? "transparent" : "#22c55e",
                        borderColor: "#22c55e",
                        borderWidth: 2,
                        fill: false,
                        tension: 0.3,
                        cubicInterpolationMode: "monotone" as const,
                        pointRadius: 4,
                        pointBackgroundColor: "#22c55e",
                        borderRadius: isLine ? 0 : 4,
                    },
                    {
                        label: "Terlambat",
                        data: data.map((d) => d.late),
                        backgroundColor: isLine ? "transparent" : "#f59e0b",
                        borderColor: "#f59e0b",
                        borderWidth: 2,
                        fill: false,
                        tension: 0.3,
                        cubicInterpolationMode: "monotone" as const,
                        pointRadius: 4,
                        pointBackgroundColor: "#f59e0b",
                        borderRadius: isLine ? 0 : 4,
                    },
                ];

        chartRef.current = new Chart(canvasRef.current, {
            type: isLine ? "line" : "bar",
            data: {
                labels: data.map((d) => d.label),
                datasets,
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: {
                        top: 10,
                        right: 6,
                        bottom: 0,
                        left: 0,
                    },
                },
                plugins: {
                    legend: {
                        display: !isRate,
                        position: "bottom",
                    },
                    tooltip: {
                        callbacks: {
                            title: (items) => {
                                const item = items[0];
                                if (!item) return "";
                                const dp = data[item.dataIndex];
                                if (!dp) return item.label;
                                const day = weekdayOf(dp.date);
                                const headline = [day, dp.label].filter(Boolean).join(" ");
                                if (dp.isNonSchool) {
                                    return headline ? `${headline} — Hari non-aktif` : "Hari non-aktif";
                                }
                                return headline || item.label;
                            },
                            label: (ctx) => {
                                const dp = data[ctx.dataIndex];
                                if (dp?.isNonSchool) {
                                    const isLibur = ctx.dataset.label === "Libur";
                                    const note = dp.note ? ` ${capitalizeFirst(dp.note)}` : "";
                                    return isLibur ? note : "";
                                }
                                const val = ctx.parsed.y;
                                if (val === null || val === undefined) return " Belum ada data";
                                if (isRate) return ` ${val}%`;
                                return ` ${ctx.dataset.label}: ${val}`;
                            },
                        },
                    },
                },
                scales: {
                    x: {
                        stacked: isStacked,
                        grid: { display: false },
                        ticks: {
                            color: "#94A3B8",
                            font: { size: 11, family: "Inter" },
                            maxRotation: 45,
                        },
                    },
                    y: {
                        stacked: isStacked,
                        beginAtZero: true,
                        max: isRate ? 100 : undefined,
                        suggestedMax: isRate ? 100 : undefined,
                        ticks: {
                            stepSize: isRate ? 20 : undefined,
                            precision: 0,
                            color: "#94A3B8",
                            font: { size: 11, family: "Inter" },
                            callback: (value) => (isRate ? `${value}%` : String(value)),
                        },
                        grid: {
                            color: "rgba(148, 163, 184, 0.2)",
                        },
                    },
                },
            },
        });

        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
            }
        };
    }, [data, type, showHolidayBar]);

    return (
        <div style={{ height: `${height}px`, width: "100%" }}>
            <canvas ref={canvasRef} aria-label="Grafik tren kehadiran" />
        </div>
    );
}
