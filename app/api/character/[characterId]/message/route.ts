import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, ChatSession } from "@google/generative-ai";
import { requireUser } from "@/lib/auth";

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
  try {
    const user = await requireUser();
    const { characterId } = await params;

    const chats = await prisma.message.findMany({
      where: {
        characterId,
        userId: user.id,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json(chats);
  } catch (error) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }
};

export const POST = async (
  req: NextRequest,
  { params }: { params: Promise<{ characterId: string }> }
) => {
  try {
    const user = await requireUser();
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
        userId: user.id,
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

      messages.forEach((message: any) => {
        history.push({
          role: (message.role || "user") as "user" | "model",
          parts: [{ text: message.content }],
        });
      });

      chat = model.startChat({
        history,
      });
    }

    // Retry logic for handling rate limits
    let result;
    let retries = 0;
    const maxRetries = 3;
    const baseDelay = 1000; // 1 second

    while (retries < maxRetries) {
      try {
        result = await chat.sendMessage(content);
        break; // Success, exit loop
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes("429") &&
          retries < maxRetries - 1
        ) {
          const delay = baseDelay * Math.pow(2, retries); // Exponential backoff
          console.log(
            `Rate limit hit, retrying in ${delay}ms... (attempt ${
              retries + 1
            }/${maxRetries})`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          retries++;
        } else {
          throw error; // Re-throw if not 429 or max retries reached
        }
      }
    }

    if (!result) {
      throw new Error("Failed to get response after retries");
    }

    const response = result.response;
    const text = response.text();
    await prisma.message.create({
      data: {
        character: {
          connect: {
            id: characterId,
          },
        },
        user: {
          connect: {
            id: user.id,
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
        user: {
          connect: {
            id: user.id,
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

export const DELETE = async (
  req: NextRequest,
  { params }: { params: Promise<{ characterId: string }> }
) => {
  try {
    const user = await requireUser();
    const { characterId } = await params;

    // Delete all messages for this character and user
    await prisma.message.deleteMany({
      where: {
        characterId,
        userId: user.id,
      },
    });

    return NextResponse.json({ message: "Chat history deleted successfully" });
  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    console.error("Error deleting chat history:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete chat history",
      },
      { status: 500 }
    );
  }
};
