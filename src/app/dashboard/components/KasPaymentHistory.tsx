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
import { Wallet, PieChart } from "lucide-react";

interface KasStatsProps {
  data: {
    name: string;
    paid: number;
    target: number;
    collectionRate: number;
  }[];
  formatCurrency: (amount: number) => string;
}

const KasPaymentHistory: React.FC<KasStatsProps> = ({ data, formatCurrency }) => {
  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded shadow">
          <p className="font-bold">{label}</p>
          <p style={{ color: payload[0].color }}>
            Paid: {formatCurrency(payload[0].value)}
          </p>
          <p style={{ color: payload[1].color }}>
            Target: {formatCurrency(payload[1].value)}
          </p>
          <p>Collection Rate: {payload[0].payload.collectionRate}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-5 w-5" />
          Kas Payment Comparison
        </CardTitle>
        <CardDescription>
          Compare your payment status across different eschools
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
            <YAxis 
              tickFormatter={(value) => `Rp ${(value / 1000).toFixed(0)}K`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="paid" name="Paid" fill="#10B981" />
            <Bar dataKey="target" name="Target" fill="#F59E0B" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default KasPaymentHistory;