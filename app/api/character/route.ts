import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const GET = async () => {
  try {
    const characters = await prisma.character.findMany({});
    return NextResponse.json(characters);
  } catch (error) {
    console.error("GET /characters error:", error);
    return NextResponse.json(
      { error: "Failed to fetch characters" },
      { status: 500 }
    );
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const data = (await req.json()) as Prisma.CharacterCreateInput;

    if (!data.name) {
      return NextResponse.json(
        { error: "Character name is required" },
        { status: 400 }
      );
    }
    if (!data.description) {
      return NextResponse.json(
        { error: "Description is required" },
        { status: 400 }
      );
    }
    if (!data.image) {
      return NextResponse.json({ error: "Image is required" }, { status: 400 });
    }
    const character = await prisma.character.create({
      data,
    });

    return NextResponse.json(character);
  } catch (error) {
    console.error("POST /characters error:", error);
    return NextResponse.json(
      { error: "Failed to create character" },
      { status: 500 }
    );
  }
};
