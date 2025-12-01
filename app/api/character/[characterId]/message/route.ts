import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, ChatSession } from "@google/generative-ai";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ characterId: string }> }
) => {
  const { characterId } = await params;

  const chats = await prisma.message.findMany({
    where: {
      characterId,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return NextResponse.json(chats);
};

export const POST = async (
  req: NextRequest,
  { params }: { params: Promise<{ characterId: string }> }
) => {
  try {
    const { characterId } = await params;
    const { content } = await req.json();

    const character = await prisma.character.findUnique({
      where: { id: characterId },
    });

    if (!character) {
      return NextResponse.json(
        { message: "Character not found!" },
        { status: 404 }
      );
    }

    const messages = await prisma.message.findMany({
      where: {
        characterId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Update any existing messages that don't have role set
    await prisma.$queryRaw`UPDATE "Message" SET role = 'user' WHERE "characterId" = ${characterId} AND role IS NULL`;

    let chat: ChatSession | undefined;

    // CHATLAAGUI BOL SETUP HIIH HESEG
    if (messages.length === 0) {
      chat = model.startChat({
        history: [
          { role: "user", parts: [{ text: character.basePrompt }] },
          { role: "model", parts: [{ text: character.greetingText }] },
        ],
      });
    } else {
      const history = [
        { role: "user", parts: [{ text: character.basePrompt }] },
        { role: "model", parts: [{ text: character.greetingText }] },
      ];

      messages.forEach((message) => {
        history.push({
          role: (message.role || "user") as "user" | "model",
          parts: [{ text: message.content }],
        });
      });

      chat = model.startChat({
        history,
      });
    }

    const result = await chat.sendMessage(content);
    const response = result.response;
    const text = response.text();
    await prisma.message.create({
      data: {
        character: {
          connect: {
            id: characterId,
          },
        },
        content,
        role: "user",
        sender: "user",
      },
    });
    await prisma.message.create({
      data: {
        character: {
          connect: {
            id: characterId,
          },
        },
        content: text,
        role: "model",
        sender: "model",
      },
    });
    return NextResponse.json({ message: text });
  } catch (error) {
    console.error("Error processing message:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to process message",
      },
      { status: 500 }
    );
  }
};
