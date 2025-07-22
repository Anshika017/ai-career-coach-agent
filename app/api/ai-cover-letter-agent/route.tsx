// File: app/api/ai-cover-letter-agent/route.ts

import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { inngest } from "@/inngest/client";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    const { coverid, userInput } = await req.json();
    const user = await currentUser();

    if (!coverid || !user || !userInput) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const resultIds = await inngest.send({
      name: "AiCoverLetterAgent",
      data: {
        coverid,
        userInput,
        aiAgentType: "/ai-tools/ai-cover-letter-agent",
        userEmail: user.primaryEmailAddress?.emailAddress,
      },
    });

    const runId = resultIds?.ids?.[0];
    if (!runId) {
      return NextResponse.json({ error: "Failed to initiate Inngest run" }, { status: 500 });
    }

    let runStatus;
    const maxAttempts = 60;

    for (let i = 0; i < maxAttempts; i++) {
      runStatus = await getRuns(runId);
      const currentRun = runStatus?.data?.[0];
      const rawOutput = currentRun?.output;
      const output =
        rawOutput?.output?.[0] ||
        rawOutput?.output ||
        rawOutput ||
        null;

      if (output) {
        return NextResponse.json({ output, coverid });
      }

      if (currentRun?.status === "Failed") {
        console.error("❌ Inngest function failed:", currentRun);
        return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
      }

      await new Promise((res) => setTimeout(res, 1000));
    }

    console.error("❌ Output not found after polling:", JSON.stringify(runStatus, null, 2));
    return NextResponse.json({ error: "Output not available yet. Try again later." }, { status: 500 });
  } catch (err: any) {
    console.error("Cover Letter API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

async function getRuns(runId: string) {
  const resp = await axios.get(`${process.env.INNGEST_SERVER_HOST}/v1/events/${runId}/runs`, {
    headers: { Authorization: `Bearer ${process.env.INNGEST_SIGNING_KEY}` },
  });
  return resp.data;
}
