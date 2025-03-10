import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  currentStep: number;
  steps: string[];
}

export function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className="w-full py-4">
      <div className="flex justify-between">
        {steps.map((step, index) => (
          <div
            key={step}
            className="flex flex-col items-center relative"
          >
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold",
                index < currentStep
                  ? "bg-primary text-primary-foreground"
                  : index === currentStep
                  ? "bg-primary text-primary-foreground ring-4 ring-primary/30"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {index + 1}
            </div>
            <div className="mt-2 text-sm font-medium text-center">
              {step}
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "absolute top-4 left-full w-full h-[2px] -translate-y-1/2",
                  index < currentStep ? "bg-primary" : "bg-muted"
                )}
                style={{ width: "calc(100% - 2rem)" }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
