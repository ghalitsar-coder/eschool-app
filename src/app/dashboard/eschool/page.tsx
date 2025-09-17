"use client";

import React, { useState } from "react";
import HeaderEschool from "./components/HeaderEschool";
import EschoolList from "./components/EschoolList";
import ErrorEschoolAlert from "./components/ErrorEschoolAlert";
import DialogCreateEschool from "./components/DialogCreateEschool";
import DialogCreateUser from "./components/DialogCreateUser";
import DialogUpdateEschool from "./components/DialogUpdateEschool";
import DialogDeleteEschool from "./components/DialogDeleteEschool";
import DialogEschoolDetail from "./components/DialogEschoolDetail";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
// FinancialAnalytics component commented out as per requirements
// import FinancialAnalytics from "./components/FinancialAnalytics";
import AttendanceAnalytics from "./components/AttendanceAnalytics";
import { useEschoolManagement } from "@/hooks/use-eschool";
import { useAuth } from "@/hooks/use-auth";
import { Eschool } from "@/types/api";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  BarChart3,
  // Wallet icon commented out as it's only used for financial tab
  // Wallet,
  UserCheck,
  UserPlus,
} from "lucide-react";
import { useCreateUser } from "@/hooks/use-user"; // Import the user hook
import { toast } from "sonner"; // Assuming you're using sonner for toast notifications
import FinancialAnalytics from "./components/FinancialAnalytics";
import { useQueryClient } from "@tanstack/react-query";
import { memberProfileQueryKeys } from "@/hooks/use-member-profile";

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
    isCreatingEschool,
    isUpdatingEschool,
    isDeletingEschool,
  } = useEschoolManagement();
  
  const createUserMutation = useCreateUser(); // Add the user creation hook

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showCreateUserDialog, setShowCreateUserDialog] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedEschool, setSelectedEschool] = useState<Eschool | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, attendance
  const queryClient = useQueryClient()
  // Remove the isCreatingUser state as we'll use the hook's state

  const handleCreateEschool = (data: any) => {
    createEschool(data, {
      onSuccess: () => {
        setShowCreateDialog(false);
        refetchEschools();
      },
    });
  };

  const handleUpdateEschool = (id: number, data: any) => {
    updateEschool(
      { id, data },
      {
        onSuccess: () => {
          setShowUpdateDialog(false);
          refetchEschools();
          queryClient.invalidateQueries({
            queryKey: memberProfileQueryKeys.profile(),
          });
        },
      }
    );
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

  const handleViewDetail = (eschool: Eschool) => {
    setSelectedEschool(eschool);
    setShowDetailDialog(true);
  };

  // Error handling
  const hasErrors =
    eschoolsError ||
    createEschoolError ||
    updateEschoolError ||
    deleteEschoolError;

  // Tentukan tab yang tersedia berdasarkan role (financial tab commented out)
  const availableTabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "attendance", label: "Attendance", icon: UserCheck },
    // Financial tab commented out as per requirements
    // { id: "financial", label: "Financial", icon: Wallet }
  ];

  // Hanya tampilkan tab financial untuk non-staff (commented out)
  // if (user?.role !== "staff") {
  //   availableTabs.splice(1, 0, { id: "financial", label: "Financial", icon: Wallet });
  // }

  // Jika tab yang aktif tidak tersedia, ubah ke tab pertama
  const validActiveTab = availableTabs.some((tab) => tab.id === activeTab)
    ? activeTab
    : availableTabs[0].id;

  return (
    <div className="flex flex-col gap-6 py-6 px-5">
      <HeaderEschool
        setShowCreateDialog={setShowCreateDialog}
        setShowCreateUserDialog={setShowCreateUserDialog}
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
            onViewDetail={handleViewDetail}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        </>
      )}

      {/* Financial tab content commented out as per requirements */}
      
      {/* {validActiveTab === "financial" &&   (
        <FinancialAnalytics />
      )} */}
     

      {validActiveTab === "attendance" && <AttendanceAnalytics />}

      <DialogCreateEschool
        isOpen={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreate={handleCreateEschool}
        isCreating={isCreatingEschool}
      />

      <DialogCreateUser
        isOpen={showCreateUserDialog}
        onOpenChange={setShowCreateUserDialog}
      />

      <DialogUpdateEschool
        isOpen={showUpdateDialog}
        onOpenChange={setShowUpdateDialog}
        eschool={selectedEschool}
        onUpdate={handleUpdateEschool}
        isUpdating={isUpdatingEschool}
      />

      <DialogDeleteEschool
        isOpen={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        eschool={selectedEschool}
        onDelete={handleDeleteEschool}
        isDeleting={isDeletingEschool}
      />

      <DialogEschoolDetail
        isOpen={showDetailDialog}
        onOpenChange={setShowDetailDialog}
        eschool={selectedEschool}
      />
    </div>
  );
};

export default EschoolManagement;
