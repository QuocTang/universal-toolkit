// features/settings/components/OptionButton.tsx

"use client";

interface OptionButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

export function OptionButton({ active, onClick, children }: OptionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium 
        border transition-all duration-200 cursor-pointer
        ${
          active
            ? "bg-primary text-primary-foreground border-primary shadow-sm"
            : "bg-card text-muted-foreground border-border hover:bg-accent hover:text-foreground"
        }
      `}
    >
      {children}
    </button>
  );
}
