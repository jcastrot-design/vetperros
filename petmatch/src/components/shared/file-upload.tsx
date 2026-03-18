"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, X, FileText, ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface FileUploadProps {
  value?: string;
  onChange: (url: string) => void;
  accept?: string;
  label?: string;
  preview?: boolean;
}

export function FileUpload({
  value,
  onChange,
  accept = "image/*",
  label = "Subir archivo",
  preview = true,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Error al subir archivo");
        return;
      }

      onChange(data.url);
      toast.success("Archivo subido");
    } catch {
      toast.error("Error de conexion");
    } finally {
      setUploading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  const isImage = value && /\.(jpg|jpeg|png|webp|gif)$/i.test(value);

  return (
    <div className="space-y-2">
      {value && preview && (
        <div className="relative inline-block">
          {isImage ? (
            <img
              src={value}
              alt="Preview"
              className="h-24 w-24 object-cover rounded-lg border"
            />
          ) : (
            <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/30">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm truncate max-w-[200px]">{value.split("/").pop()}</span>
            </div>
          )}
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Upload className="mr-2 h-4 w-4" />
        )}
        {uploading ? "Subiendo..." : label}
      </Button>
    </div>
  );
}
