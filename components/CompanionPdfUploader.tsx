'use client';

import { useState } from "react";

interface CompanionPdfUploaderProps {
  companionId: string;
  initialSummary?: string | null;
}

const CompanionPdfUploader = ({
  companionId,
  initialSummary,
}: CompanionPdfUploaderProps) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(
    initialSummary || null
  );
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      return;
    }

    setError(null);
    setIsUploading(true);
    setFileName(file.name);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const base64 = arrayBufferToBase64(arrayBuffer);

      // 1) Extract raw text from PDF
      const extractRes = await fetch("/api/pdf-chat/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, fileData: base64 }),
      });

      if (!extractRes.ok) {
        const data = await extractRes.json().catch(() => ({}));
        throw new Error(data.error || "Failed to read PDF.");
      }

      const { text } = await extractRes.json();

      // 2) Summarize the extracted text
      const summaryRes = await fetch("/api/pdf-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfText: text }),
      });

      if (!summaryRes.ok) {
        const data = await summaryRes.json().catch(() => ({}));
        throw new Error(data.error || "Failed to summarize PDF.");
      }

      const { summary: newSummary } = await summaryRes.json();

      // 3) Save summary against this companion
      const saveRes = await fetch("/api/companions/pdf-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companionId, pdfSummary: newSummary }),
      });

      if (!saveRes.ok) {
        const data = await saveRes.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save PDF summary.");
      }

      setSummary(newSummary);
    } catch (err: any) {
      setError(err.message || "Something went wrong while processing the PDF.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <section className="mt-6 rounded-border p-4 flex flex-col gap-3">
      <h2 className="text-lg font-semibold">Attach PDF context (optional)</h2>
      <p className="text-sm text-muted-foreground">
        Upload a PDF for this companion. We&apos;ll store a short summary of the
        document so future sessions can be more context-aware.
      </p>
      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        className="block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-primary/90"
        disabled={isUploading}
      />
      {fileName && (
        <p className="text-xs text-muted-foreground">Loaded: {fileName}</p>
      )}
      {isUploading && (
        <p className="text-xs text-muted-foreground">
          Processing PDF and generating summary...
        </p>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
      {summary && !isUploading && (
        <div className="mt-2">
          <p className="text-xs font-semibold mb-1">
            Stored PDF summary for this companion:
          </p>
          <p className="text-xs text-muted-foreground whitespace-pre-line">
            {summary}
          </p>
        </div>
      )}
    </section>
  );
};

export default CompanionPdfUploader;

