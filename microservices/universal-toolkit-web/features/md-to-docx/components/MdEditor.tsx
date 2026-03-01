"use client";

import { useRef, useCallback, useState } from "react";
import { Upload } from "lucide-react";

interface MdEditorProps {
  value: string;
  onChange: (value: string) => void;
  onFileUpload: (file: File) => void;
}

export function MdEditor({ value, onChange, onFileUpload }: MdEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onFileUpload(file);
        // Reset input để có thể upload cùng file lần nữa
        e.target.value = "";
      }
    },
    [onFileUpload],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) {
        onFileUpload(file);
      }
    },
    [onFileUpload],
  );

  return (
    <div className="space-y-2 flex-1 min-w-0">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Markdown Input</label>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <Upload className="h-3.5 w-3.5" />
          Upload file .md
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".md,.markdown,.txt"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      <div
        className="relative"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Nhập, dán nội dung Markdown, hoặc kéo thả file .md vào đây..."
          className={`flex min-h-[500px] w-full rounded-lg border px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y transition-colors ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-input bg-background"
          }`}
          spellCheck={false}
        />

        {isDragging && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg border-2 border-dashed border-primary bg-primary/10 pointer-events-none">
            <div className="flex flex-col items-center gap-2 text-primary">
              <Upload className="h-8 w-8" />
              <span className="text-sm font-medium">Thả file ở đây</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
