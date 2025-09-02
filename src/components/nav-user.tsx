"use client";

import {
  IconCreditCard,
  IconDotsVertical,
  IconLogout,
  IconNotification,
  IconUserCircle,
} from "@tabler/icons-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import apiClient from "@/lib/api/client";
import { useAuth } from "@/hooks/use-auth";

export function NavUser() {
  const { user, logoutMutation } = useAuth();
  const { isMobile } = useSidebar();

  const handleLogout = async () => {
    try {
      await apiClient.post("/logout");
      logoutMutation.mutate();
    } catch (error) {
      console.error("Logout failed:", error);
      logoutMutation.mutate(); // Force logout even if API fails
    }
  };

  // Get role display name
  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "bendahara": return "Treasurer";
      case "koordinator": return "Coordinator";
      case "staff": return "Staff";
      case "siswa": return "Member";
      default: return role;
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user?.avatar || "/avatars/default.jpg"} alt={user?.name || "User"} />
                <AvatarFallback className="rounded-lg">
                  {user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user?.name || "User"}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {user?.email || "user@example.com"}
                </span>
                {user?.role && (
                  <span className="text-muted-foreground truncate text-xs">
                    {getRoleDisplayName(user.role)}
                  </span>
                )}
              </div>
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user?.avatar || "/avatars/default.jpg"} alt={user?.name || "User"} />
                  <AvatarFallback className="rounded-lg">
                    {user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user?.name || "User"}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {user?.email || "user@example.com"}
                  </span>
                  {user?.role && (
                    <span className="text-muted-foreground truncate text-xs">
                      {getRoleDisplayName(user.role)}
                    </span>
                  )}
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <a href="/dashboard/profile">
                  <IconUserCircle />
                  Profile
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconCreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconNotification />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <IconLogout />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
