'use client';

import { UIMessage, useChat } from '@ai-sdk/react';
import { useEffect, useRef, useState } from 'react';
import dompurify from 'dompurify';
import { useCurrentEditor } from '@tiptap/react';

const SUGGESTIONS = [
  "What can you help me with?",
  "What is the main idea of the document?",
] as const;

export default function Chat({
  documentId,
  user,
}: Readonly<{
  documentId: string;
  user: { id: string; name?: string | null; email?: string | null };
}>) {
  const [input, setInput] = useState('');
  const { messages, sendMessage, status, stop } = useChat();
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { editor } = useCurrentEditor();
  const sanitizer = dompurify.sanitize;
  const isBusy = status === 'submitted' || status === 'streaming';
  const firstName = user.name?.split(' ')[0] ?? 'there';

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, status]);

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isBusy) return;
    sendMessage(
      { text: trimmed },
      { body: { documentId, docText: editor?.getHTML() } }
    );
    setInput('');
  }

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="absolute md:bottom-4 bottom-12 right-4 z-50 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-teal-800 px-4 py-2.5 text-sm font-medium text-white shadow-lg transition hover:bg-teal-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700/40 focus-visible:ring-offset-2"
          aria-label="Open AI chat"
        >
          <ChatIcon />
          Ask AI
        </button>
      )}

      {isOpen && (
        <div
          className="absolute bottom-4 right-4 z-50 flex h-[min(32rem,80vh)] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xl animate-in fade-in-0 slide-in-from-bottom-2 duration-200"
          aria-label="AI document assistant"
        >
          <header className="flex shrink-0 items-center justify-between border-b border-neutral-200 bg-neutral-50/90 px-3 py-2.5">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-neutral-900">Document assistant</p>
              <p className="truncate text-xs text-neutral-500">
                {isBusy ? 'Thinking…' : 'Ask about this document'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="inline-flex size-8 items-center justify-center rounded-md text-neutral-500 transition hover:bg-neutral-200/70 hover:text-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700/25"
              aria-label="Close chat"
            >
              <CloseIcon />
            </button>
          </header>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-3 scrollbar-thin scrollbar-thumb-neutral-300 scrollbar-track-transparent">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col justify-center gap-4">
                <div>
                  <p className="text-sm font-medium text-neutral-900">
                    Hi {firstName}
                  </p>
                  <p className="mt-1 text-sm text-neutral-500">
                    Ask a question or pick a suggestion to get started.
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  {SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      disabled={isBusy}
                      className="rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-left text-sm text-neutral-700 transition hover:border-teal-700/30 hover:bg-teal-50 hover:text-teal-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700/25 disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={() => send(suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message: UIMessage) => {
                const isUser = message.role === 'user';
                return (
                  <div
                    key={message.id}
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={[
                        'max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed',
                        isUser
                          ? 'rounded-br-md bg-teal-800 text-white'
                          : 'rounded-bl-md border border-neutral-200 bg-neutral-50 text-neutral-800',
                      ].join(' ')}
                    >
                      {!isUser && (
                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-teal-800">
                          Assistant
                        </p>
                      )}
                      {message.parts.map((part, i) => {
                        if (part.type !== 'text') return null;
                        return isUser ? (
                          <p key={`${message.id}-${i}`} className="whitespace-pre-wrap">
                            {part.text}
                          </p>
                        ) : (
                          <div
                            key={`${message.id}-${i}`}
                            className="[&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5"
                            dangerouslySetInnerHTML={{ __html: sanitizer(part.text) }}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
            {isBusy && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-500">
                  <span className="inline-flex gap-1">
                    <span className="size-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:-0.2s]" />
                    <span className="size-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:-0.1s]" />
                    <span className="size-1.5 animate-bounce rounded-full bg-neutral-400" />
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form
            className="shrink-0 border-t border-neutral-200 bg-white p-3"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                className="min-w-0 flex-1 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-800 placeholder:text-neutral-400 outline-none transition focus:border-teal-700/40 focus:bg-white focus:ring-2 focus:ring-teal-700/20 disabled:opacity-60"
                value={input}
                placeholder="Ask about this document…"
                disabled={isBusy}
                onChange={(e) => setInput(e.currentTarget.value)}
              />
              {isBusy ? (
                <button
                  type="button"
                  onClick={() => stop()}
                  className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-700 transition hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700/25"
                  aria-label="Stop generating"
                >
                  <StopIcon />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-teal-800 text-white transition hover:bg-teal-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700/40 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400"
                  aria-label="Send message"
                >
                  <SendIcon />
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </>
  );
}

function ChatIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M8 10h8M8 14h5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M21 12a8.5 8.5 0 0 1-8.5 8.5c-1.2 0-2.3-.2-3.3-.7L4 21l1.3-4.1A8.4 8.4 0 0 1 3.5 12 8.5 8.5 0 1 1 21 12Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M18 6 6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 12h14M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="6" y="6" width="12" height="12" rx="1.5" fill="currentColor" />
    </svg>
  );
}
