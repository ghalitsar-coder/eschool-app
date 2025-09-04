"use client";

import React from "react";
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { 
  School, 
  Wallet, 
  Users, 
  User,
  ChevronRight
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface EschoolRole {
  eschool_id: number;
  eschool_name: string;
  role_in_eschool: string;
}

const EschoolNavigation = () => {
  const { user } = useAuth();
  const router = useRouter();

  if (!user?.eschools || user.eschools.length === 0) {
    return null;
  }

  // Group eschools by role
  const eschoolsByRole: Record<string, EschoolRole[]> = {};
  user.eschools.forEach(eschool => {
    if (!eschoolsByRole[eschool.role_in_eschool]) {
      eschoolsByRole[eschool.role_in_eschool] = [];
    }
    eschoolsByRole[eschool.role_in_eschool].push({
      eschool_id: eschool.eschool_id,
      eschool_name: eschool.eschool_name,
      role_in_eschool: eschool.role_in_eschool
    });
  });

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
        return <School className="h-4 w-4" />;
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

  // Handle navigation to eschool
  const handleNavigateToEschool = (eschoolId: number, role: string) => {
    // Determine the appropriate route based on role
    let route = '';
    switch (role.toLowerCase()) {
      case 'bendahara':
        route = `/eschool/${eschoolId}/kas`;
        break;
      case 'koordinator':
        route = `/eschool/${eschoolId}/attendance`;
        break;
      case 'member':
        route = `/eschool/${eschoolId}/members`;
        break;
      default:
        route = `/eschool/${eschoolId}`;
    }
    
    router.push(route);
  };

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="gap-2">
            <School className="h-4 w-4" />
            My Eschools
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="w-[300px] p-2">
              {Object.entries(eschoolsByRole).map(([role, eschools]) => (
                <div key={role} className="mb-2 last:mb-0">
                  <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground">
                    {getRoleIcon(role)}
                    {getRoleLabel(role)}
                    <Badge variant="secondary" className="ml-auto">
                      {eschools.length}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    {eschools.map((eschool) => (
                      <NavigationMenuLink
                        key={eschool.eschool_id}
                        onClick={() => handleNavigateToEschool(eschool.eschool_id, role)}
                        className={cn(
                          "group flex items-center justify-between px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        <span>{eschool.eschool_name}</span>
                        <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </NavigationMenuLink>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default EschoolNavigation;