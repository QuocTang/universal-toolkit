"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileDown, Loader2, FileText, Trash2 } from "lucide-react";
import { MD_TO_DOCX_CONFIG } from "../config";

interface MdToolbarProps {
  fileName: string;
  fontSize: number;
  fontFamily: string;
  isConverting: boolean;
  lastConvertedAt: Date | null;
  onFileNameChange: (name: string) => void;
  onFontSizeChange: (size: number) => void;
  onFontFamilyChange: (family: string) => void;
  onConvert: () => void;
  onLoadSample: () => void;
  onClear: () => void;
}

export function MdToolbar({
  fileName,
  fontSize,
  fontFamily,
  isConverting,
  lastConvertedAt,
  onFileNameChange,
  onFontSizeChange,
  onFontFamilyChange,
  onConvert,
  onLoadSample,
  onClear,
}: MdToolbarProps) {
  return (
    <div className="space-y-3">
      {/* Row 1: Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          onClick={onConvert}
          size="sm"
          className="gap-1.5"
          disabled={isConverting}
        >
          {isConverting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileDown className="h-4 w-4" />
          )}
          {isConverting ? "Đang chuyển đổi..." : "Tải DOCX"}
        </Button>
        <Button
          onClick={onLoadSample}
          variant="secondary"
          size="sm"
          className="gap-1.5"
        >
          <FileText className="h-4 w-4" />
          Nội dung mẫu
        </Button>
        <Button onClick={onClear} variant="ghost" size="sm" className="gap-1.5">
          <Trash2 className="h-4 w-4" />
          Xóa
        </Button>

        {lastConvertedAt && (
          <span className="text-xs text-muted-foreground ml-auto">
            Lần cuối: {lastConvertedAt.toLocaleTimeString("vi-VN")}
          </span>
        )}
      </div>

      {/* Row 2: Options */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-muted-foreground whitespace-nowrap">
            Tên file:
          </label>
          <Input
            value={fileName}
            onChange={(e) => onFileNameChange(e.target.value)}
            placeholder="document"
            className="h-7 w-36 text-xs"
          />
          <span className="text-xs text-muted-foreground">.docx</span>
        </div>

        <div className="flex items-center gap-1.5">
          <label className="text-xs text-muted-foreground whitespace-nowrap">
            Font:
          </label>
          <select
            value={fontFamily}
            onChange={(e) => onFontFamilyChange(e.target.value)}
            className="h-7 rounded-md border border-input bg-background px-2 text-xs"
          >
            {MD_TO_DOCX_CONFIG.fontFamilyOptions.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <label className="text-xs text-muted-foreground whitespace-nowrap">
            Cỡ chữ:
          </label>
          <div className="flex gap-1">
            {MD_TO_DOCX_CONFIG.fontSizeOptions.map((size) => (
              <Badge
                key={size}
                variant={fontSize === size ? "default" : "outline"}
                className="cursor-pointer text-xs px-1.5 py-0"
                onClick={() => onFontSizeChange(size)}
              >
                {size / 2}pt
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
