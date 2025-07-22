import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../configs/db";
import { historyTable } from "../../../configs/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq, desc } from "drizzle-orm";

// === POST ===
export async function POST(req: NextRequest) {
  const { content, recordId, aiAgentType } = await req.json();
  const user = await currentUser();

  if (!user?.primaryEmailAddress) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  try {
    const result = await db.insert(historyTable).values({
      recordId,
      content,
      userEmail: user.primaryEmailAddress.emailAddress,
      createdAt: new Date(),
      aiAgentType,
    });

    return NextResponse.json({ message: "Record inserted successfully", result });
  } catch (e) {
    console.error("❌ DB Insertion Error:", e);
    return NextResponse.json({ error: "Database insertion failed", details: String(e) }, { status: 500 });
  }
}

// === PUT ===
export async function PUT(req: NextRequest) {
  const { content, recordId } = await req.json();

  try {
    const result = await db
      .update(historyTable)
      .set({ content })
      .where(eq(historyTable.recordId, recordId));

    return NextResponse.json({ message: "Record updated successfully", result });
  } catch (e) {
    console.error("❌ DB Update Error:", e);
    return NextResponse.json({ error: "Database update failed", details: String(e) }, { status: 500 });
  }
}

// === GET ===
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const recordId = searchParams.get("recordId");
  const user = await currentUser();

  if (!user?.primaryEmailAddress) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  try {
    if (recordId) {
      const result = await db
        .select()
        .from(historyTable)
        .where(eq(historyTable.recordId, recordId));

      return NextResponse.json(result[0] || {});
    } else {
      const result = await db
        .select()
        .from(historyTable)
        .where(eq(historyTable.userEmail, user.primaryEmailAddress.emailAddress))
        .orderBy(desc(historyTable.id));

      return NextResponse.json(result);
    }
  } catch (e) {
    console.error("❌ DB Fetch Error:", e);
    return NextResponse.json({ error: "Database fetch failed", details: String(e) }, { status: 500 });
  }
}
