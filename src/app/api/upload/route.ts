import "@/lib/polyfill";
import { NextRequest, NextResponse } from "next/server";
import { RAGService } from "@/lib/rag-service";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function OPTIONS() {
    return new Response(null, {
        status: 204,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, api_key, groq_api_key",
        },
    });
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        const userId = session?.user?.email || "anonymous";

        const formData = await req.formData();
        const file = formData.get("file") as File;
        const chatId = (formData.get("chat_id") as string) || "default";
        const groqApiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;

        if (!file) {
            return NextResponse.json({ detail: "No file uploaded" }, { status: 400 });
        }

        if (!groqApiKey) {
            return NextResponse.json({ detail: "Missing Groq API key" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const ragService = new RAGService(userId, chatId, groqApiKey);
        const result = await ragService.processPdf(buffer);

        return NextResponse.json({
            filename: file.name,
            status: "indexed",
            chunks: result.chunks,
            text: result.text,
            message: `Successfully indexed ${result.chunks} chunks from ${file.name}`
        });
    } catch (error: any) {
        console.error("Upload Error:", error);
        return NextResponse.json({ detail: error.message || "Internal Server Error" }, { status: 500 });
    }
}
