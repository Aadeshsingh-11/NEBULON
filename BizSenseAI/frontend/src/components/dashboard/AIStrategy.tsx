import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBizSense } from "@/hooks/useBizSense";

const SkeletonCard = () => (
  <div className="glass rounded-xl p-5 border-l-2 border-primary/30">
    <div className="skeleton-shimmer h-4 w-48 rounded mb-3" />
    <div className="skeleton-shimmer h-3 w-full rounded mb-2" />
    <div className="skeleton-shimmer h-3 w-3/4 rounded" />
  </div>
);

const AIStrategy = () => {
  const { forecastMutation, forecastResult } = useBizSense();

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">✨ AI Prescriptive Strategy</h2>
        <button
          onClick={() => forecastMutation.mutate()}
          disabled={forecastMutation.isPending}
          className="px-5 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-semibold hover-lift disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {forecastMutation.isPending ? "Analyzing..." : "Generate Strategy"}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {forecastMutation.isPending && (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </motion.div>
        )}

        {forecastResult && !forecastMutation.isPending && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            {forecastResult.recommendations?.map((rec: string, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15 }}
                className="glass rounded-xl p-5 border-l-2 border-primary hover-lift"
              >
                <div className="flex gap-2 items-start">
                  <span className="text-primary mt-0.5">💡</span>
                  <p className="text-sm text-foreground">{rec}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
        
        {!forecastResult && !forecastMutation.isPending && (
            <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3 glass rounded-xl p-5 border-l-2 border-border"
          >
            <p className="text-sm text-muted-foreground">Generate AI Strategy to see recommendations based on your historical data.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default AIStrategy;
