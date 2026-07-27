import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

const COLUMNS = [
  {
    title: "Learn",
    links: [
      { to: "/explore", label: "Explore workshops" },
      { to: "/mentors", label: "Find a mentor" },
      { to: "/internships", label: "Internships" },
    ],
  },
  {
    title: "Platform",
    links: [
      { to: "/how-it-works", label: "How it works" },
      { to: "/auth", label: "Create an account" },
      { to: "/dashboard/student", label: "Your dashboard" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <Link to="/" className="flex items-center gap-2">
            <span className="gradient-primary flex size-9 items-center justify-center rounded-xl text-primary-foreground">
              <Sparkles className="size-4" />
            </span>
            <span className="text-lg font-extrabold tracking-tight">SkillSwap</span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Hyperlocal skill exchange for students, mentors and neighbourhood businesses. Learn a
            skill, teach a skill, and find work close to home.
          </p>
        </div>
        {COLUMNS.map((column) => (
          <div key={column.title}>
            <h3 className="text-sm font-semibold">{column.title}</h3>
            <ul className="mt-4 space-y-3">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} SkillSwap. Built for hyperlocal learning.</p>
          <p>Made with community mentors across India.</p>
        </div>
      </div>
    </footer>
  );
}
