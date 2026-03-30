import { NextResponse } from "next/server";
import { autoApply } from "@/lib/automation/submitter";
import { Profile } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      url,
      profile,
      coverLetter,
      autoSubmit,
    }: {
      url: string;
      profile: Profile;
      coverLetter: string;
      autoSubmit: boolean;
    } = body;

    const result = await autoApply(url, profile, coverLetter, autoSubmit);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
