
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'Music': 'bg-purple-100 text-purple-800',
    'Sports': 'bg-blue-100 text-blue-800',
    'Arts': 'bg-pink-100 text-pink-800',
    'Business': 'bg-amber-100 text-amber-800',
    'Technology': 'bg-cyan-100 text-cyan-800',
    'Other': 'bg-gray-100 text-gray-800',
  };

  return colors[category] || colors['Other'];
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}
