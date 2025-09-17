"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { 
  CreditCard, 
  CheckCircle, 
  Clock,
  Download
} from "lucide-react";
import { useMemberKas, useExportKas } from "@/hooks/use-member-profile";
import { Badge } from "@/components/ui/badge";

interface KasTableProps {
  eschools: any[];
}

const KasTable: React.FC<KasTableProps> = ({ eschools }) => {
  const [selectedEschool, setSelectedEschool] = useState<number | "all">("all");
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  
  const { exportKas } = useExportKas();
  
  // Tentukan eschool_id untuk query (undefined jika "all")
  const eschoolId = selectedEschool === "all" ? undefined : selectedEschool;
  
  const { data: kasData, isLoading, isError } = useMemberKas(eschoolId, page, perPage);

  const handleExport = async () => {
    await exportKas(eschoolId);
  };

  // Helper function untuk format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Kas Payment Records
              </CardTitle>
              <CardDescription>
                Your kas payment records across eschools
              </CardDescription>
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-32" />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Eschool</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Paid Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-between items-center mt-4">
            <Skeleton className="h-4 w-32" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Kas Payment Records
          </CardTitle>
          <CardDescription>
            Error loading kas payment records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Failed to load kas payment records. Please try again later.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Kas Payment Records
            </CardTitle>
            <CardDescription>
              Your kas payment records across eschools
            </CardDescription>
          </div>
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Select
            value={selectedEschool.toString()}
            onValueChange={(value) => {
              setSelectedEschool(value === "all" ? "all" : parseInt(value));
              setPage(1); // Reset ke halaman 1 saat filter berubah
            }}
          >
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Filter by eschool" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Eschools</SelectItem>
              {eschools.map((eschool) => (
                <SelectItem key={eschool.id} value={eschool.id.toString()}>
                  {eschool.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {kasData?.data && kasData.data.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Eschool</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Paid Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kasData.data.map((kas: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {kas.eschool_name}
                    </TableCell>
                    <TableCell>{kas.description}</TableCell>
                    <TableCell>
                      {format(new Date(kas.date), "dd MMM yyyy", { locale: id })}
                    </TableCell>
                    <TableCell>
                      {kas.month}/{kas.year}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(kas.amount)}
                    </TableCell>
                    <TableCell>
                      {kas.is_paid ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Paid
                        </Badge>
                      ) : (
                        <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {kas.paid_date ? (
                        format(new Date(kas.paid_date), "dd MMM yyyy", { locale: id })
                      ) : (
                        "-"
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {kasData.from} to {kasData.to} of {kasData.total} records
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === kasData.last_page}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            {selectedEschool === "all" 
              ? "You don't have any kas payment records yet." 
              : "No kas payment records found for the selected eschool."}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default KasTable;