"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";

interface RoleContextType {
  selectedRole: string | null;
  selectedEschoolId: number | null;
  setSelectedRole: (role: string, eschoolId?: number) => void;
  availableRoles: Array<{
    role: string;
    eschool_id: number;
    eschool_name: string;
  }>;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [selectedRole, setSelectedRoleState] = useState<string | null>(null);
  const [selectedEschoolId, setSelectedEschoolId] = useState<number | null>(
    null
  );

  const availableRoles = user?.roles || [];

  // Set default role when user loads
  useEffect(() => {
    if (availableRoles.length > 0 && !selectedRole) {
      // Priority order: treasurer > coordinator > supervisor > member
      const priorityOrder = [
        "treasurer",
        "coordinator",
        "supervisor",
        "member",
      ];
      const primaryRole =
        priorityOrder.find((role) =>
          availableRoles.some((userRole) => userRole.role === role)
        ) || availableRoles[0].role;

      const roleData = availableRoles.find((r) => r.role === primaryRole);
      setSelectedRoleState(primaryRole);
      setSelectedEschoolId(roleData?.eschool_id || null);
    }
  }, [availableRoles, selectedRole]);

  const setSelectedRole = (role: string, eschoolId?: number) => {
    setSelectedRoleState(role);
    setSelectedEschoolId(eschoolId || null);
  };

  return (
    <RoleContext.Provider
      value={{
        selectedRole,
        selectedEschoolId,
        setSelectedRole,
        availableRoles,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
};
