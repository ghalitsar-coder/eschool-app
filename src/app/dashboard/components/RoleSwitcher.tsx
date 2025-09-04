"use client";

import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  User, 
  School, 
  Wallet, 
  Users, 
  ChevronDown,
  BadgeDollarSign,
  CalendarCheck
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

interface EschoolRole {
  eschool_id: number;
  eschool_name: string;
  eschool_description: string;
  role_in_eschool: string;
  role_status: string;
  permissions: string[];
  assigned_at: string;
}

interface RoleSwitcherProps {
  currentEschoolId?: number;
  onEschoolChange?: (eschoolId: number, role: string) => void;
}

const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ 
  currentEschoolId,
  onEschoolChange 
}) => {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedEschoolId, setSelectedEschoolId] = useState<number | undefined>(currentEschoolId);

  // Get unique roles from user's eschools
  const getUniqueRoles = () => {
    if (!user?.eschools) return [];
    const roles = user.eschools.map(eschool => eschool.role_in_eschool);
    return [...new Set(roles)];
  };

  // Get eschools for a specific role
  const getEschoolsByRole = (role: string) => {
    if (!user?.eschools) return [];
    return user.eschools.filter(eschool => eschool.role_in_eschool === role);
  };

  // Handle eschool selection
  const handleEschoolSelect = (eschoolId: string) => {
    const id = parseInt(eschoolId);
    setSelectedEschoolId(id);
    
    // Find the selected eschool to get the role
    const selectedEschool = user?.eschools?.find(eschool => eschool.eschool_id === id);
    if (selectedEschool && onEschoolChange) {
      onEschoolChange(id, selectedEschool.role_in_eschool);
    }
  };

  // Get role icon
  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'bendahara':
        return <Wallet className="h-4 w-4" />;
      case 'koordinator':
        return <Users className="h-4 w-4" />;
      case 'member':
        return <User className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  // Get role label
  const getRoleLabel = (role: string) => {
    switch (role.toLowerCase()) {
      case 'bendahara':
        return 'Bendahara';
      case 'koordinator':
        return 'Koordinator';
      case 'member':
        return 'Member';
      default:
        return role;
    }
  };

  // Get role badge variant
  const getRoleBadgeVariant = (role: string) => {
    switch (role.toLowerCase()) {
      case 'bendahara':
        return 'default';
      case 'koordinator':
        return 'secondary';
      case 'member':
        return 'outline';
      default:
        return 'default';
    }
  };

  if (!user?.eschools || user.eschools.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-4">
      {/* Role Switcher - Only show if user has multiple roles */}
      {getUniqueRoles().length > 1 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Role:</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                {getRoleIcon(user.role)}
                <span>{getRoleLabel(user.role)}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {getUniqueRoles().map((role) => (
                <DropdownMenuItem 
                  key={role}
                  onClick={() => {
                    // For now, we'll just update the primary role
                    // In a real implementation, you might want to refresh user data
                    console.log(`Switching to role: ${role}`);
                  }}
                  className="gap-2"
                >
                  {getRoleIcon(role)}
                  {getRoleLabel(role)}
                  {getEschoolsByRole(role).length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {getEschoolsByRole(role).length}
                    </Badge>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Eschool Switcher */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Eschool:</span>
        <Select 
          value={selectedEschoolId?.toString() || ""} 
          onValueChange={handleEschoolSelect}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select eschool" />
          </SelectTrigger>
          <SelectContent>
            {user.eschools.map((eschool) => (
              <SelectItem 
                key={eschool.eschool_id} 
                value={eschool.eschool_id.toString()}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <School className="h-4 w-4" />
                    <span>{eschool.eschool_name}</span>
                  </div>
                  <Badge 
                    variant={getRoleBadgeVariant(eschool.role_in_eschool)} 
                    className="ml-2"
                  >
                    {getRoleLabel(eschool.role_in_eschool)}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default RoleSwitcher;