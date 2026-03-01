"use client";

interface MdEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function MdEditor({ value, onChange }: MdEditorProps) {
  return (
    <div className="space-y-2 flex-1 min-w-0">
      <label className="text-sm font-medium">Markdown Input</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Nhập hoặc dán nội dung Markdown ở đây..."
        className="flex min-h-[500px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y"
        spellCheck={false}
      />
    </div>
  );
}
