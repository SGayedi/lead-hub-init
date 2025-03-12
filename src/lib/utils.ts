
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function getStatusStyle(status: string): { color: string; bgColor: string; icon?: React.ReactNode } {
  switch(status) {
    case 'not_started':
      return { color: 'text-gray-500', bgColor: 'bg-gray-100' };
    case 'in_progress':
      return { color: 'text-blue-500', bgColor: 'bg-blue-100' };
    case 'completed':
      return { color: 'text-green-500', bgColor: 'bg-green-100' };
    case 'assessment_in_progress':
      return { color: 'text-amber-500', bgColor: 'bg-amber-100' };
    case 'assessment_completed':
      return { color: 'text-blue-500', bgColor: 'bg-blue-100' };
    case 'waiting_for_approval':
      return { color: 'text-purple-500', bgColor: 'bg-purple-100' };
    case 'due_diligence_approved':
      return { color: 'text-green-500', bgColor: 'bg-green-100' };
    case 'rejected':
      return { color: 'text-red-500', bgColor: 'bg-red-100' };
    default:
      return { color: 'text-gray-500', bgColor: 'bg-gray-100' };
  }
}
