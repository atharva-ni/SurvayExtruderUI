import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export const APP_NAME = "Survey Paper Classifier";

const links = [
  { to: "/classify", label: "Classify" },
  { to: "/about", label: "Methodology" },
];

export const Navigation = () => {
  const location = useLocation();

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto flex h-14 items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded bg-primary text-xs font-semibold text-primary-foreground">
            SP
          </span>
          <span className="text-sm font-semibold tracking-tight text-foreground">{APP_NAME}</span>
        </Link>

        <nav className="flex items-center gap-1">
          {links.map(({ to, label }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "rounded px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
