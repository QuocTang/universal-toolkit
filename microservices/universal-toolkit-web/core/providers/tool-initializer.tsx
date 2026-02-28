"use client";

import { useEffect, useRef } from "react";
import { useToolRegistry } from "@/core/registry";
import { registeredTools, toolCategories } from "@/config/tools";

/**
 * Component khởi tạo Tool Registry
 * Đăng ký tất cả tools và categories khi app mount
 */
export function ToolInitializer() {
  const { register, registerCategory } = useToolRegistry();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Đăng ký categories
    toolCategories.forEach((category) => {
      registerCategory(category);
    });

    // Đăng ký tools
    registeredTools.forEach((tool) => {
      register(tool);
    });
  }, [register, registerCategory]);

  return null;
}
