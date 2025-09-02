"use client";

import React, { useState } from "react";
import HeaderEschool from "./components/HeaderEschool";
import EschoolList from "./components/EschoolList";
import ErrorEschoolAlert from "./components/ErrorEschoolAlert";
import DialogCreateEschool from "./components/DialogCreateEschool";
import DialogUpdateEschool from "./components/DialogUpdateEschool";
import DialogDeleteEschool from "./components/DialogDeleteEschool";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import FinancialAnalytics from "./components/FinancialAnalytics";
import AttendanceAnalytics from "./components/AttendanceAnalytics";
import { useEschoolManagement } from "@/hooks/use-eschool";
import { useAuth } from "@/hooks/use-auth";
import { Eschool } from "@/types/api";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  BarChart3, 
  Wallet, 
  UserCheck 
} from "lucide-react";

const EschoolManagement: React.FC = () => {
  const { user } = useAuth();
  const {
    eschools,
    isLoadingEschools,
    eschoolsError,
    createEschoolError,
    updateEschoolError,
    deleteEschoolError,
    createEschool,
    updateEschool,
    deleteEschool,
    refetchEschools,
  } = useEschoolManagement();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedEschool, setSelectedEschool] = useState<Eschool | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, financial, attendance

  const handleCreateEschool = (data: any) => {
    createEschool(data, {
      onSuccess: () => {
        setShowCreateDialog(false);
        refetchEschools();
      },
    });
  };

  const handleUpdateEschool = (id: number, data: any) => {
    updateEschool({ id, data }, {
      onSuccess: () => {
        setShowUpdateDialog(false);
        refetchEschools();
      },
    });
  };

  const handleDeleteEschool = () => {
    if (!selectedEschool) return;
    deleteEschool(selectedEschool.id, {
      onSuccess: () => {
        setShowDeleteDialog(false);
        refetchEschools();
      },
    });
  };

  const handleEdit = (eschool: Eschool) => {
    setSelectedEschool(eschool);
    setShowUpdateDialog(true);
  };

  const handleDelete = (eschool: Eschool) => {
    setSelectedEschool(eschool);
    setShowDeleteDialog(true);
  };

  // Error handling
  const hasErrors = eschoolsError || createEschoolError || updateEschoolError || deleteEschoolError;

  // Tentukan tab yang tersedia berdasarkan role
  const availableTabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "attendance", label: "Attendance", icon: UserCheck }
  ];

  // Hanya tampilkan tab financial untuk non-staff
  if (user?.role !== "staff") {
    availableTabs.splice(1, 0, { id: "financial", label: "Financial", icon: Wallet });
  }

  // Jika tab yang aktif tidak tersedia, ubah ke tab pertama
  const validActiveTab = availableTabs.some(tab => tab.id === activeTab) 
    ? activeTab 
    : availableTabs[0].id;

  return (
    <div className="flex flex-col gap-6 py-6 px-5">
      <HeaderEschool 
        setShowCreateDialog={setShowCreateDialog}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
      
      {/* Tab Navigation */}
      <div className="flex space-x-2 border-b">
        {availableTabs.map((tab) => (
          <Button
            key={tab.id}
            variant={validActiveTab === tab.id ? "default" : "ghost"}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2"
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </Button>
        ))}
      </div>

      {hasErrors && (
        <ErrorEschoolAlert
          eschoolsError={eschoolsError}
          createEschoolError={createEschoolError}
          updateEschoolError={updateEschoolError}
          deleteEschoolError={deleteEschoolError}
        />
      )}

      {/* Tab Content */}
      {validActiveTab === "dashboard" && (
        <>
          <AnalyticsDashboard />
          <Separator />
          <EschoolList
            eschools={eschools}
            isLoading={isLoadingEschools}
            onEdit={handleEdit}
            onDelete={handleDelete}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        </>
      )}

      {validActiveTab === "financial" && user?.role !== "staff" && (
        <FinancialAnalytics />
      )}

      {validActiveTab === "attendance" && (
        <AttendanceAnalytics />
      )}

      <DialogCreateEschool
        isOpen={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreate={handleCreateEschool}
        isCreating={false} // This should be connected to the mutation state
      />

      <DialogUpdateEschool
        isOpen={showUpdateDialog}
        onOpenChange={setShowUpdateDialog}
        eschool={selectedEschool}
        onUpdate={handleUpdateEschool}
        isUpdating={false} // This should be connected to the mutation state
      />

      <DialogDeleteEschool
        isOpen={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        eschool={selectedEschool}
        onDelete={handleDeleteEschool}
        isDeleting={false} // This should be connected to the mutation state
      />
    </div>
  );
};

export default EschoolManagement;