/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useParams } from "next/navigation";

interface Character {
  id: string;
  name: string;
  description: string;
  image: string;
  basePrompt?: string;
  greetingText?: string;
}

interface Message {
  id: string;
  content: string;
  sender: string;
  createdAt: string;
  characterId: string;
}

export default function ChatPage() {
  const params = useParams();
  const characterId = params.characterId as string;

  const [character, setCharacter] = useState<Character | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    if (characterId) {
      fetchCharacter();
      fetchMessages();
    }
  }, [characterId]);

  const fetchCharacter = async () => {
    try {
      const response = await fetch("/api/character");
      if (response.ok) {
        const data = await response.json();
        const found = data.find((c: Character) => c.id === characterId);
        setCharacter(found || null);
      }
    } catch (error) {
      console.error("Failed to fetch character:", error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/character/${characterId}/message`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const response = await fetch(`/api/character/${characterId}/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newMessage }),
      });

      if (response.ok) {
        await fetchMessages();
        setNewMessage("");
      } else {
        alert("Failed to send message");
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto py-8">Loading...</div>;
  }

  if (!character) {
    return <div className="container mx-auto py-8">Character not found</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-6">
        <Image
          src={character.image}
          alt={character.name}
          width={64}
          height={64}
          className="object-cover rounded"
        />
        <div>
          <h1 className="text-2xl font-bold">{character.name}</h1>
          <p className="text-gray-600">{character.description}</p>
        </div>
      </div>

      <div className="border rounded-lg p-4 mb-4 max-h-96 overflow-y-auto">
        {messages.length === 0 ? (
          <p className="text-gray-500">
            No messages yet. Start the conversation!
          </p>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="mb-2">
              <div
                className={`rounded p-2 ${
                  message.sender === "user"
                    ? "bg-blue-100 ml-auto"
                    : "bg-gray-100"
                }`}
              >
                <p>
                  <strong>
                    {message.sender === "user" ? "You" : character?.name}:
                  </strong>{" "}
                  {message.content}
                </p>
                <small className="text-gray-500">
                  {new Date(message.createdAt).toLocaleString()}
                </small>
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={sendMessage} className="flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1"
        />
        <Button type="submit" disabled={sending}>
          {sending ? "Sending..." : "Send"}
        </Button>
      </form>
    </div>
  );
}
