"use client";

import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import CustomTooltip from "./CustomTooltip";
import { Skeleton } from "@/components/ui/skeleton";

interface FinancialChartsProps {
  summary?: {
    summary: {
      total_income: number;
      total_expense: number;
    };
  };
  records?: any[];
  isLoading?: boolean;
  error?: any;
}

const FinancialCharts: React.FC<FinancialChartsProps> = ({ 
  summary, 
  records = [],
  isLoading = false,
  error 
}) => {
  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-muted/50 p-4 rounded-lg">
            <Skeleton className="h-6 w-48 mb-4" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="bg-muted/50 p-4 rounded-lg">
            <Skeleton className="h-6 w-48 mb-4" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-muted/50 p-4 rounded-lg">
            <Skeleton className="h-6 w-48 mb-4" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="bg-muted/50 p-4 rounded-lg">
            <Skeleton className="h-6 w-48 mb-4" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
        <div className="bg-muted/50 p-4 rounded-lg">
          <Skeleton className="h-6 w-48 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-red-500">
        Error loading chart data: {error.message || "Unknown error"}
      </div>
    );
  }

  // Check if required data is available
  if (!summary || !records) {
    return (
      <div className="text-muted-foreground">
        No data available for charts
      </div>
    );
  }

  // Generate monthly data from real records
  const monthlyData = useMemo(() => {
    // Initialize data for all 12 months
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = months.map((month, index) => ({
      month,
      income: 0,
      expense: 0,
      balance: 0,
    }));

    // Process real records
    if (Array.isArray(records)) {
      records.forEach(record => {
        if (!record || !record.date) return;
        
        const date = new Date(record.date);
        const monthIndex = date.getMonth(); // 0-11
        
        if (monthIndex >= 0 && monthIndex < 12) {
          if (record.type === 'income') {
            data[monthIndex].income += (record.amount || 0);
          } else if (record.type === 'expense') {
            data[monthIndex].expense += (record.amount || 0);
          }
          data[monthIndex].balance = data[monthIndex].income - data[monthIndex].expense;
        }
      });
    }

    return data;
  }, [records]);

  // Generate data for income vs expense pie chart
  const incomeVsExpenseData = useMemo(() => [
    { name: 'Income', value: summary?.summary?.total_income || 0 },
    { name: 'Expense', value: summary?.summary?.total_expense || 0 },
  ], [summary]);

  // Generate data for expense categories from real records
  const expenseCategoriesData = useMemo(() => {
    const categoryMap: Record<string, number> = {};
    
    // Process real expense records
    if (Array.isArray(records)) {
      records.forEach(record => {
        if (record && record.type === 'expense') {
          const category = record.category || 'Uncategorized';
          categoryMap[category] = (categoryMap[category] || 0) + (record.amount || 0);
        }
      });
    }
    
    // Convert to array format for chart
    return Object.entries(categoryMap).map(([name, value]) => ({
      name,
      value
    }));
  }, [records]);

  // Generate data for member contributions from real records
  const memberContributionsData = useMemo(() => {
    const memberMap: Record<string, number> = {};
    
    // Process real income records
    if (Array.isArray(records)) {
      records.forEach(record => {
        if (record && record.type === 'income' && Array.isArray(record.payments)) {
          record.payments.forEach((payment: any) => {
            if (payment) {
              const memberName = payment.member_name || 'Unknown Member';
              memberMap[memberName] = (memberMap[memberName] || 0) + (payment.amount || 0);
            }
          });
        }
      });
    }
    
    // Convert to array format for chart and sort by contribution
    return Object.entries(memberMap)
      .map(([name, contribution]) => ({
        name,
        contribution
      }))
      .sort((a, b) => b.contribution - a.contribution)
      .slice(0, 10); // Top 10 contributors
  }, [records]);

  // Colors for charts
  const COLORS = ['#10B981', '#EF4444', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899'];
  const PIE_COLORS = ['#10B981', '#EF4444'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expense Pie Chart */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-center">Income vs Expense</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={incomeVsExpenseData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {incomeVsExpenseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`Rp ${Number(value).toLocaleString()}`, 'Amount']}
                labelFormatter={(name) => name}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Trends Line Chart */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-center">Monthly Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={monthlyData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 50,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                tickFormatter={(value) => `Rp ${(value / 1000000).toFixed(0)}M`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#10B981"
                activeDot={{ r: 8 }}
                name="Income"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="expense"
                stroke="#EF4444"
                name="Expense"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Categories */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-center">Expense Categories</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={expenseCategoriesData}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {expenseCategoriesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`Rp ${Number(value).toLocaleString()}`, 'Amount']}
                labelFormatter={(name) => name}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Member Contributions */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-center">Top Member Contributions</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={memberContributionsData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis 
                tickFormatter={(value) => `Rp ${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="contribution" fill="#3B82F6" name="Contribution" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Balance Trend */}
      <div className="bg-muted/50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 text-center">Balance Trend Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={monthlyData}
            margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis 
              tickFormatter={(value) => `Rp ${(value / 1000000).toFixed(0)}M`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="balance" 
              stroke="#8B5CF6" 
              fill="#8B5CF6" 
              fillOpacity={0.3} 
              name="Balance"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FinancialCharts;