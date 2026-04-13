"use client";

import { useRef, useState } from "react";
import { formatBytes } from "@/lib/format";
import {
  Paperclip,
  UploadCloud,
  X,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_FILE_TYPES,
  MAX_IMAGE_BYTES,
  MAX_FILE_BYTES,
  isImage,
} from "@/lib/r2";

export type UploadedFile = {
  key: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
};

type Props = {
  onUploaded: (file: UploadedFile) => void;
  onClear: () => void;
  uploaded: UploadedFile | null;
  disabled?: boolean;
};

const ACCEPTED = [
  ...Array.from(ALLOWED_IMAGE_TYPES),
  ...Array.from(ALLOWED_FILE_TYPES),
].join(",");

function validateFile(file: File): string | null {
  const mime = file.type;
  const allowed = ALLOWED_IMAGE_TYPES.has(mime) || ALLOWED_FILE_TYPES.has(mime);
  if (!allowed) return "File type not allowed";
  const limit = isImage(mime) ? MAX_IMAGE_BYTES : MAX_FILE_BYTES;
  if (file.size > limit) {
    return `Exceeds ${isImage(mime) ? "5 MB" : "10 MB"} limit`;
  }
  return null;
}

export function FileUpload({ onUploaded, onClear, uploaded, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setUploading(true);
    setProgress(0);

    // XHR for progress tracking
    const formData = new FormData();
    formData.append("file", file);

    try {
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/upload");

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100));
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const data = JSON.parse(xhr.responseText) as UploadedFile;
            onUploaded(data);
            resolve();
          } else {
            const data = JSON.parse(xhr.responseText) as { error?: string };
            reject(new Error(data.error ?? "Upload failed"));
          }
        };

        xhr.onerror = () => reject(new Error("Upload failed"));
        xhr.send(formData);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    upload(files[0]);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    if (disabled || uploading) return;
    handleFiles(e.dataTransfer.files);
  }

  if (uploaded) {
    const isImg = isImage(uploaded.mimeType);
    return (
      <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2.5">
        <div
          className="flex items-center justify-center size-8 rounded-md shrink-0"
          style={{ backgroundColor: isImg ? "#60a5fa18" : "#6366f118" }}
        >
          {isImg ? (
            <ImageIcon size={14} color="#60a5fa" />
          ) : (
            <FileText size={14} color="#6366f1" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium truncate">{uploaded.fileName}</p>
          <p className="text-[10px] text-muted-foreground">
            {formatBytes(uploaded.fileSize)} · {uploaded.mimeType}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            onClear();
            setError(null);
          }}
          className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <X size={13} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div
        role="button"
        tabIndex={0}
        onClick={() => !disabled && !uploading && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (!disabled && !uploading) inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled && !uploading) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors cursor-pointer select-none",
          dragging
            ? "border-foreground/40 bg-muted/50"
            : "border-border hover:border-foreground/20 hover:bg-muted/20",
          (disabled || uploading) && "pointer-events-none opacity-60",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          className="sr-only"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={disabled || uploading}
        />

        {uploading ? (
          <>
            <UploadCloud size={20} className="text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              Uploading… {progress}%
            </p>
            <div className="w-full max-w-40 h-1 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-foreground/60 transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>
          </>
        ) : (
          <>
            <Paperclip size={18} className="text-muted-foreground" />
            <div>
              <p className="text-xs font-medium">
                Drop a file or click to browse
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Images up to 5 MB · Files up to 10 MB
              </p>
            </div>
          </>
        )}
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
