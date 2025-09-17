"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Calendar, Users, User, CreditCard, Clock } from "lucide-react";
import { Eschool } from "@/types/api";

interface DialogEschoolDetailProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  eschool: Eschool | null;
}

const DialogEschoolDetail: React.FC<DialogEschoolDetailProps> = ({
  isOpen,
  onOpenChange,
  eschool,
}) => {
  if (!eschool) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{eschool.name}</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Informasi Eschool
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={eschool.is_active ? "default" : "secondary"}>
                  {eschool.is_active ? "Aktif" : "Tidak Aktif"}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Jumlah Anggota</span>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{eschool.members_count} orang</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Iuran Bulanan</span>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  <span>Rp {parseInt(eschool.monthly_kas_amount).toLocaleString("id-ID")}</span>
                </div>
              </div>
              
              <div>
                <span className="text-muted-foreground">Deskripsi</span>
                <p className="mt-1">{eschool.description || "-"}</p>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Koordinator
                </CardTitle>
              </CardHeader>
              <CardContent>
                {eschool.coordinator ? (
                  <div className="space-y-2">
                    <p className="font-medium">{eschool.coordinator.name}</p>
                    <p className="text-sm text-muted-foreground">{eschool.coordinator.email}</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">Belum ditentukan</p>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Bendahara
                </CardTitle>
              </CardHeader>
              <CardContent>
                {eschool.treasurer ? (
                  <div className="space-y-2">
                    <p className="font-medium">{eschool.treasurer.name}</p>
                    <p className="text-sm text-muted-foreground">{eschool.treasurer.email}</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">Belum ditentukan</p>
                )}
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Jadwal
              </CardTitle>
            </CardHeader>
            <CardContent>
              {eschool.schedule_days && eschool.schedule_days.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {eschool.schedule_days.map((day: string, index: number) => (
                    <Badge key={index} variant="outline">
                      {day}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground italic">Jadwal belum ditentukan</p>
              )}
            </CardContent>
          </Card>
          
          <div className="flex justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>Dibuat: {new Date(eschool.created_at).toLocaleDateString("id-ID")}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>Diubah: {new Date(eschool.updated_at).toLocaleDateString("id-ID")}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DialogEschoolDetail;