import { NextRequest, NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { companionId, pdfSummary } = await req.json();

    if (!companionId || typeof pdfSummary !== "string") {
      return NextResponse.json(
        { error: "companionId and pdfSummary are required." },
        { status: 400 }
      );
    }

    const supabase = createSupabaseClient();

    const { data, error } = await supabase
      .from("companions")
      .update({ pdf_summary: pdfSummary })
      .eq("id", companionId)
      .select();

    if (error) {
      console.error("Supabase update error:", error);
      return NextResponse.json(
        { error: "Failed to save PDF summary." },
        { status: 500 }
      );
    }

    return NextResponse.json({ companion: data?.[0] || null });
  } catch (error: any) {
    console.error("Companion pdf-summary error:", error);
    return NextResponse.json(
      { error: "Failed to save PDF summary for companion." },
      { status: 500 }
    );
  }
}

