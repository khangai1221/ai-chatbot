/* eslint-disable @typescript-eslint/no-explicit-any */
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const character = await prisma.character.findUnique({
      where: { id },
    });

    if (!character) {
      return NextResponse.json(
        { error: "Character not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(character);
  } catch (error) {
    console.error("GET /characters/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch character" },
      { status: 500 }
    );
  }
};

export const PUT = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const data = (await req.json()) as Prisma.CharacterUpdateInput;

    if (!data.name || !data.description) {
      return NextResponse.json(
        { error: "Name and description are required" },
        { status: 400 }
      );
    }

    // For update, image is optional - if not provided, keep existing
    if (!data.image) {
      // Remove image from data so it doesn't overwrite with empty
      delete data.image;
    }

    const character = await prisma.character.update({
      where: { id },
      data,
    });

    return NextResponse.json(character);
  } catch (error) {
    console.error("PUT /characters/[id] error:", error);
    if ((error as any)?.code === "P2025") {
      return NextResponse.json(
        { error: "Character not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update character" },
      { status: 500 }
    );
  }
};

export const DELETE = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    await prisma.character.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Character deleted" });
  } catch (error) {
    console.error("DELETE /characters/[id] error:", error);
    if ((error as any)?.code === "P2025") {
      return NextResponse.json(
        { error: "Character not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to delete character" },
      { status: 500 }
    );
  }
};
