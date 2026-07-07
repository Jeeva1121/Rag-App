import { NextRequest, NextResponse } from "next/server";
import { RAGService } from "@/lib/rag-service";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { user_id } = body;

        const groqApiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
        const userId = user_id || "default";

        if (!groqApiKey) {
            return NextResponse.json({ error: "Missing Groq API key" }, { status: 400 });
        }

        const ragService = new RAGService(userId, groqApiKey);
        ragService.clearHistory();

        return NextResponse.json({ message: `Session history cleared for ${userId}` });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
