import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useRef, useCallback } from "react";
import { DebouncedFunction } from "@/types";
import { toast } from "sonner";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const useDebounce = (
  fn: (...args: any[]) => void,
  delay: number
): DebouncedFunction => {
  const timer = useRef<NodeJS.Timeout | null>(null);

  // Create the debounced function
  const debounced = useCallback(
    (...args: any[]) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        fn(...args);
      }, delay);
    },
    [fn, delay]
  ) as DebouncedFunction;

  // Assign cancel method
  debounced.cancel = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  return debounced;
};

export const showToast = (
  title: string,
  description: string,
  type: "success" | "error" | "warning"
) => {
  const styleMap = {
    success: {
      backgroundColor: "#DCFCE7",
      color: "#166534",
    },
    error: {
      backgroundColor: "#FEE2E2",
      color: "#991B1B",
    },
    warning: {
      backgroundColor: "#FFEDD5",
      color: "#9A3412",
    },
  };

  const { backgroundColor, color } = styleMap[type];

  toast(title, {
    description,
    style: { backgroundColor, color },
  });
};
