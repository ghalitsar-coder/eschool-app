"use client";

 
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useKasManagement } from "@/hooks/use-kas";
 

const FinancialTrend = () => {
      const {  summary } = useKasManagement();
    
  return (
     <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Financial Overview</CardTitle>
            <CardDescription>
              Monthly income and expense trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800">Income Status</h3>
                <p className="text-2xl font-bold text-green-600">
                  Rp {summary.summary.total_income.toLocaleString()}
                </p>
                <p className="text-sm text-green-700">
                  Total income recorded
                </p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-semibold text-red-800">Expense Status</h3>
                <p className="text-2xl font-bold text-red-600">
                  Rp {summary.summary.total_expense.toLocaleString()}
                </p>
                <p className="text-sm text-red-700">
                  Total expenses recorded
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800">Current Balance</h3>
                <p className={`text-2xl font-bold ${summary.summary.balance >= 0 ? "text-blue-600" : "text-red-600"}`}>
                  Rp {summary.summary.balance.toLocaleString()}
                </p>
                <p className="text-sm text-blue-700">
                  {summary.summary.balance >= 0 ? "Positive" : "Negative"} financial position
                </p>
              </div>
            </div>
            
            {/* Monthly Summary */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3">Current Month Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Members Paid</p>
                  <p className="text-xl font-bold">{summary.current_month.paid_count}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Members Unpaid</p>
                  <p className="text-xl font-bold">{summary.current_month.unpaid_count}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Rate</p>
                  <p className="text-xl font-bold">{summary.current_month.payment_percentage.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
  )
}

export default FinancialTrend