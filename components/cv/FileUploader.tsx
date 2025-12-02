'use client';

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { formatSize } from "@/lib/utils";

interface FileUploaderProps {
  onFileSelect?: (file: File | null) => void;
}

const FileUploader = ({ onFileSelect }: FileUploaderProps) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0] || null;
      onFileSelect?.(file);
    },
    [onFileSelect]
  );

  const maxFileSize = 20 * 1024 * 1024; // 20MB

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } =
    useDropzone({
      multiple: false,
      accept: {
        "application/pdf": [".pdf"],
      },
      onDrop,
      maxSize: maxFileSize,
    });

  const file = acceptedFiles[0] || null;

  return (
    <div className="w-full border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-4">
      <div {...getRootProps()}>
        <input {...getInputProps()} />

        <div className="space-y-4 cursor-pointer">
          {file ? (
            <div
              className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-gray-800"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded flex items-center justify-center">
                  <span className="text-red-600 dark:text-red-400 font-bold">PDF</span>
                </div>
                <div>
                  <p className="text-sm text-gray-900 dark:text-white font-medium truncate max-w-xs">
                    <span className="font-semibold">{file.name}</span>
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatSize(file.size)}
                  </p>
                </div>
              </div>
              <button
                className="p-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  onFileSelect?.(null);
                }}
                aria-label="Remove file"
              >
                <svg
                  className="w-4 h-4 text-gray-600 dark:text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ) : (
            <div className="text-center p-8 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 min-h-[208px] flex flex-col items-center justify-center">
              <div className="mx-auto w-16 h-16 flex items-center justify-center mb-2">
                <svg
                  className="w-16 h-16 text-gray-400 dark:text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                <span className="font-semibold">Click to upload</span> or drag
                and drop your CV here
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                PDF (max {formatSize(maxFileSize)})
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUploader;

