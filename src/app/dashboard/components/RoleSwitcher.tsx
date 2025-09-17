"use client";

import React from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Wallet, Users, School, UserCheck } from "lucide-react";

interface RoleSwitcherProps {
  currentEschoolId?: number;
  onEschoolChange?: (eschoolId: number, role: string) => void;
  className?: string;
}

const RoleSwitcher: React.FC<RoleSwitcherProps> = ({
  currentEschoolId,
  onEschoolChange,
  className = "",
}) => {
  const { user } = useAuth();

  if (!user || !user.roles || user.roles.length <= 1) {
    return null;
  }

  const userRoles = user.roles;

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "treasurer":
        return <Wallet className="h-4 w-4" />;
      case "coordinator":
        return <UserCheck className="h-4 w-4" />;
      case "supervisor":
        return <Users className="h-4 w-4" />;
      case "member":
        return <School className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "treasurer":
        return "Bendahara";
      case "coordinator":
        return "Koordinator";
      case "supervisor":
        return "Staff";
      case "member":
        return "Member";
      default:
        return role;
    }
  };

  const handleRoleChange = (value: string) => {
    const [eschoolId, role] = value.split("-");
    if (onEschoolChange) {
      onEschoolChange(parseInt(eschoolId), role);
    }
  };

  const currentValue = currentEschoolId
    ? `${currentEschoolId}-${
        userRoles.find((r) => r.eschool_id === currentEschoolId)?.role
      }`
    : "";

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Switch Role:</span>
        <Select value={currentValue} onValueChange={handleRoleChange}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Select role and eschool" />
          </SelectTrigger>
          <SelectContent>
            {userRoles.map((roleData) => (
              <SelectItem
                key={`${roleData.eschool_id}-${roleData.role}`}
                value={`${roleData.eschool_id}-${roleData.role}`}
              >
                <div className="flex items-center gap-2">
                  {getRoleIcon(roleData.role)}
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {getRoleLabel(roleData.role)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {roleData.eschool_name}
                    </span>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Current roles badges */}
      <div className="flex flex-wrap gap-1">
        {userRoles.map((roleData, index) => (
          <Badge
            key={index}
            variant={
              roleData.eschool_id === currentEschoolId ? "default" : "outline"
            }
            className="text-xs"
          >
            {getRoleLabel(roleData.role)}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default RoleSwitcher;
