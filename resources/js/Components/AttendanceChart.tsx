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
    /** Optional precomputed attendance rate 0–100 for single-line mode */
    rate?: number;
}

interface Props {
    data: ChartDataPoint[];
    /** bar = multi series; line = multi series; rate = single attendance % trend (Figma admin) */
    type?: "bar" | "line" | "rate";
    height?: number;
}

export default function AttendanceChart({
    data,
    type = "bar",
    height = 300,
}: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<Chart | null>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        if (chartRef.current) {
            chartRef.current.destroy();
        }

        const isRate = type === "rate";
        const isLine = type === "line" || isRate;

        const datasets = isRate
            ? [
                  {
                      label: "Rata-rata Kehadiran (%)",
                      data: data.map((d) => {
                          if (typeof d.rate === "number") return d.rate;
                          const total = d.present + d.late + (d.absent ?? 0);
                          if (total <= 0) return 0;
                          return Math.round(
                              ((d.present + d.late) / total) * 1000,
                          ) / 10;
                      }),
                      backgroundColor: "rgba(46, 51, 145, 0.12)",
                      borderColor: "#2E3391",
                      borderWidth: 2.5,
                      fill: true,
                      tension: 0.4,
                      pointRadius: 0,
                      pointHoverRadius: 4,
                      pointBackgroundColor: "#2E3391",
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
                plugins: {
                    legend: {
                        display: !isRate,
                        position: "bottom",
                    },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => {
                                const val = ctx.parsed.y ?? 0;
                                if (isRate) return ` ${val}%`;
                                return ` ${ctx.dataset.label}: ${val}`;
                            },
                        },
                    },
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: {
                            color: "#94A3B8",
                            font: { size: 11, family: "Inter" },
                        },
                    },
                    y: {
                        beginAtZero: true,
                        max: isRate ? 100 : undefined,
                        ticks: {
                            stepSize: isRate ? 20 : 1,
                            color: "#94A3B8",
                            font: { size: 11, family: "Inter" },
                            callback: (value) =>
                                isRate ? `${value}%` : String(value),
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
    }, [data, type]);

    return (
        <div style={{ height: `${height}px`, width: "100%" }}>
            <canvas ref={canvasRef} aria-label="Grafik tren kehadiran" />
        </div>
    );
}
