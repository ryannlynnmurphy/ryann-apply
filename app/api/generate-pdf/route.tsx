import { renderToBuffer } from "@react-pdf/renderer";
import { NextRequest, NextResponse } from "next/server";
import CoverLetterPDF from "@/lib/pdf/cover-letter-pdf";
import ResumePDF from "@/lib/pdf/resume-pdf";

export async function POST(request: NextRequest) {
  try {
    const { type, content, profile } = await request.json();

    if (!type || !content || !profile) {
      return NextResponse.json(
        { error: "Missing required fields: type, content, profile" },
        { status: 400 }
      );
    }

    const doc =
      type === "cover-letter" ? (
        <CoverLetterPDF coverLetter={content} profile={profile} />
      ) : (
        <ResumePDF resume={content} profile={profile} />
      );

    const pdfBuffer = await renderToBuffer(doc);
    const buffer = new Uint8Array(pdfBuffer);

    const filename =
      type === "cover-letter"
        ? `RyannMurphy_CoverLetter_${Date.now()}.pdf`
        : `RyannMurphy_Resume_${Date.now()}.pdf`;

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("PDF generation failed:", err);
    return NextResponse.json(
      { error: "PDF generation failed" },
      { status: 500 }
    );
  }
}
