import { useEffect, useRef } from "react";
import {
    Chart,
    BarController,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
} from "chart.js";

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

interface ChartData {
    label: string;
    hadir: number;
    terlambat: number;
}

interface Props {
    data: ChartData[];
    title: string;
}

export default function AttendanceChart({ data, title }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<Chart | null>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        if (chartRef.current) {
            chartRef.current.destroy();
        }

        chartRef.current = new Chart(canvasRef.current, {
            type: "bar",
            data: {
                labels: data.map((d) => d.label),
                datasets: [
                    {
                        label: "Hadir",
                        data: data.map((d) => d.hadir),
                        backgroundColor: "#22c55e",
                        borderRadius: 4,
                    },
                    {
                        label: "Terlambat",
                        data: data.map((d) => d.terlambat),
                        backgroundColor: "#f59e0b",
                        borderRadius: 4,
                    },
                ],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: "bottom" },
                    title: { display: true, text: title },
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
    }, [data, title]);

    return <canvas ref={canvasRef} />;
}
