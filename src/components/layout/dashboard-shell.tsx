import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Award,
  BarChart3,
  Bell,
  Bookmark,
  Briefcase,
  Building2,
  Compass,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Settings,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { initials } from "@/lib/format";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

const COMMON: NavItem[] = [
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/settings", label: "Profile & settings", icon: Settings },
];

const BY_ROLE: Record<string, NavItem[]> = {
  student: [
    { to: "/dashboard/student", label: "Overview", icon: LayoutDashboard },
    { to: "/dashboard/student/learning", label: "My learning", icon: GraduationCap },
    { to: "/dashboard/student/saved", label: "Saved", icon: Bookmark },
    { to: "/dashboard/student/certificates", label: "Certificates", icon: Award },
    { to: "/internships", label: "Internships", icon: Briefcase },
  ],
  mentor: [
    { to: "/dashboard/mentor", label: "Overview", icon: LayoutDashboard },
    { to: "/dashboard/mentor/workshops", label: "My workshops", icon: GraduationCap },
    { to: "/dashboard/mentor/participants", label: "Participants", icon: Users },
  ],
  msme: [
    { to: "/dashboard/company", label: "Overview", icon: LayoutDashboard },
    { to: "/dashboard/company/internships", label: "Internships", icon: Briefcase },
    { to: "/dashboard/company/applicants", label: "Applicants", icon: Users },
    { to: "/dashboard/company/profile", label: "Company profile", icon: Building2 },
  ],
  admin: [
    { to: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
    { to: "/dashboard/admin/users", label: "Users & roles", icon: Shield },
    { to: "/dashboard/admin/workshops", label: "Workshops", icon: GraduationCap },
    { to: "/dashboard/admin/reports", label: "Reports", icon: BarChart3 },
  ],
};

export function DashboardShell({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const { profile, role, signOut } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const items = BY_ROLE[role ?? "student"] ?? BY_ROLE.student;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar collapsible="icon">
          <SidebarContent>
            <div className="flex items-center gap-2 px-4 py-5">
              <span className="gradient-primary flex size-8 shrink-0 items-center justify-center rounded-xl text-primary-foreground">
                <Sparkles className="size-4" />
              </span>
              <span className="truncate text-base font-extrabold">SkillSwap</span>
            </div>
            <SidebarGroup>
              <SidebarGroupLabel className="capitalize">{role ?? "student"} workspace</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton asChild isActive={pathname === item.to}>
                        <Link to={item.to}>
                          <item.icon />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>General</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {COMMON.map((item) => (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton asChild isActive={pathname === item.to}>
                        <Link to={item.to}>
                          <item.icon />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={async () => {
                        await signOut();
                        navigate({ to: "/auth", replace: true });
                      }}
                    >
                      <LogOut />
                      <span>Sign out</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="min-w-0">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-xl sm:px-6">
            <SidebarTrigger />
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-base font-bold sm:text-lg">{title}</h1>
              {description && (
                <p className="truncate text-xs text-muted-foreground sm:text-sm">{description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {actions}
              <Button variant="ghost" size="icon" asChild aria-label="Home">
                <Link to="/">
                  <Compass />
                </Link>
              </Button>
              <Avatar className="size-8 border border-border">
                <AvatarImage src={profile?.avatar_url ?? undefined} alt="" />
                <AvatarFallback className="text-xs">{initials(profile?.full_name)}</AvatarFallback>
              </Avatar>
            </div>
          </header>
          <main className="flex-1 space-y-6 p-4 sm:p-6">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
