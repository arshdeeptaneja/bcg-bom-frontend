  // If want to show on Hover this code 

// import React, { useState } from 'react';
// import { PieChart, Pie, Sector, ResponsiveContainer,Cell } from 'recharts';
// import './RoleAcceptanceGraph.css';

// // Add colors for each slice
// const COLORS = ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e']; // main colors
// const LIGHT_COLORS = ['#c7d0f9', '#a8f0d3', '#a0e3f2', '#fceab3']; // lighter shades

//   // WITHOUT HOVER  



// const renderActiveShape = (props) => {
//   const {
//     cx,
//     cy,
//     midAngle,
//     innerRadius,
//     outerRadius,
//     startAngle,
//     endAngle,
//     fill,
//     payload,
//     percent,
//     value,
//   } = props;

//   const RADIAN = Math.PI / 180;

//   // Point for label outside the slice
//   const labelRadius = outerRadius + 30; // 20px outside slice
//   const x = cx + labelRadius * Math.cos(-midAngle * RADIAN);
//   const y = cy + labelRadius * Math.sin(-midAngle * RADIAN);

//   // Arrow line start: outer edge of slice
//   const sx = cx + outerRadius * Math.cos(-midAngle * RADIAN);
//   const sy = cy + outerRadius * Math.sin(-midAngle * RADIAN);

//   // Arrow line middle (optional bending)
//   const mx = cx + (outerRadius + 10) * Math.cos(-midAngle * RADIAN);
//   const my = cy + (outerRadius + 10) * Math.sin(-midAngle * RADIAN);

//   const textAnchor = x > cx ? 'start' : 'end'; // auto left/right adjustment

//   return (
    
//       <g>
//       {/* Pie slice */}
//       <Sector
//         cx={cx}
//         cy={cy}
//         innerRadius={innerRadius}
//         outerRadius={outerRadius}
//         startAngle={startAngle}
//         endAngle={endAngle}
//         fill={fill}
//       />

//       {/* Arrow line */}
//       <path d={`M${sx},${sy} L${mx},${my} L${x},${y}`} stroke={fill} fill="none" />
//       <circle cx={x} cy={y} r={2} fill={fill} stroke="none" />

//       {/* Label */}
//       <text x={x} y={y}  dy={13} textAnchor={textAnchor} fill="#333" fontSize={12} fontWeight="bold">
//         {payload.name}
//       </text>
//       <text x={x} y={y} dy={30} textAnchor={textAnchor} fill="#999" fontSize={10}>
//        ( {value} )
//       </text>
//     </g>
//   );
// };

// export default function RoleAcceptanceGraph(props) {
//   const { chartData, total } = props;
//   const [activeIndex, setActiveIndex] = useState(null);

//   const onPieEnter = (_, index) => {
//     setActiveIndex(index);
//   };

//   const pieData = chartData?.map(item => ({
//     name: item.KRA_CATEGORY,
//     value: item.KRASUM,
//   }));

//   return (
//     <div style={{ width: '100%', height: 280 }}>
//       <ResponsiveContainer>
//         <PieChart>
//           <Pie
//             data={pieData}
//             cx="50%"
//             cy="50%"
//             innerRadius={60}
//             outerRadius={80}
//             fill="#8884d8"
//             dataKey="value"
//             activeIndex={activeIndex}
//             activeShape={renderActiveShape}
//             onMouseEnter={onPieEnter}
//             onMouseLeave={() => setActiveIndex(null)} 
//             onFocus={() => setActiveIndex(null)} 
//             >
//             {pieData?.map((entry, index) => (
//               <Cell
//                 key={`cell-${index}`}
//                 fill={COLORS[index % COLORS.length]}
//                 stroke={LIGHT_COLORS[index % LIGHT_COLORS.length]}
//                 strokeWidth={1}
//               />
//             ))}
//           </Pie>
//           {/* Total in center */}
//           <text
//             x="50%"
//             y="50%"
//             textAnchor="middle"
//             dominantBaseline="middle"
//             fontSize={24}
//             fontWeight="bold"
//             fill="#4e73df"
//           >
//             {total}
//           </text>
//         </PieChart>
//       </ResponsiveContainer>
//     </div>
//   );
// }



//  If Dont want hover effect below code 

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
