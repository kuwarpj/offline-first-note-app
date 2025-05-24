import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useRef, useCallback } from "react";
import { DebouncedFunction } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const useDebounce = (
  fn: (...args: any[]) => void,
  delay: number
): DebouncedFunction => {
  const timer = useRef<NodeJS.Timeout | null>(null);

  // Create the debounced function
  const debounced = useCallback((...args: any[]) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      fn(...args);
    }, delay);
  }, [fn, delay]) as DebouncedFunction; 

  // Assign cancel method
  debounced.cancel = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  return debounced;
};

