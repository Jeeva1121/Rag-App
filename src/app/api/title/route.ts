import { NextRequest, NextResponse } from "next/server";
import { ChatGroq } from "@langchain/groq";
import { ChatPromptTemplate } from "@langchain/core/prompts";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { query, groq_api_key } = body;

        const groqApiKey = groq_api_key || process.env.NEXT_PUBLIC_GROQ_API_KEY;

        if (!groqApiKey) {
            return NextResponse.json({ title: "New Chat" }, { status: 200 });
        }

        const llm = new ChatGroq({
            model: "llama-3.1-8b-instant",
            apiKey: groqApiKey,
            temperature: 0.1,
        });

        const prompt = ChatPromptTemplate.fromMessages([
            ["system", "You are a helpful assistant. Generate a very short, concise title (maximum 3-4 words) for a chat session that starts with the following user message. Do not include quotes or any other punctuation around the title. Just the words."],
            ["human", "{input}"],
        ]);

        const chain = prompt.pipe(llm);
        const result = await chain.invoke({
            input: query,
        });

        const title = (result.content as string).replace(/["']/g, "").trim();

        return NextResponse.json({ title });
    } catch (error: any) {
        console.error("Title Generation Error:", error);
        return NextResponse.json({ title: "New Chat" }, { status: 200 });
    }
}
