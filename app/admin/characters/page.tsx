"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import Link from "next/link";

interface Character {
  id: string;
  name: string;
  description: string;
  image: string;
  basePrompt?: string;
  greetingText?: string;
}

export default function AdminCharactersPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(
    null
  );
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: null as File | null,
    basePrompt: "",
    greetingText: "",
  });

  useEffect(() => {
    fetchCharacters();
  }, []);

  useEffect(() => {
    if (editingCharacter) {
      setFormData({
        name: editingCharacter.name,
        description: editingCharacter.description,
        image: null,
        basePrompt: editingCharacter.basePrompt || "",
        greetingText: editingCharacter.greetingText || "",
      });
    } else {
      setFormData({
        name: "",
        description: "",
        image: null,
        basePrompt: "",
        greetingText: "",
      });
    }
  }, [editingCharacter]);

  const fetchCharacters = async () => {
    try {
      const response = await fetch("/api/character");
      const data = await response.json();
      setCharacters(data);
    } catch (error) {
      console.error("Failed to fetch characters:", error);
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Upload failed" }));
      throw new Error(errorData.details || errorData.error || "Upload failed");
    }

    const data = await response.json();
    return data.url;
  };

  const deleteCharacter = async (id: string) => {
    if (!confirm("Are you sure you want to delete this character?")) {
      return;
    }

    try {
      const response = await fetch(`/api/character/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchCharacters();
      } else {
        alert("Failed to delete character");
      }
    } catch (error) {
      console.error("Failed to delete character:", error);
      alert("Failed to delete character");
    }
  };

  const editCharacter = (character: Character) => {
    setEditingCharacter(character);
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingCharacter(null);
    setDialogOpen(true);
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setUploading(true);

    try {
      const { name, description, image } = formData;

      if (!name || !description) {
        alert("Name and description are required");
        return;
      }

      let imageUrl = editingCharacter?.image || "";
      if (image) {
        // Upload new image
        imageUrl = await uploadImage(image);
      } else if (!editingCharacter) {
        alert("Image is required for new character");
        return;
      }

      const data = {
        name,
        description,
        image: imageUrl,
        basePrompt: formData.basePrompt,
        greetingText: formData.greetingText,
      };

      const url = editingCharacter
        ? `/api/character/${editingCharacter.id}`
        : "/api/character";
      const method = editingCharacter ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        await fetchCharacters();
        setDialogOpen(false);
        setEditingCharacter(null);
        setFormData({
          name: "",
          description: "",
          image: null,
          basePrompt: "",
          greetingText: "",
        });
      } else {
        alert(`Failed to ${editingCharacter ? "update" : "create"} character`);
      }
    } catch (error) {
      console.error(
        `Failed to ${editingCharacter ? "update" : "create"} character:`,
        error
      );
      alert(`Failed to ${editingCharacter ? "update" : "create"} character`);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin - Characters</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>Create Character</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCharacter ? "Edit Character" : "Create New Character"}
              </DialogTitle>
              <DialogDescription>
                {editingCharacter
                  ? "Update the character details."
                  : "Add a new character to the system."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="basePrompt">Base Prompt</Label>
                <Input
                  id="basePrompt"
                  value={formData.basePrompt}
                  onChange={(e) =>
                    setFormData({ ...formData, basePrompt: e.target.value })
                  }
                  placeholder="Enter the base prompt for this character"
                />
              </div>
              <div>
                <Label htmlFor="greetingText">Greeting Text</Label>
                <Input
                  id="greetingText"
                  value={formData.greetingText}
                  onChange={(e) =>
                    setFormData({ ...formData, greetingText: e.target.value })
                  }
                  placeholder="Enter the greeting message"
                />
              </div>
              <div>
                <Label htmlFor="image">Image</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      image: e.target.files?.[0] || null,
                    })
                  }
                  required={!editingCharacter}
                />
                {editingCharacter && (
                  <p className="text-sm text-gray-500">
                    Leave empty to keep current image
                  </p>
                )}
              </div>
              <Button type="submit" disabled={uploading}>
                {uploading
                  ? editingCharacter
                    ? "Updating..."
                    : "Creating..."
                  : editingCharacter
                  ? "Update"
                  : "Create"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Image</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {characters.map((character) => (
            <TableRow key={character.id}>
              <TableCell>{character.name}</TableCell>
              <TableCell>{character.description}</TableCell>
              <TableCell>
                <Image
                  src={character.image}
                  alt={character.name}
                  width={50}
                  height={50}
                  className="object-cover rounded"
                />
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Link href={`/chat/${character.id}`}>
                    <Button variant="default" size="sm">
                      Chat
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => editCharacter(character)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteCharacter(character.id)}
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
