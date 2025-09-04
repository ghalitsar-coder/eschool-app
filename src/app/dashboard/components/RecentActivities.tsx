"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

interface RecentActivity {
  type: 'kas_transaction' | 'attendance' | 'role_assignment';
  eschool_name: string;
  description: string;
  amount?: number;
  date: string;
  role_context: string;
}

interface RecentActivitiesProps {
  activities: RecentActivity[];
  formatCurrency: (amount: number) => string;
}

const RecentActivities: React.FC<RecentActivitiesProps> = ({ activities, formatCurrency }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Recent Activities
        </CardTitle>
        <CardDescription>
          Your latest activities across eschools
        </CardDescription>
      </CardHeader>
      <CardContent>
        {activities?.length > 0 ? (
          <div className="space-y-4">
            {activities.slice(0, 5).map((activity, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{activity.eschool_name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                  </div>
                  <Badge variant="outline">{activity.role_context}</Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Type</p>
                    <p className="font-medium capitalize">{activity.type.replace('_', ' ')}</p>
                  </div>
                  {activity.amount && (
                    <div>
                      <p className="text-muted-foreground">Amount</p>
                      <p className="font-medium">{formatCurrency(activity.amount)}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-muted-foreground">Date</p>
                    <p className="font-medium">
                      {new Date(activity.date).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">
            No recent activities found.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivities;