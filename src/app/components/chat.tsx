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
  }) as { messages: MessageWithTimestamp[]; input: string; handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void; handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void };

  const chatParent = useRef<HTMLUListElement>(null);
  const [savedMessages, setSavedMessages] = useState<MessageWithTimestamp[]>([]);

  useEffect(() => {
    const domNode = chatParent.current;
    if (domNode) {
      domNode.scrollTop = domNode.scrollHeight;
    }

    // Fetch the chat cookie
    fetch('/api/get-cookie?name=chat')
      .then(response => response.json())
      .then(data => {
        if (data.value) {
          const parsedMessages = JSON.parse(data.value).messages;
          setSavedMessages(parsedMessages);
        } else {
          setSavedMessages([]);
        }
      })
      .catch(error => {
        console.error('Error fetching chat cookie:', error);
        setSavedMessages([]);
      });
  }, []);

  useEffect(() => {
    console.log('Messages:', messages);
    if (messages.length > 0) {
      // Set the chat cookie
      fetch('/api/set-cookie', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'chat', value: JSON.stringify({ messages }) }),
      })
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(error => console.error('Error setting chat cookie:', error));
    }
  }, [messages]);

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Submitting message:', input);
    handleSubmit(e);
  };

  return (
    <main className="flex flex-col w-full h-screen max-h-dvh bg-background">
      <header className="p-4 border-b w-full max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold">Chat with me about strength exercises</h1>
      </header>

      <section className="container px-0 pb-10 flex flex-col flex-grow gap-4 mx-auto max-w-3xl">
        <ul ref={chatParent} className="h-1 p-4 flex-grow bg-muted/50 rounded-lg overflow-y-auto flex flex-col gap-4">
          {[...savedMessages, ...messages].map((m, index) => (
            <div key={index}>
              {m.role === 'user' ? (
                <li key={m.id} className="flex flex-row">
                  <div className="rounded-xl p-4 bg-background shadow-md flex">
                    <p className="text-primary">{m.content}</p>
                  </div>
                </li>
              ) : (
                <li key={m.id} className="flex flex-row-reverse">
                  <div className="rounded-xl p-4 bg-background shadow-md flex w-3/4">
                    <p className="text-primary">{m.content}</p>
                  </div>
                </li>
              )}
            </div>
          ))}
        </ul>
      </section>

      <section className="p-4">
        <form onSubmit={handleFormSubmit} className="flex w-full max-w-3xl mx-auto items-center">
          <Input className="flex-1 min-h-[40px]" placeholder="Type your question here..." type="text" value={input} onChange={handleInputChange} />
          <Button className="ml-2" type="submit">
            Submit
          </Button>
        </form>
      </section>
    </main>
  );
}
