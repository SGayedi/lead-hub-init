
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function getStatusStyle(status: string) {
  switch (status) {
    case 'qualified':
    case 'approved':
    case 'completed':
      return { bgColor: 'bg-green-100', color: 'text-green-800' };
    case 'new':
    case 'contacted':
    case 'in_progress':
    case 'assessment_in_progress':
      return { bgColor: 'bg-blue-100', color: 'text-blue-800' };
    case 'negotiation':
    case 'assessment_completed':
      return { bgColor: 'bg-purple-100', color: 'text-purple-800' };
    case 'closed_won':
      return { bgColor: 'bg-emerald-100', color: 'text-emerald-800' };
    case 'closed_lost':
    case 'rejected':
      return { bgColor: 'bg-red-100', color: 'text-red-800' };
    case 'on_hold':
      return { bgColor: 'bg-amber-100', color: 'text-amber-800' };
    default:
      return { bgColor: 'bg-gray-100', color: 'text-gray-800' };
  }
}

export function getStatusColorClass(status: string) {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'received':
      return 'bg-blue-100 text-blue-800';
    case 'requested':
      return 'bg-amber-100 text-amber-800';
    case 'updates_needed':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
