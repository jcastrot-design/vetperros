import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

interface EmptyStateAction {
  label: string;
  href: string;
  variant?: "default" | "outline";
}

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actions?: EmptyStateAction[];
}

export function EmptyState({ icon: Icon, title, description, actions }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
      <div className="h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center">
        <Icon className="h-10 w-10 text-muted-foreground/40" />
      </div>
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-muted-foreground mt-1 max-w-md">{description}</p>
      </div>
      {actions && actions.length > 0 && (
        <div className="flex flex-wrap gap-3 justify-center">
          {actions.map((action, i) => (
            <Link key={i} href={action.href}>
              <Button
                variant={action.variant || (i === 0 ? "default" : "outline")}
                className={i === 0 ? "bg-brand hover:bg-brand-hover" : ""}
              >
                {action.label}
              </Button>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
