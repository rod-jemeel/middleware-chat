// chat.tsx
'use client'

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useChat } from "ai/react"
import { useRef, useEffect, useState } from 'react'
import { Message } from "ai/react";

interface MessageWithTimestamp extends Message {
  timestamp?: string;
}

export function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/chat',
    onError: (e) => {
      console.log(e)
    }
  }) as { messages: MessageWithTimestamp[]; input: string; handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void; handleSubmit: () => void };

  const chatParent = useRef<HTMLUListElement>(null);
  const [chatCookie, setChatCookie] = useState<string | null>(null);
  const [savedMessages, setSavedMessages] = useState<MessageWithTimestamp[]>([]);

  useEffect(() => {
    const domNode = chatParent.current;
    if (domNode) {
      domNode.scrollTop = domNode.scrollHeight;
    }

    // Get the chat cookie
    const cookie = getCookie('chat');
    setChatCookie(cookie || null);

    if (cookie) {
      const parsedMessages = JSON.parse(cookie).messages;
      setSavedMessages(parsedMessages);
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      // Add a timestamp to each message if it doesn't already have one
      const messagesWithTimestamps = messages.map((message) => {
        if (!message.timestamp) {
          message.timestamp = new Date().toISOString();
        }
        return message;
      });

      // Save messages to cookie
      document.cookie = `chat=${JSON.stringify({ messages: messagesWithTimestamps })}; path=/;`;
    }
  }, [messages]);

  // Helper function to format timestamp (you can customize this)
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <main className="flex flex-col w-full h-screen max-h-dvh bg-background">
      <header className="p-4 border-b w-full max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold">Chat with me</h1>
      </header>

      <section className="container px-0 pb-10 flex flex-col flex-grow gap-4 mx-auto max-w-3xl">
        <ul ref={chatParent} className="h-1 p-4 flex-grow bg-muted/50 rounded-lg overflow-y-auto flex flex-col gap-4">
          {savedMessages.map((m, index) => (
            <div key={index}>
              {m.role === 'user' ? (
                <li key={m.id} className="flex flex-row">
                  <div className="rounded-xl p-4 bg-background shadow-md flex">
                    <p className="text-primary">{m.content}</p>
                    {m.timestamp && (
                      <span className="text-xs text-gray-500 ml-2">
                        {formatTimestamp(m.timestamp)}
                      </span>
                    )}
                  </div>
                </li>
              ) : (
                <li key={m.id} className="flex flex-row-reverse">
                  <div className="rounded-xl p-4 bg-background shadow-md flex w-3/4">
                    <p className="text-primary">{m.content}</p>
                    {m.timestamp && (
                      <span className="text-xs text-gray-500 ml-2">
                        {formatTimestamp(m.timestamp)}
                      </span>
                    )}
                  </div>
                </li>
              )}
            </div>
          ))}
        </ul>
      </section>

      <section className="p-4">
        <form onSubmit={handleSubmit} className="flex w-full max-w-3xl mx-auto items-center">
          <Input className="flex-1 min-h-[40px]" placeholder="Type your question here..." type="text" value={input} onChange={handleInputChange} />
          <Button className="ml-2" type="submit">
            Submit
          </Button>
        </form>
      </section>
    </main>
  );
}

function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
}
