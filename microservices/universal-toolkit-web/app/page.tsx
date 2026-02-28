"use client";

import Link from "next/link";
import { useToolRegistryHelper } from "@/core/hooks/useToolRegistry";
import { Badge } from "@/components/ui/badge";
import { Wrench, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { AppShell } from "@/core/layout/AppShell";

export default function HomePage() {
  const { allCategories, getToolsByCategory, toolCount } =
    useToolRegistryHelper();

  return (
    <AppShell>
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-xl border mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="relative px-6 py-12 sm:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-4"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-primary-foreground shadow-lg">
                <Wrench className="w-7 h-7" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Universal Toolkit
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Nền tảng web tích hợp nhiều tool tiện ích. Hiện có{" "}
              <span className="font-semibold text-foreground">{toolCount}</span>{" "}
              tool sẵn sàng.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Tools Grid by Category */}
      <div className="space-y-8">
        {allCategories.map((category, catIndex) => {
          const tools = getToolsByCategory(category.id);
          if (tools.length === 0) return null;

          const CategoryIcon = category.icon;

          return (
            <motion.section
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: catIndex * 0.1 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2">
                <CategoryIcon className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold">{category.label}</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {tools.map((tool) => {
                  const ToolIcon = tool.icon;
                  return (
                    <Link key={tool.id} href={tool.path}>
                      <div className="group relative rounded-xl border bg-card p-4 transition-all duration-200 hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5">
                        <div className="flex items-start gap-3">
                          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary shrink-0 group-hover:bg-primary/20 transition-colors">
                            <ToolIcon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-sm truncate">
                                {tool.name}
                              </h3>
                              {tool.badge && (
                                <Badge
                                  variant="secondary"
                                  className="text-[10px] px-1.5 py-0 shrink-0"
                                >
                                  {tool.badge}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {tool.description}
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </motion.section>
          );
        })}
      </div>
    </AppShell>
  );
}
