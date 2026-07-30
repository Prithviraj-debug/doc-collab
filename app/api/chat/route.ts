import {
    streamText,
    UIMessage,
    convertToModelMessages,
    createUIMessageStreamResponse,
    toUIMessageStream,
  } from 'ai';
  import { google } from "@ai-sdk/google";
  
  export async function POST(req: Request) {
    const { messages, docText }: { messages: UIMessage[], docText: string } = await req.json();
  
    const result = streamText({
      model: google("gemini-3.5-flash-lite"),
      instructions: `You are a helpful assistant that can help with tasks related to the document editing session and real time collaboration with other users in the document. You give suggestions for the user to follow to improve the document and make it more readable and understandable. You are able to find the most relevant information in the document to answer the user's question or help with the task and help the user to find grammar, spelling, and punctuation errors in the document. ALWAYS return your response in HTML format. The current document text is: ${docText}.`,
      messages: await convertToModelMessages(messages),
    });
  
    return createUIMessageStreamResponse({
      stream: toUIMessageStream({ stream: result.stream }),
    });
  }