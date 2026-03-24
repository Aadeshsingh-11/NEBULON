import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBizSense } from "@/hooks/useBizSense";

const AnomalyAlert = () => {
  const [visible, setVisible] = useState(true);
  const { anomalies } = useBizSense();

  if (!anomalies) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 mb-6 flex items-center justify-between shadow-sm"
        >
          <p className="text-sm text-foreground">
            <span className="mr-2">⚠️</span>
            <span className="font-medium">Anomaly Detected ({anomalies.month}):</span>{" "}
            <span className="text-muted-foreground">{anomalies.explanation}</span>
          </p>
          <button
            onClick={() => setVisible(false)}
            className="text-muted-foreground hover:text-foreground transition-colors ml-4 shrink-0 text-lg leading-none"
          >
            ×
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
export default AnomalyAlert;
