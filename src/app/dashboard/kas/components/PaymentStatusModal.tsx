"use client";

import React, { useState } from "react";
import {
  useMemberPaymentDetails,
  useMemberPeriodPayments,
} from "@/hooks/use-payment-statistics";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Check,
  AlertCircle,
  X,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  MemberPaymentStatistics,
  PaymentPeriod,
  PeriodPayment,
} from "@/hooks/use-payment-statistics";

interface PaymentStatusModalProps {
  member: MemberPaymentStatistics | null;
  isOpen: boolean;
  onClose: () => void;
}

const PaymentStatusModal: React.FC<PaymentStatusModalProps> = ({
  member,
  isOpen,
  onClose,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<{
    month: string;
    year: number;
  } | null>(null);

  const { data: memberDetails, isLoading: isLoadingDetails } =
    useMemberPaymentDetails(member?.member_id);

  const { data: periodPayments, isLoading: isLoadingPeriod } =
    useMemberPeriodPayments(
      member?.member_id,
      selectedPeriod?.month,
      selectedPeriod?.year
    );

  const getMonthName = (month: string) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return months[parseInt(month) - 1] || month;
  };

  const getPaymentStatusColor = (percentage: number) => {
    if (percentage >= 100) return "border-green-200 bg-green-50";
    if (percentage > 0) return "border-yellow-200 bg-yellow-50";
    return "border-red-200 bg-red-50";
  };

  const getPaymentStatusBadge = (percentage: number) => {
    if (percentage >= 100) {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          <Check className="w-3 h-3 mr-1" />
          Paid
        </Badge>
      );
    }
    if (percentage > 0) {
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          <AlertCircle className="w-3 h-3 mr-1" />
          {percentage.toFixed(0)}%
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="bg-red-100 text-red-800">
        <X className="w-3 h-3 mr-1" />
        Unpaid
      </Badge>
    );
  };

  const handlePeriodClick = (period: { month: string; year: number }) => {
    setSelectedPeriod(period);
  };

  if (!member) return null;

  return (
    <Dialog open={isOpen}  onOpenChange={onClose}  >
      <DialogContent   className="max-w-5xl w-[90vw]  "
        style={{ 
          width: '90vw', 
          maxWidth: '64rem',
        }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Payment Status - {member.member_name}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="  ">
          {isLoadingDetails ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-6  ">
              {/* Member Info */}
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2  gap-6">
                    <div className="text-center p-4">
                      <div className="text-3xl font-bold text-blue-600">
                        {formatCurrency(
                          memberDetails?.data?.payment_summary?.total_paid || 0
                        )}
                      </div>
                      <div className="text-base text-muted-foreground mt-2">
                        Total Dibayar
                      </div>
                    </div>
                    <div className="text-center p-4">
                      <div className="text-3xl font-bold text-green-600">
                        {memberDetails?.data?.payment_summary
                          ?.total_months_paid || 0}
                      </div>
                      <div className="text-base text-muted-foreground mt-2">
                        Bulan Dibayar
                      </div>
                    </div>
                    <div className="text-center p-4">
                      <div className="text-3xl font-bold text-purple-600">
                        {formatCurrency(
                          memberDetails?.data?.member?.eschool
                            ?.monthly_fee_amount || 0
                        )}
                      </div>
                      <div className="text-base text-muted-foreground mt-2">
                        Iuran per Bulan
                      </div>
                    </div>
                    <div className="text-center p-4">
                      <div className="text-3xl font-bold text-orange-600">
                        {memberDetails?.data?.payment_summary?.periods
                          ?.length || 0}
                      </div>
                      <div className="text-base text-muted-foreground mt-2">
                        Periode Aktif
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Status Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3   gap-4 w-full bg-blue-300">
                {memberDetails?.data?.payment_summary?.periods?.map(
                  (period: PaymentPeriod) => (
                    <Card
                      key={`${period.year}-${period.month}`}
                      className={`cursor-pointer transition-all hover:shadow-md ${getPaymentStatusColor(
                        period.percentage
                      )}`}
                      onClick={() =>
                        handlePeriodClick({
                          month: period.month,
                          year: period.year,
                        })
                      }
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-medium text-gray-800">
                              {getMonthName(period.month)}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {period.percentage >= 100
                                ? "Paid in full"
                                : period.percentage > 0
                                ? "Partial payment"
                                : "Payment pending"}
                            </p>
                          </div>
                          {getPaymentStatusBadge(period.percentage)}
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between text-base">
                            <span className="text-gray-500">Dibayar:</span>
                            <span className="font-medium">
                              {formatCurrency(period.amount_paid)}
                            </span>
                          </div>
                          <div className="flex justify-between text-base">
                            <span className="text-gray-500">Target:</span>
                            <span className="font-medium">
                              {formatCurrency(period.monthly_fee)}
                            </span>
                          </div>
                          {period.remaining_amount > 0 && (
                            <div className="flex justify-between text-base text-red-600">
                              <span>Kurang:</span>
                              <span className="font-medium">
                                {formatCurrency(period.remaining_amount)}
                              </span>
                            </div>
                          )}
                          {period.payment_dates.length > 0 && (
                            <p className="text-sm text-gray-500">
                              Terakhir: {period.payment_dates[0]}
                            </p>
                          )}
                          {period.percentage > 0 && period.percentage < 100 && (
                            <div className="mt-3">
                              <Progress
                                value={period.percentage}
                                className="h-3"
                              />
                              <p className="text-sm text-center mt-2">
                                {period.percentage.toFixed(1)}% dari target
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                )}
              </div>

              {/* Period Payment Details */}
              {selectedPeriod && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">
                        Detail Pembayaran - {getMonthName(selectedPeriod.month)}{" "}
                        {selectedPeriod.year}
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedPeriod(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {isLoadingPeriod ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      </div>
                    ) : periodPayments?.data?.payments?.length > 0 ? (
                      <div className="space-y-4">
                        {/* Period Summary */}
                        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                          <div className="text-center">
                            <div className="text-lg font-bold text-blue-600">
                              {formatCurrency(
                                periodPayments.data.period.total_paid
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Total Dibayar
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-green-600">
                              {periodPayments.data.period.percentage.toFixed(1)}
                              %
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Persentase
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-purple-600">
                              {periodPayments.data.payments.length}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Jumlah Transaksi
                            </div>
                          </div>
                        </div>

                        {/* Payment List */}
                        <div className="space-y-2">
                          {periodPayments.data.payments.map(
                            (payment: PeriodPayment) => (
                              <div
                                key={payment.id}
                                className="flex items-center justify-between p-3 border rounded-lg"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-blue-100 rounded-full">
                                    <DollarSign className="h-4 w-4 text-blue-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium">
                                      {payment.kas_record.description}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {payment.kas_record.category}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium">
                                    {formatCurrency(payment.amount)}
                                  </p>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    {payment.paid_date || "Pending"}
                                  </div>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Belum ada data pembayaran untuk periode ini</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentStatusModal;
