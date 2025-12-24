"use client";

import { useEffect, useMemo, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

export default function RevenueCharts() {
  const now = new Date();

  const [mode, setMode] = useState("month"); // day | week | month
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const [data, setData] = useState(null);

  // danh sách năm (vd: 2022 -> năm hiện tại)
  const years = useMemo(() => {
    const arr = [];
    for (let y = now.getFullYear(); y >= now.getFullYear() - 5; y--)
      arr.push(y);
    return arr;
  }, [now]);

  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);

  useEffect(() => {
    const qs = new URLSearchParams({
      type: mode,
      year: String(year),
      month: String(month),
    });

    fetch(`/api/admin/revenue?${qs.toString()}`)
      .then((res) => res.json())
      .then(setData);
  }, [mode, year, month]);

  if (!data) return null;

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: "Doanh thu (VND)",
        data: data.values,
        borderColor: "#b38a6a",
        backgroundColor: "rgba(179,138,106,0.3)",
      },
    ],
  };

  return (
    <div className="box-white" style={{ marginTop: "3rem" }}>
      <div className="dashboard-head">
        <h3 className="tt-sec">Thống kê doanh thu</h3>

        {/* Dropdown */}
        <div className="dashboard-selects">
          {/* Chỉ cần chọn tháng khi xem theo ngày */}
          {mode === "day" && (
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {months.map((m) => (
                <option key={m} value={m}>
                  Tháng {m}
                </option>
              ))}
            </select>
          )}
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                Năm {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="dashboard-filter">
        <button
          className={mode === "day" ? "active" : ""}
          onClick={() => setMode("day")}
        >
          Ngày (theo tháng)
        </button>
        <button
          className={mode === "week" ? "active" : ""}
          onClick={() => setMode("week")}
        >
          Tuần (theo năm)
        </button>
        <button
          className={mode === "month" ? "active" : ""}
          onClick={() => setMode("month")}
        >
          Tháng (theo năm)
        </button>
      </div>

      {/* Chart */}
      <div className="chart-wrapper">
        <Line
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
          }}
        />
      </div>
    </div>
  );
}
