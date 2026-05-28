import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Send, Bot, User, Trash2 } from "lucide-react";
import { PageHeader, Panel } from "@/components/module-shell";
import { useStore, genId } from "@/lib/store";

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
  const { store, dispatch } = useStore();
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    dispatch({
      type: "ADD_CHAT_MESSAGE",
      payload: {
        id: genId(),
        role: "user",
        content: input,
        timestamp: new Date().toLocaleTimeString(),
      },
    });
    setInput("");
    setTimeout(() => {
      dispatch({
        type: "ADD_CHAT_MESSAGE",
        payload: {
          id: genId(),
          role: "assistant",
          content: botResponses[Math.floor(Math.random() * botResponses.length)],
          timestamp: new Date().toLocaleTimeString(),
        },
      });
    }, 800);
  };

  return (
    <div>
      <PageHeader
        title="AI Assistant"
        subtitle="Your intelligent campus support chatbot (AI-01)"
        actions={
          <button
            onClick={() => dispatch({ type: "CLEAR_CHAT", payload: undefined })}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear
          </button>
        }
      />
      <div className="max-w-2xl">
        <Panel title="Chat with Campus AI">
          <div className="h-96 overflow-y-auto space-y-3 mb-4 pr-2">
            {store.chatMessages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-accent/10 text-accent mb-3">
                  <Bot className="h-7 w-7" />
                </div>
                <div className="font-semibold">Hi Aarav! 👋</div>
                <div className="text-sm text-muted-foreground mt-1 max-w-xs">
                  I'm your AI assistant. Ask me about your classes, attendance, fees, or anything
                  else!
                </div>
              </div>
            )}
            {store.chatMessages.map((m) => (
              <div key={m.id} className={`flex gap-2 ${m.role === "user" ? "justify-end" : ""}`}>
                {m.role === "assistant" && (
                  <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent/10 text-accent">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}
                >
                  {m.content}
                  <div
                    className={`text-[10px] mt-1 ${m.role === "user" ? "text-primary-foreground/60" : "text-muted-foreground"}`}
                  >
                    {m.timestamp}
                  </div>
                </div>
                {m.role === "user" && (
                  <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                    <User className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>
            ))}
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
