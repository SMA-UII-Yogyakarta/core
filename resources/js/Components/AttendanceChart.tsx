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
    PointElement
);

interface ChartData {
    label: string;
    present: number;
    late: number;
    absent?: number;
}

interface Props {
    data: ChartData[];
    type?: "bar" | "line";
    height?: number;
}

export default function AttendanceChart({ data, type = "bar", height = 300 }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<Chart | null>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        if (chartRef.current) {
            chartRef.current.destroy();
        }

        const isLine = type === "line";

        chartRef.current = new Chart(canvasRef.current, {
            type: isLine ? "line" : "bar",
            data: {
                labels: data.map((d) => d.label),
                datasets: [
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
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: "bottom" },
                },
                scales: {
                    y: { beginAtZero: true, ticks: { stepSize: 1 } },
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
            <canvas ref={canvasRef} />
        </div>
    );
}
