import { NextRequest, NextResponse } from "next/server";
import { RAGService } from "@/lib/rag-service";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        const userId = session?.user?.email || "anonymous";

        const body = await req.json();
        const { chat_id } = body;

        const groqApiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
        const chatId = chat_id || "default";

        if (!groqApiKey) {
            return NextResponse.json({ error: "Missing Groq API key" }, { status: 400 });
        }

        const ragService = new RAGService(userId, chatId, groqApiKey);
        ragService.clearHistory();

        return NextResponse.json({ message: `Session history cleared for ${userId} in chat ${chatId}` });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
