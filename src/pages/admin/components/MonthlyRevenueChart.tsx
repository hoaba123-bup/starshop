import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface MonthlyPoint {
  month: string;
  revenue: number;
}

interface Props {
  data: MonthlyPoint[];
}

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

const MonthlyRevenueChart: React.FC<Props> = ({ data }) => {
  const normalized = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach((item) => {
      map.set(item.month, Number(item.revenue || 0));
    });

    const months: { label: string; value: number }[] = [];
    const now = new Date();
    for (let i = 11; i >= 0; i -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const key = `${year}-${String(month).padStart(2, "0")}`;
      const label = `T${month}/${String(year).slice(-2)}`;
      months.push({
        label,
        value: map.get(key) ?? 0,
      });
    }
    return months;
  }, [data]);

  const chartData = {
    labels: normalized.map((item) => item.label),
    datasets: [
      {
        label: "Doanh thu",
        data: normalized.map((item) => item.value),
        borderRadius: 8,
        backgroundColor: "rgba(99, 102, 241, 0.8)",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) =>
            ` ${currencyFormatter.format(Number(context.parsed.y || 0))}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => currencyFormatter.format(Number(value)),
          font: { size: 11 },
        },
        grid: {
          color: "rgba(148, 163, 184, 0.2)",
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: { size: 11 },
        },
      },
    },
  } as const;

  return (
    <div className="h-72">
      <Bar options={options} data={chartData} />
    </div>
  );
};

export default MonthlyRevenueChart;
