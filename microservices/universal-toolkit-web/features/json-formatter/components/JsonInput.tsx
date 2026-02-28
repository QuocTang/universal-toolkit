"use client";

interface JsonInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function JsonInput({ value, onChange }: JsonInputProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Input</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder='Dán JSON vào đây...&#10;Ví dụ: {"name": "John", "age": 30}'
        className="flex min-h-[400px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
        spellCheck={false}
      />
    </div>
  );
}
