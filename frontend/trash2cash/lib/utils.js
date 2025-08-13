import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const truncateText = (text, n = 27) => {
  if (text.length > n) {
    return text.slice(0, n) + "...";
  }
  return text;
};
