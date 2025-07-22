import { NextRequest, NextResponse } from "next/server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { currentUser } from "@clerk/nextjs/server";
import { inngest } from "@/inngest/client";
import { v4 as uuidv4 } from "uuid";
import fs from "fs/promises";
import path from "path";
import os from "os";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const resumeFile: File | null = formData.get("resumeFile") as File;
    const recordId = formData.get("recordId") as string;
    const user = await currentUser();

    if (!resumeFile || !recordId || !user) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Convert to Buffer
    const arrayBuffer = await resumeFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Save to temporary path
    const tempFilePath = path.join(os.tmpdir(), `${uuidv4()}.pdf`);
    await fs.writeFile(tempFilePath, buffer);

    // Load PDF content
    const loader = new PDFLoader(tempFilePath);
    const docs = await loader.load();
    const pdfText = docs[0]?.pageContent || "";

    // Send data to Inngest
    const resultIds = await inngest.send({
      name: "AiResumeAgent",
      data: {
        recordId,
        base64ResumeFile: buffer.toString("base64"),
        pdfText,
        aiAgentType: "/ai-tools/ai-resume-analyzer",
        userEmail: user?.primaryEmailAddress?.emailAddress,
      },
    });

    const runId = resultIds?.ids[0];
    let runStatus;

    while (true) {
      runStatus = await getRuns(runId);
      if (runStatus?.data?.[0]?.status === "Completed") break;
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    return NextResponse.json({
      output: runStatus.data?.[0].output?.output[0],
      recordId, // ✅ send recordId back to the client
    });
  } catch (error) {
    console.error("Resume API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

async function getRuns(runId: string) {
  const result = await axios.get(`${process.env.INNGEST_SERVER_HOST}/v1/events/${runId}/runs`, {
    headers: {
      Authorization: `Bearer ${process.env.INNGEST_SIGNING_KEY}`,
    },
  });

  return result.data;
}
