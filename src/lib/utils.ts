import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format number as currency in Indonesian Rupiah
 * @param amount - The amount to format
 * @param options - Formatting options
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number | string,
  options: {
    currency?: string;
    locale?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {}
): string {
  const {
    currency = "IDR",
    locale = "id-ID",
    minimumFractionDigits = 0,
    maximumFractionDigits = 0,
  } = options;

  const numericAmount =
    typeof amount === "string" ? parseFloat(amount) : amount;

  if (isNaN(numericAmount)) {
    return "Rp 0";
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(numericAmount);
}

/**
 * Format number with thousand separators
 * @param amount - The amount to format
 * @param locale - Locale for formatting
 * @returns Formatted number string
 */
export function formatNumber(
  amount: number | string,
  locale: string = "id-ID"
): string {
  const numericAmount =
    typeof amount === "string" ? parseFloat(amount) : amount;

  if (isNaN(numericAmount)) {
    return "0";
  }

  return new Intl.NumberFormat(locale).format(numericAmount);
}
