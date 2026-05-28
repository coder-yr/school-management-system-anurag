import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Send, Bot, User, Trash2 } from "lucide-react";
import { PageHeader, Panel } from "@/components/module-shell";

const genId = () => Math.random().toString(36).substr(2, 9);

export const Route = createFileRoute("/student/ai-hub")({ component: Page });

const botResponses = [
  "I can help you with that! Based on your current syllabus, I'd recommend focusing on Chapter 4 for the upcoming exam.",
  "Your attendance is currently at 92%. Keep it up! You need to maintain above 75% for exam eligibility.",
  "The fee payment deadline is June 5. You have ₹12,400 outstanding. Would you like me to show you payment options?",
  "Based on your performance trend, your predicted score for the pre-final is between 82-88%. Great improvement!",
  "The library book 'Calculus: Early Transcendentals' is overdue. Please return it to avoid late fees.",
  "Your next class is Mathematics at 08:30 in Room 201 with Mrs. Iyer. The topic is Quadratic Equations.",
];

function Page() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = {
        id: genId(),
        role: "user",
        content: input,
        timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTimeout(() => {
        const botMsg = {
          id: genId(),
          role: "assistant",
          content: botResponses[Math.floor(Math.random() * botResponses.length)],
          timestamp: new Date().toLocaleTimeString(),
        };
        setMessages((prev) => [...prev, botMsg]);
    }, 800);
  };

  return (
    <div>
      <PageHeader
        title="AI Assistant"
        subtitle="Your intelligent campus support chatbot (AI-01)"
        actions={
          <button
            onClick={() => setMessages([])}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear
          </button>
        }
      />
      <div className="max-w-2xl">
        <Panel title="Chat with Campus AI">
          <div className="flex-1 space-y-4 overflow-y-auto p-4 max-h-[500px]">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
                <Bot className="mb-2 h-8 w-8 opacity-50" />
                <p className="text-sm">Hi there! Ask me anything about your campus life.</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${msg.role === "user" ? "justify-end" : ""}`}
                >
                  {msg.role === "assistant" && (
                    <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent/10 text-accent">
                      <Bot className="h-3.5 w-3.5" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}
                  >
                    {msg.content}
                    <div
                      className={`text-[10px] mt-1 ${msg.role === "user" ? "text-primary-foreground/60" : "text-muted-foreground"}`}
                    >
                      {msg.timestamp}
                    </div>
                  </div>
                  {msg.role === "user" && (
                    <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                      <User className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything…"
              className="flex-1 h-10 rounded-lg border border-border bg-background px-4 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
            <button
              type="submit"
              className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </Panel>
      </div>
    </div>
  );
}
