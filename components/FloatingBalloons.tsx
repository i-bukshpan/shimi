"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function FloatingBalloons() {
  const [balloons, setBalloons] = useState<any[]>([]);

  useEffect(() => {
    // Generate random balloons
    const arr = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 20,
      duration: 15 + Math.random() * 10,
      color: ["#FDE68A", "#FCA5A5", "#93C5FD", "#D8B4FE", "#86EFAC", "#F9A8D4", "#6EE7B7"][Math.floor(Math.random() * 7)]
    }));
    setBalloons(arr);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {balloons.map(b => (
        <motion.div
          key={b.id}
          className="absolute bottom-[-100px] w-12 h-16 rounded-[50%_50%_50%_50%_/_40%_40%_60%_60%] opacity-60 backdrop-blur-sm"
          style={{ 
            left: `${b.left}%`,
            backgroundColor: b.color,
            boxShadow: "inset -5px -5px 10px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.05)"
          }}
          animate={{
            y: ["0vh", "-120vh"],
            x: ["0px", "30px", "-30px", "0px"]
          }}
          transition={{
            y: { duration: b.duration, repeat: Infinity, ease: "linear", delay: b.delay },
            x: { duration: 4, repeat: Infinity, ease: "easeInOut", repeatType: "mirror" }
          }}
        >
          {/* Balloon string */}
          <div className="absolute -bottom-8 left-1/2 w-0.5 h-10 bg-stone-300/50 -translate-x-1/2"></div>
        </motion.div>
      ))}
    </div>
  );
}
