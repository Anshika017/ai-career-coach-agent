import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { inngest } from "@/inngest/client";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    const { roadmapId, userInput } = await req.json();
    const user = await currentUser();

    if (!roadmapId || !user || !userInput) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await inngest.send({
      name: "AIRoadmapAgent",
      data: {
        roadmapId,
        userInput,
        userEmail: user.primaryEmailAddress?.emailAddress || "",
      },
    });

    const runId = result?.ids?.[0];
    if (!runId) {
      return NextResponse.json({ error: "Failed to initiate Inngest run" }, { status: 500 });
    }

    const maxAttempts = 90;

    for (let i = 0; i < maxAttempts; i++) {
      const runStatus = await getRunStatus(runId);
      const currentRun = runStatus?.data?.[0];

      if (!currentRun) {
        await delay(1000);
        continue;
      }

      const output = extractOutput(currentRun?.output);

      if (output) {
        return NextResponse.json({ output, roadmapId });
      }

      if (currentRun.status === "Failed") {
        console.error("❌ Inngest function failed:", currentRun);
        return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
      }

      await delay(1000);
    }

    return NextResponse.json({ error: "Output not available yet. Try again later." }, { status: 504 });

  } catch (err: any) {
    console.error("❌ Roadmap API Error:", err?.message || err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

function extractOutput(output: any): any {
  try {
    return output?.output?.[0] || output?.output || output || null;
  } catch {
    return null;
  }
}

async function getRunStatus(runId: string) {
  try {
    const response = await axios.get(`${process.env.INNGEST_SERVER_HOST}/v1/events/${runId}/runs`, {
      headers: {
        Authorization: `Bearer ${process.env.INNGEST_SIGNING_KEY}`,
      },
    });
    return response.data;
  } catch (err: any) {
    console.error("❌ Failed to fetch run status:", err?.message || err);
    return null;
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
