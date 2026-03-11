'use client';

import { useState } from "react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const PdfChatClient = () => {
  const [pdfText, setPdfText] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
      const base64 = Buffer.from(arrayBuffer).toString("base64");

      const res = await fetch("/api/pdf-chat/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, fileData: base64 }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to read PDF.");
      }

      const data = await res.json();
      setPdfText(data.text);
      setMessages([]);
    } catch (err: any) {
      setError(err.message || "Something went wrong while reading the PDF.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSend = async () => {
    if (!pdfText) {
      setError("Please upload a PDF first.");
      return;
    }
    if (!input.trim()) return;

    setError(null);
    const userMessage: ChatMessage = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsSending(true);

    try {
      const res = await fetch("/api/pdf-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pdfText,
          messages: newMessages,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to get response from Gemini.");
      }

      const data = await res.json();
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.reply,
      };
      setMessages([...newMessages, assistantMessage]);
    } catch (err: any) {
      setError(err.message || "Something went wrong while chatting.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">
          Attach a PDF document
        </label>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-primary/90"
        />
        {fileName && (
          <p className="text-xs text-muted-foreground">
            Loaded: {fileName}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          After uploading, you can ask any questions about this PDF.
        </p>
      </div>

      <div className="border rounded-lg p-4 h-80 overflow-y-auto bg-background">
        {messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Ask the chatbot anything about your PDF once it has been uploaded.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`max-w-xl rounded-lg px-3 py-2 text-sm ${
                  message.role === "user"
                    ? "ml-auto bg-primary text-white"
                    : "mr-auto bg-muted"
                }`}
              >
                {message.content}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={
              pdfText
                ? "Ask something about your PDF..."
                : "Upload a PDF first to start chatting..."
            }
            className="flex-1 rounded-md border px-3 py-2 text-sm"
            disabled={isUploading || isSending}
          />
          <button
            onClick={handleSend}
            disabled={isUploading || isSending}
            className="btn-primary disabled:opacity-60"
          >
            {isSending ? "Sending..." : "Send"}
          </button>
        </div>
        {isUploading && (
          <p className="text-xs text-muted-foreground">Reading your PDF...</p>
        )}
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    </div>
  );
};

export default PdfChatClient;

