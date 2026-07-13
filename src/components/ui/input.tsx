"use client";

import { useState, type InputHTMLAttributes } from 'react';
import { motion } from 'motion/react';
import type { Variants } from 'motion/react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  value: string;
  className?: string;
}

const containerVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const letterVariants: Variants = {
  initial: {
    y: 0,
    color: 'inherit',
  },
  animate: {
    y: '-150%',
    color: 'var(--color-academic-muted)',
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
    },
  },
};

export const Input = ({
  label,
  className = '',
  value,
  'aria-label': ariaLabel,
  ...props
}: InputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const showLabel = isFocused || value.length > 0;

  return (
    <div className={cn('relative pt-6', className)}>
      <motion.div
        className="pointer-events-none absolute left-0 top-8 -translate-y-1/2 text-academic-accent"
        variants={containerVariants}
        initial="initial"
        animate={showLabel ? 'animate' : 'initial'}
      >
        {label.split('').map((char, index) => (
          <motion.span
            key={index}
            className="inline-block text-sm"
            variants={letterVariants}
            style={{ willChange: 'transform' }}
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        ))}
      </motion.div>

      <input
        type="text"
        value={value}
        aria-label={ariaLabel ?? label}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
        className="w-full border-b-2 border-academic-accent bg-transparent py-2 text-base font-medium text-academic-accent outline-none placeholder-transparent transition-colors duration-500 focus:border-academic-brand"
      />
    </div>
  );
};
