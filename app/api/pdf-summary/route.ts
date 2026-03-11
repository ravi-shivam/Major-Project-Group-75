import { NextRequest, NextResponse } from "next/server";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = "llama-3.3-70b-versatile";

export async function POST(req: NextRequest) {
  if (!GROQ_API_KEY) {
    return NextResponse.json(
      { error: "GROQ_API_KEY is not configured on the server." },
      { status: 500 }
    );
  }

  try {
    const { pdfText } = await req.json();

    if (!pdfText || typeof pdfText !== "string") {
      return NextResponse.json(
        { error: "pdfText is required." },
        { status: 400 }
      );
    }

    const maxPdfChars = 20000;
    const truncatedPdfText =
      pdfText.length > maxPdfChars
        ? pdfText.slice(0, maxPdfChars)
        : pdfText;

    const messages = [
      {
        role: "system",
        content:
          "You are a helpful assistant that summarizes teaching materials. " +
          "Given the text of a PDF, produce a concise summary in 3-6 bullet points focusing on key concepts and topics. " +
          "Keep it under 500 characters.",
      },
      {
        role: "user",
        content: truncatedPdfText,
      },
    ];

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq summary error:", response.status, errorText);
      return NextResponse.json(
        { error: "Groq API error while summarizing PDF." },
        { status: 500 }
      );
    }

    const data = await response.json();
    const summary =
      data?.choices?.[0]?.message?.content ??
      "Summary could not be generated from this PDF.";

    return NextResponse.json({ summary });
  } catch (error: any) {
    console.error("PDF summary error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF summary." },
      { status: 500 }
    );
  }
}

