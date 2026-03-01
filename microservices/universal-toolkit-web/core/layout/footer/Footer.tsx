"use client";

import { Heart } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background/80 backdrop-blur-sm mt-auto">
      <div className="px-6 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <span>© {currentYear}</span>
            <span className="font-medium text-foreground">
              Universal Toolkit
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              Made with <Heart className="h-3 w-3 text-red-500 fill-red-500" />{" "}
              by QuocTang
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
