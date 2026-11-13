import React from 'react';
import { motion } from 'motion/react';

interface DetailsBoxProps {
  children: React.ReactNode;
  stroke: string;
  tint: string;
  className?: string;
  blur?: boolean;
}

export const DetailsBox: React.FC<DetailsBoxProps> = ({
  children,
  stroke,
  tint,
  className = '',
  blur = false,
}) => (
  <div
    className={`relative px-5 py-5 sm:px-7 sm:py-6 ${className}`}
    style={{
      backgroundColor: tint,
      ...(blur
        ? {
            backdropFilter: 'blur(1px)',
            WebkitBackdropFilter: 'blur(1px)',
          }
        : {}),
    }}
  >
    <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
      <motion.rect
        x="0.5"
        y="0.5"
        style={{ width: 'calc(100% - 1px)', height: 'calc(100% - 1px)' }}
        fill="none"
        stroke={stroke}
        strokeWidth="1"
        strokeOpacity="0.5"
        pathLength="1"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
      />
    </svg>
    <div className="relative z-10">{children}</div>
  </div>
);
