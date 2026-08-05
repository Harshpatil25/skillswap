import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { ROLE_HOME, useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  component: DashboardIndex,
});

function DashboardIndex() {
  const { role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    navigate({ to: ROLE_HOME[role ?? "student"] ?? "/dashboard/student", replace: true });
  }, [role, loading, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
      Loading your workspace…
    </div>
  );
}
