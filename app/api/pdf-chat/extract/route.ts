import { NextRequest, NextResponse } from "next/server";
import pdfParse from "pdf-parse";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { fileName, fileData } = await req.json();

    if (!fileName || !fileData) {
      return NextResponse.json(
        { error: "fileName and fileData are required." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(fileData, "base64");
    const data = await pdfParse(buffer);

    const text = (data.text || "").trim();
    if (!text) {
      return NextResponse.json(
        { error: "No readable text found in the PDF." },
        { status: 400 }
      );
    }

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("PDF extract error:", error);
    return NextResponse.json(
      { error: "Failed to extract text from PDF." },
      { status: 500 }
    );
  }
}

