"use client";

import React, { useState } from "react";
import { usePaymentStatistics } from "@/hooks/use-payment-statistics";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, TrendingUp, Users } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { MemberPaymentStatistics } from "@/hooks/use-payment-statistics";
import PaymentStatusModal from "./PaymentStatusModal";

interface PaymentStatisticsTableProps {
  eschoolId?: number;
}

const PaymentStatisticsTable: React.FC<PaymentStatisticsTableProps> = ({
  eschoolId,
}) => {
  const { members, eschool, isLoading, error } =
    usePaymentStatistics(eschoolId);
  const [selectedMember, setSelectedMember] =
    useState<MemberPaymentStatistics | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handleViewDetails = (member: MemberPaymentStatistics) => {
    setSelectedMember(member);
    setShowPaymentModal(true);
  };

  const getPaymentStatusColor = (percentage: number) => {
    if (percentage >= 100) return "bg-green-500";
    if (percentage >= 75) return "bg-yellow-500";
    if (percentage >= 50) return "bg-orange-500";
    return "bg-red-500";
  };

  const getPaymentStatusText = (percentage: number) => {
    if (percentage >= 100) return "Lunas";
    if (percentage >= 75) return "Hampir Lunas";
    if (percentage >= 50) return "Setengah";
    return "Belum Bayar";
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Statistik Pembayaran
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Statistik Pembayaran
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-500">
            Error loading payment statistics: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalMembers = members.length;
  // Calculate summary based on recent payment activity
  const membersWithRecentPayments = members.filter(
    (m: MemberPaymentStatistics) => m.periods && m.periods.length > 0
  ).length;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Statistik Pembayaran - {eschool?.name}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Iuran Bulanan: {formatCurrency(eschool?.monthly_fee_amount || 0)}
          </p>
        </CardHeader>
        <CardContent>
          {/* Summary Stats - Simplified */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {totalMembers}
              </div>
              <div className="text-sm text-muted-foreground">Total Member</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {membersWithRecentPayments}
              </div>
              <div className="text-sm text-muted-foreground">Aktif Bayar</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(eschool?.monthly_fee_amount || 0)}
              </div>
              <div className="text-sm text-muted-foreground">
                Iuran per Bulan
              </div>
            </div>
          </div>

          {/* Members Table - Simplified */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Kelas</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member: MemberPaymentStatistics) => (
                  <TableRow key={member.member_id}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{member.member_name}</div>
                        <div className="text-sm text-muted-foreground">
                          Iuran: {formatCurrency(member.monthly_fee)}/bulan
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{member.student_id || "-"}</TableCell>
                    <TableCell>
                      {member.grade_level ? `Kelas ${member.grade_level}` : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(member)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Lihat Status Pembayaran
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {members.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Belum ada data pembayaran member</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Details Modal */}
      <PaymentStatusModal
        member={selectedMember}
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setSelectedMember(null);
        }}
      />
    </>
  );
};

export default PaymentStatisticsTable;
