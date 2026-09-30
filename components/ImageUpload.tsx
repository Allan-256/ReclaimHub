"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";

type Props = {
  value: string;
  onChange: (url: string) => void;
};

export default function ImageUpload({ value, onChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    setError("");
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      onChange(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) upload(file);
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) upload(file);
  };

  return (
    <div>
      {value ? (
        <div style={{ position: "relative", borderRadius: "12px", overflow: "hidden", border: "1px solid var(--border-subtle)" }}>
          <img src={value} alt="preview" style={{ width: "100%", maxHeight: "260px", objectFit: "cover", display: "block" }} />
          <button
            type="button"
            onClick={() => onChange("")}
            style={{
              position: "absolute",
              top: "12px",
              right: "12px",
              background: "rgba(0,0,0,0.7)",
              color: "white",
              border: "none",
              padding: "8px 14px",
              borderRadius: "999px",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Remove
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${dragOver ? "var(--accent)" : "var(--border-subtle)"}`,
            borderRadius: "12px",
            background: dragOver ? "rgba(234,88,12,0.06)" : "var(--background)",
            padding: "40px 24px",
            textAlign: "center",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          <div style={{ fontSize: "32px", marginBottom: "12px", color: "var(--muted)" }}>+</div>
          <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--foreground)" }}>
            {uploading ? "Uploading…" : "Drop an image here or click to browse"}
          </div>
          <div style={{ marginTop: "6px", fontSize: "12px", color: "var(--muted)" }}>
            PNG, JPG, WEBP · max 5 MB
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            style={{ display: "none" }}
          />
        </div>
      )}

      {error && (
        <div style={{ marginTop: "10px", fontSize: "12px", color: "#ef4444" }}>
          {error}
        </div>
      )}
    </div>
  );
}
