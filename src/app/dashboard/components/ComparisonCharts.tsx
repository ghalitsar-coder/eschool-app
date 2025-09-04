"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { BarChart3, PieChart as PieChartIcon } from "lucide-react";

interface ComparisonChartsProps {
  attendanceData: {
    name: string;
    attendance: number;
    meetings: number;
    attended: number;
  }[];
  kasData: {
    name: string;
    paid: number;
    target: number;
    collectionRate: number;
  }[];
  roleDistributionData: {
    name: string;
    value: number;
  }[];
  formatCurrency: (amount: number) => string;
}

const ComparisonCharts: React.FC<ComparisonChartsProps> = ({ 
  attendanceData, 
  kasData, 
  roleDistributionData,
  formatCurrency 
}) => {
  // COLORS for charts
  const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6"];

  // Custom tooltip for attendance chart
  const AttendanceTooltip = ({ active, payload, label }: any) => {
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

  // Custom tooltip for kas chart
  const KasTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded shadow">
          <p className="font-bold">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
          <p>
            Collection Rate: {
              kasData.find(d => d.name === label)?.collectionRate || 0
            }%
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for role distribution
  const RoleDistributionTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded shadow">
          <p className="font-bold">{payload[0].name}</p>
          <p>Count: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Attendance Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Attendance Comparison
          </CardTitle>
          <CardDescription>
            Your attendance rate across different eschools
          </CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={attendanceData}
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
              <Tooltip content={<AttendanceTooltip />} />
              <Legend />
              <Bar dataKey="attendance" name="Attendance Rate" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Kas Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5" />
            Kas Payment Comparison
          </CardTitle>
          <CardDescription>
            Your payment status across different eschools
          </CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={kasData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                tickFormatter={(value) => `Rp ${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip content={<KasTooltip />} />
              <Legend />
              <Bar dataKey="paid" name="Paid" fill="#10B981" />
              <Bar dataKey="target" name="Target" fill="#F59E0B" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Role Distribution Chart */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5" />
            Role Distribution
          </CardTitle>
          <CardDescription>
            Distribution of your roles across eschools
          </CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={roleDistributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {roleDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<RoleDistributionTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComparisonCharts;