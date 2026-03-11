import { NextRequest, NextResponse } from "next/server";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
// Groq model: see docs at https://console.groq.com/docs/model/llama-3.3-70b-versatile
const GROQ_MODEL = "llama-3.3-70b-versatile";

export async function POST(req: NextRequest) {
  if (!GROQ_API_KEY) {
    return NextResponse.json(
      { error: "GROQ_API_KEY is not configured on the server." },
      { status: 500 }
    );
  }

  try {
    const { pdfText, messages } = await req.json();

    if (!pdfText || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "pdfText and messages are required." },
        { status: 400 }
      );
    }

    const lastUserMessage = [...messages]
      .reverse()
      .find((m: { role: string; content: string }) => m.role === "user");

    if (!lastUserMessage) {
      return NextResponse.json(
        { error: "No user message provided." },
        { status: 400 }
      );
    }

    const prompt = lastUserMessage.content;

    const systemInstruction =
      "You are a helpful teaching assistant. Answer questions ONLY using the information in the provided PDF text. " +
      "If the answer is not clearly in the PDF, say that the document does not provide that information.";

    // Truncate pdfText if it is huge to avoid hitting token limits
    const maxPdfChars = 20000;
    const truncatedPdfText =
      pdfText.length > maxPdfChars
        ? pdfText.slice(0, maxPdfChars) +
          "\n\n...[PDF truncated for length in this preview]..."
        : pdfText;

    const chatMessages = [
      {
        role: "system",
        content: `${systemInstruction}

Here is the PDF content:
"""
${truncatedPdfText}
"""`,
      },
      {
        role: "user",
        content: prompt,
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
          messages: chatMessages,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq error:", response.status, errorText);
      return NextResponse.json(
        { error: "Groq API error. Check server logs for details." },
        { status: 500 }
      );
    }

    const data = await response.json();
    const reply =
      data?.choices?.[0]?.message?.content ??
      "I could not generate a response from the PDF.";

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("PDF chat error:", error);
    return NextResponse.json(
      { error: "Failed to generate a response from Groq." },
      { status: 500 }
    );
  }
}

