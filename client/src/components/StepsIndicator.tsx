interface StepItem {
  label: string;
  icon: string;
}

const STEPS: StepItem[] = [
  { label: "Enter URL", icon: "🔗" },
  { label: "Configure", icon: "⚙️" },
  { label: "Generate", icon: "✨" },
  { label: "Download", icon: "⬇️" },
];

type StepStatus = "idle" | "loading" | "success" | "error";

interface StepsIndicatorProps {
  currentStatus: StepStatus;
}

function getActiveStep(status: StepStatus): number {
  switch (status) {
    case "idle":    return 0;
    case "loading": return 2;
    case "success": return 3;
    case "error":   return 2;
  }
}

export function StepsIndicator({ currentStatus }: StepsIndicatorProps) {
  const activeIndex = getActiveStep(currentStatus);

  return (
    <div className="steps-row" role="list" aria-label="Progress steps">
      {STEPS.map((step, i) => {
        const isDone = i < activeIndex || (currentStatus === "success" && i === 3);
        const isActive = i === activeIndex;

        return (
          <div key={step.label} style={{ display: "contents" }}>
            <div
              className={`step-item${isActive ? " active" : ""}${isDone ? " done" : ""}`}
              role="listitem"
              aria-current={isActive ? "step" : undefined}
            >
              <span className="step-number" aria-hidden="true">
                {isDone ? "✓" : i + 1}
              </span>
              <span>{step.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="step-connector" aria-hidden="true" />
            )}
          </div>
        );
      })}
    </div>
  );
}
