import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getExtension(url: string) {
  return url.substring(url.lastIndexOf('.')+1, url.length) || url;
}
