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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-lg text-gray-600 dark:text-gray-300">
          Loading characters...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Character Management
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Create and manage AI characters for your chat application
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/">
                <Button variant="outline">← Back to Home</Button>
              </Link>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={openCreateDialog}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Create Character
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingCharacter
                        ? "Edit Character"
                        : "Create New Character"}
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
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
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
                          setFormData({
                            ...formData,
                            basePrompt: e.target.value,
                          })
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
                          setFormData({
                            ...formData,
                            greetingText: e.target.value,
                          })
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
          </div>
        </div>

        {/* Characters Grid */}
        {characters.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No characters yet
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Create your first AI character to get started
            </p>
            <Button
              onClick={openCreateDialog}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Create Your First Character
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {characters.map((character, index) => (
              <div
                key={character.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 overflow-hidden transform hover:-translate-y-2 animate-fade-in group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="aspect-square relative overflow-hidden">
                  <Image
                    src={character.image}
                    alt={character.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                    {character.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                    {character.description}
                  </p>
                  <div className="flex gap-2">
                    <Link href={`/chat/${character.id}`} className="flex-1">
                      <Button className="w-full shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                        Chat
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => editCharacter(character)}
                      className="shrink-0 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => deleteCharacter(character.id)}
                      className="shrink-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
