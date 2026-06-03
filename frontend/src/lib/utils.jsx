import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { FileText, FileImage, FileSpreadsheet, Presentation, FileType } from 'lucide-react';
import React from 'react';

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const getFileIcon = (fileName) => {
  if (!fileName) return <FileType className="w-12 h-12 text-gray-400" />;
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch(ext) {
    case 'pdf': return <FileText className="w-12 h-12 text-red-500" />;
    case 'docx':
    case 'doc':
    case 'word':
      return <FileText className="w-12 h-12 text-blue-500" />;
    case 'xlsx':
    case 'xls':
    case 'csv':
    case 'excel':
      return <FileSpreadsheet className="w-12 h-12 text-green-500" />;
    case 'pptx':
    case 'ppt':
      return <Presentation className="w-12 h-12 text-orange-500" />;
    case 'png':
    case 'jpg':
    case 'jpeg':
      return <FileImage className="w-12 h-12 text-purple-500" />;
    default: return <FileType className="w-12 h-12 text-gray-400" />;
  }
};