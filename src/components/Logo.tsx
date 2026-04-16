import React from 'react';
import { cn } from '../lib/utils';

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className, iconOnly = false }) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-[#2563EB] to-[#4F46E5] shadow-lg transition-transform hover:scale-105">
        <svg
          viewBox="0 0 512 512"
          className="h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M340 160C340 140 320 120 300 120H200C180 120 160 140 160 160V220C160 240 180 260 200 260H312C332 260 352 280 352 300V352C352 372 332 392 312 392H212C192 392 172 372 172 352" 
                fill="none"
                stroke="white" 
                strokeWidth="64" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
          />
        </svg>
      </div>
      {!iconOnly && (
        <span className="text-xl font-black tracking-tight text-gray-900 dark:text-white">
          Sohelix
        </span>
      )}
    </div>
  );
};
