"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { Calendar, TrendingUp } from "lucide-react";

interface AttendanceStatsProps {
  data: {
    name: string;
    attendance: number;
    meetings: number;
    attended: number;
  }[];
}

const AttendanceStatistics: React.FC<AttendanceStatsProps> = ({ data }) => {
  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded shadow">
          <p className="font-bold">{label}</p>
          <p style={{ color: payload[0].color }}>
            Attendance Rate: {payload[0].value}%
          </p>
          <p>Meetings: {payload[0].payload.meetings}</p>
          <p>Attended: {payload[0].payload.attended}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Attendance Comparison
        </CardTitle>
        <CardDescription>
          Compare your attendance rates across different eschools
        </CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis domain={[0, 100]} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="attendance" name="Attendance Rate" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default AttendanceStatistics;