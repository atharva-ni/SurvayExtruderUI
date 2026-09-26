import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkflowStepsProps {
  currentStep: number;
}

const steps = [
  { number: 1, title: "Upload" },
  { number: 2, title: "Classify" },
  { number: 3, title: "Review results" },
];

export const WorkflowSteps = ({ currentStep }: WorkflowStepsProps) => {
  return (
    <ol className="flex items-center justify-center gap-3 text-sm">
      {steps.map((step, index) => {
        const isActive = step.number === currentStep;
        const isCompleted = step.number < currentStep;

        return (
          <li key={step.number} className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full border text-xs font-semibold",
                  isCompleted && "border-primary bg-primary text-primary-foreground",
                  isActive && "border-primary text-primary",
                  !isActive && !isCompleted && "border-border text-muted-foreground"
                )}
              >
                {isCompleted ? <Check className="h-3.5 w-3.5" /> : step.number}
              </span>
              <span className={cn("font-medium", isActive || isCompleted ? "text-foreground" : "text-muted-foreground")}>
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && <span className="h-px w-10 bg-border" aria-hidden />}
          </li>
        );
      })}
    </ol>
  );
};
