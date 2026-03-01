// features/settings/components/AppInfoCard.tsx

"use client";

import { Info, Wrench } from "lucide-react";
import { SettingCard } from "./SettingCard";
import { APP_INFO } from "../config";

export function AppInfoCard() {
  return (
    <SettingCard
      icon={<Info className="w-5 h-5" />}
      title="Thông tin ứng dụng"
      description="Chi tiết về phiên bản và công nghệ."
    >
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-y-2 text-sm">
          <span className="text-muted-foreground">Phiên bản</span>
          <span className="font-medium">{APP_INFO.version}</span>
          <span className="text-muted-foreground">Framework</span>
          <span className="font-medium">{APP_INFO.framework}</span>
          <span className="text-muted-foreground">UI Library</span>
          <span className="font-medium">{APP_INFO.uiLibrary}</span>
          <span className="text-muted-foreground">Tác giả</span>
          <span className="font-medium">{APP_INFO.author}</span>
        </div>

        <div className="pt-2 border-t">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Wrench className="w-3.5 h-3.5" />
            <span>{APP_INFO.description}</span>
          </div>
        </div>
      </div>
    </SettingCard>
  );
}
