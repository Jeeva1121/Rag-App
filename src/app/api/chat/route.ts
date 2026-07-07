import "@/lib/polyfill";
import { NextRequest, NextResponse } from "next/server";
import { RAGService } from "@/lib/rag-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
    return NextResponse.json(
        { detail: "Method not allowed. Use POST to send a chat message." },
        { status: 405, headers: { Allow: "POST, OPTIONS" } }
    );
}

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
        const body = await req.json();
        const { query, user_id, groq_api_key: groq_key, pdf_text } = body;

        const groqApiKey = groq_key || process.env.NEXT_PUBLIC_GROQ_API_KEY;
        const userId = user_id || "default";

        if (!groqApiKey) {
            return NextResponse.json({ detail: "Missing Groq API key" }, { status: 400 });
        }

        const ragService = new RAGService(userId, groqApiKey);
        const stream = await ragService.getChatResponse(query, pdf_text);

        const encoder = new TextEncoder();
        const readableStream = new ReadableStream({
            async start(controller) {
                let fullAnswer = "";
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "status", content: "thinking..." })}\n\n`));

                try {
                    const reader = stream.getReader();
                    const decoder = new TextDecoder();
                    let buffer = "";

                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;

                        buffer += decoder.decode(value, { stream: true });
                        const lines = buffer.split("\n\n");
                        buffer = lines.pop() || "";

                        for (const line of lines) {
                            const trimmedLine = line.trim();
                            if (!trimmedLine || !trimmedLine.startsWith("data: ")) continue;
                            
                            const dataStr = trimmedLine.slice(6).trim();
                            if (dataStr === "[DONE]") {
                                continue;
                            }

                            try {
                                const data = JSON.parse(dataStr);
                                const content = data.choices?.[0]?.delta?.content;
                                if (content) {
                                    fullAnswer += content;
                                    // Forward the content to the frontend in the exact format it expects
                                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "content", content: content })}\n\n`));
                                }
                            } catch (e) {
                                // Ignore split JSON
                            }
                        }
                    }

                    if (fullAnswer) {
                        ragService.updateHistory(query, fullAnswer);
                    }

                    controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                } catch (err: any) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "error", detail: err.message })}\n\n`));
                    controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                } finally {
                    controller.close();
                }
            },
        });

        return new Response(readableStream, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            },
        });
    } catch (error: any) {
        console.error("Chat Error:", error);
        return NextResponse.json({ detail: error.message || "Internal Server Error" }, { status: 500 });
    }
}
