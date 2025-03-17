"use client"

import { useEffect, useState } from "react";

import { motion } from "framer-motion";

interface AnimatedGradientProps {
  className?: string;
  children: React.ReactNode;
}

export function AnimatedGradient({ className, children }: AnimatedGradientProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      });
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);
  
  const gradientVariants = {
    initial: {
      background: "radial-gradient(circle at 0% 0%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 50%)",
    },
    animate: {
      background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 50%)`,
    },
  };
  
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <motion.div 
        className="absolute inset-0 z-0"
        variants={gradientVariants}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.3, ease: "easeOut" }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
} 