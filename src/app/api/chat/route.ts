// src/app/api/chat/route.ts
import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { HttpResponseOutputParser } from 'langchain/output_parsers';
import { RunnableSequence, Runnable } from '@langchain/core/runnables';
import { formatDocumentsAsString } from 'langchain/util/document';
import {
  Message as VercelChatMessage,
  StreamingTextResponse,
  createStreamDataTransformer,
} from 'ai';

const TEMPLATE = `Answer the user's questions based only on the following context. If the answer is not in the context, reply politely that you do not have that information available.:
==============================
Context: {context}
==============================
Current conversation: {chat_history}

user: {question}
assistant:`;

export const dynamic = 'force-dynamic';

const formatMessage = (message: VercelChatMessage) => {
  return `${message.role}: ${message.content}`;
};

export async function POST(req: NextRequest) {
  try {
    // Extract the `messages` from the body of the request
    const { messages } = await req.json();

    const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);

    const currentMessageContent = messages[messages.length - 1].content;

    // Call the Exercises API
    const exercisesResponse = await axios.get('https://api.api-ninjas.com/v1/exercises?type=strength', {
      headers: {
        'X-Api-Key': process.env.API_NINJAS_API_KEY!,
      },
    });

    const exercises = exercisesResponse.data;
const formattedExercises = formatDocumentsAsString(
  exercises.map((exercise: any) => ({
    pageContent: JSON.stringify(exercise),
    metadata: {},
  }))
);
    const prompt = PromptTemplate.fromTemplate(TEMPLATE);

    const model = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
      model: 'gpt-3.5-turbo',
      temperature: 0.2,
      streaming: true,
      verbose: true,
    });

    const parser = new HttpResponseOutputParser();

    const chain = RunnableSequence.from([
    {
        question: (input) => input.question,
        chat_history: (input) => input.chat_history,
        context: () => formattedExercises,
    },
    prompt,
    model,
    parser,
    ]);

    // Convert the response into a friendly text-stream
    const stream = await chain.stream({
      chat_history: formattedPreviousMessages.join('\n'),
      question: currentMessageContent,
    });

    // Respond with the stream
    return new StreamingTextResponse(
      stream.pipeThrough(createStreamDataTransformer()),
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}
