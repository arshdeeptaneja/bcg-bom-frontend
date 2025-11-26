/**
 * The RoleAcceptanceGraph component in React renders a pie chart with custom labels and colors based
 * on the provided chart data.
 * @returns The `RoleAcceptanceGraph` component is being returned. It is a functional component that
 * renders a pie chart using the `PieChart`, `Pie`, and `Cell` components from the `recharts` library.
 * The component takes `chartData` and `total` as props, processes the data to create the pie chart,
 * and renders it within a `ResponsiveContainer`.
 */

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import './RoleAcceptanceGraph.css';

const COLORS = ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e']; // main colors
const LIGHT_COLORS = ['#c7d0f9', '#a8f0d3', '#a0e3f2', '#fceab3']; // lighter shades

const renderCustomLabel = ({ cx, cy, midAngle, outerRadius, name, value }) => {
  const RADIAN = Math.PI / 180;
  const labelRadius = outerRadius + 20;
  const x = cx + labelRadius * Math.cos(-midAngle * RADIAN);
  const y = cy + labelRadius * Math.sin(-midAngle * RADIAN);
  const textAnchor = x > cx ? 'start' : 'end';

  return (
    <>
      <text x={x} y={y} textAnchor={textAnchor} fill="#333" fontSize={12} fontWeight="bold">
        {name}
      </text>
      <text x={x} y={y} dy={16} textAnchor={textAnchor} fill="#999" fontSize={10}>
        ({value})
      </text>
    </>
  );
};

export default function RoleAcceptanceGraph({ chartData, total }) {
  console.log(total, "chartDatachartData")

  const pieData = chartData?.map(item => ({
    name: item.KRA_CATEGORY,
    value: item.KRASUM,
  }));

  return (
    <div style={{ width: '100%', height: 280 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            dataKey="value"
            fill="#8884d8"
            label={renderCustomLabel} // labels always visible
            isAnimationActive={false} // no slice animation
            focusable={false}
             tabIndex={-1}
          >
            {pieData?.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                stroke={LIGHT_COLORS[index % LIGHT_COLORS.length]}
                strokeWidth={1}
              />
            ))}
          </Pie>

          {/* Total in center */}
          {/* <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={24}
            fontWeight="bold"
            fill="#4e73df"
          >
            {total}
          </text> */}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
