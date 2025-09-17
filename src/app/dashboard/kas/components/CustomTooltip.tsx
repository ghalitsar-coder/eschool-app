"use client";

import React from "react";

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-200 rounded shadow">
        <p className="font-bold text-gray-800">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="text-gray-700">
            {entry.name}: Rp {Number(entry.value).toLocaleString()}
          </p>
        ))}
      </div>
    );
  }

  return null;
};

export default CustomTooltip;