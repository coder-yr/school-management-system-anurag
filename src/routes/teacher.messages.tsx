import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader, Panel } from "@/components/module-shell";
import { useAuth } from "@/lib/auth-context";
import { createSocketClient, fetchConversations, fetchMessages, sendMessage, type ChatConversation, type ChatMessage } from "@/lib/chat-api";
import { toast } from "sonner";
import {
  Send,
  Search,
  Bell,
  AlertTriangle,
  Plus,
  CheckCircle,
  Mail,
  MessageSquare,
  Video,
  X,
  PhoneCall,
  User,
  Mic,
  MicOff,
  VideoOff,
  MonitorUp,
} from "lucide-react";

const genId = () => Math.random().toString(36).substr(2, 9);

export const Route = createFileRoute("/teacher/messages")({
  head: () => ({ meta: [{ title: "Messages & Notices · Campus OS" }] }),
  component: Page,
});

function Page() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<"direct" | "notices">("direct");

  // -- Compose State for Notices --
  const [announcementsStore, setAnnouncementsStore] = useState<any[]>([]);
  const [showCompose, setShowCompose] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [target, setTarget] = useState<"all" | "students" | "teachers" | "staff">("students");
  const [priority, setPriority] = useState<"normal" | "important" | "urgent">("normal");
  const [search, setSearch] = useState("");
  const [targetFilter, setTargetFilter] = useState("all");

  const announcements = announcementsStore.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.content.toLowerCase().includes(search.toLowerCase());
    const matchesTarget = targetFilter === "all" || a.target === targetFilter;
    return matchesSearch && matchesTarget;
  });

  const handleCompose = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }

    const newAnnouncement = {
      id: genId(),
      title,
      content,
      author: user?.name || "Teacher",
      date: new Date().toISOString().split("T")[0],
      target,
      priority,
    };

    setAnnouncementsStore((prev) => [newAnnouncement, ...prev]);
    toast.success("Notice published successfully!", {
      description: `Announcement targeted to ${target} is now active.`,
    });

    setTitle("");
    setContent("");
    setShowCompose(false);
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent":
        return (
          <span className="inline-flex items-center gap-1 rounded bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-500 uppercase">
            <AlertTriangle className="h-3 w-3" /> Urgent
          </span>
        );
      case "important":
        return (
          <span className="inline-flex items-center gap-1 rounded bg-orange-500/10 px-2 py-0.5 text-[10px] font-semibold text-orange-500 uppercase">
            <Bell className="h-3 w-3" /> Important
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-500 uppercase">
            <CheckCircle className="h-3 w-3" /> Normal
          </span>
        );
    }
  };

  const getTargetBadge = (target: string) => {
    const targetMap: Record<string, string> = {
      all: "Everyone",
      students: "Students & Parents",
      teachers: "Teachers Portal",
      staff: "General Staff",
    };
    return (
      <span className="text-xs text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded-full font-medium">
        {targetMap[target] || target}
      </span>
    );
  };

  // -- Direct Messages State --
  const [selectedChat, setSelectedChat] = useState<string>("");
  const [chatInput, setChatInput] = useState("");
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [typingUser, setTypingUser] = useState<string>("");

  useEffect(() => {
    if (!user?.id) return;

    const loadConversations = async () => {
      setLoadingChats(true);
      try {
        const data = await fetchConversations();
        setConversations(data);
        if (!selectedChat && data.length > 0) setSelectedChat(data[0]._id);
      } catch (error) {
        console.error("Failed to load conversations", error);
        toast.error("Unable to load conversation list right now.");
      } finally {
        setLoadingChats(false);
      }
    };

    void loadConversations();
  }, [user?.id]);

  useEffect(() => {
    if (!selectedChat) return;

    const loadMessages = async () => {
      try {
        const data = await fetchMessages(selectedChat);
        setMessages(data);
      } catch (error) {
        console.error("Failed to load messages", error);
        setMessages([]);
      }
    };

    void loadMessages();
  }, [selectedChat]);

  useEffect(() => {
    if (!user?.id) return;

    const socket = createSocketClient(user.id);

    socket.on("message:new", (payload: ChatMessage & { conversationId?: string }) => {
      if (payload.conversationId === selectedChat) {
        setMessages((prev) => (prev.some((item) => item._id === payload._id) ? prev : [...prev, payload]));
      }
    });

    socket.on("conversation:update", (payload: { conversationId?: string }) => {
      if (!payload.conversationId) return;
      setConversations((prev) =>
        prev.map((conversation) =>
          conversation._id === payload.conversationId
            ? { ...conversation, lastMessageAt: new Date().toISOString() }
            : conversation
        )
      );
    });

    socket.on("typing", (payload: { conversationId?: string; userId?: string; isTyping?: boolean }) => {
      if (payload.conversationId === selectedChat && payload.userId && payload.userId !== user.id) {
        setTypingUser(payload.isTyping ? payload.userId : "");
      }
    });

    return () => {
      socket.off("message:new");
      socket.off("conversation:update");
      socket.off("typing");
      socket.disconnect();
    };
  }, [selectedChat, user?.id]);

  const activeChatData = conversations.find((c) => c._id === selectedChat);
  const activeChatName =
    activeChatData?.title ||
    activeChatData?.participants
      .filter((participant) => participant._id !== user?.id)
      .map((participant) => `${participant.firstName || ""} ${participant.lastName || ""}`.trim())
      .join(", ") ||
    "Select a conversation";

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedChat || sendingMessage) return;

    try {
      setSendingMessage(true);
      const freshMessage = await sendMessage(selectedChat, chatInput.trim());
      setMessages((prev) => [...prev, freshMessage]);
      setChatInput("");
    } catch (error) {
      console.error("Failed to send message", error);
      toast.error("Message could not be sent. Please try again.");
    } finally {
      setSendingMessage(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Communications Hub"
        subtitle="Direct Messaging with parents & staff, plus school-wide notice board."
      />

      {/* Tabs */}
      <div className="flex gap-4 border-b border-border">
        <button
          onClick={() => setActiveTab("direct")}
          className={`pb-3 px-2 text-sm font-bold tracking-wide uppercase transition-all border-b-2 ${activeTab === "direct" ? "border-accent text-accent" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          Direct Messages
        </button>
        <button
          onClick={() => setActiveTab("notices")}
          className={`pb-3 px-2 text-sm font-bold tracking-wide uppercase transition-all border-b-2 ${activeTab === "notices" ? "border-accent text-accent" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          Broadcast Notices
        </button>
      </div>

      {activeTab === "direct" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px] animate-in fade-in">
          {/* Contacts List */}
          <div className="lg:col-span-1 border border-border rounded-xl bg-card flex flex-col overflow-hidden shadow-sm">
            <div className="p-4 border-b border-border bg-muted/20">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:border-accent"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loadingChats ? (
                <div className="p-4 text-sm text-muted-foreground">Loading conversations…</div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground">No conversations found yet.</div>
              ) : (
                conversations.map((chat) => {
                  const preview = chat.title || chat.participants.filter((p) => p._id !== user?.id).map((p) => `${p.firstName || ""} ${p.lastName || ""}`.trim()).join(", ");
                  return (
                    <button
                      key={chat._id}
                      onClick={() => setSelectedChat(chat._id)}
                      className={`w-full text-left p-4 flex items-start gap-3 border-b border-border transition-all ${selectedChat === chat._id ? "bg-accent/5 border-l-4 border-l-accent" : "hover:bg-muted/50 border-l-4 border-l-transparent"}`}
                    >
                      <div className="h-10 w-10 rounded-full bg-indigo-500/10 text-indigo-600 flex items-center justify-center flex-shrink-0">
                        <User className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm truncate">{preview}</span>
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                            {chat.lastMessageAt ? new Date(chat.lastMessageAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-0.5">
                          <span className="text-xs text-muted-foreground truncate pr-2">{chat.type} conversation</span>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat Window */}
          <div className="lg:col-span-2 border border-border rounded-xl bg-card flex flex-col overflow-hidden shadow-sm">
            {activeChatData ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{activeChatName}</h3>
                      <span className="text-xs text-emerald-500 font-medium">{typingUser ? "Typing…" : "Online"}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowVideoCall(true)}
                      className="p-2 rounded-lg text-accent hover:bg-accent/10 transition-colors"
                      title="Start Video Call"
                    >
                      <Video className="h-5 w-5" />
                    </button>
                    <button className="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
                      <PhoneCall className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/5">
                  <div className="text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground my-4">
                    Live conversation
                  </div>
                  {messages.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No messages yet. Start the conversation below.</div>
                  ) : (
                    messages.map((msg) => {
                      const isMine = msg.senderId?._id === user?.id;
                      return (
                        <div key={msg._id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${
                              isMine
                                ? "bg-accent text-white rounded-tr-sm"
                                : "bg-background border border-border rounded-tl-sm text-foreground"
                            }`}
                          >
                            <p>{msg.text}</p>
                            <div className={`text-[9px] mt-1 text-right ${isMine ? "text-accent-foreground/70" : "text-muted-foreground"}`}>
                              {new Date(msg.createdAt).toLocaleString([], { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-border bg-card">
                  <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder={selectedChat ? "Type your message..." : "Select a conversation first"}
                      disabled={!selectedChat || sendingMessage}
                      className="flex-1 h-10 px-4 rounded-full bg-muted/50 border border-border outline-none focus:border-accent text-sm transition-colors disabled:cursor-not-allowed"
                    />
                    <button
                      type="submit"
                      disabled={!selectedChat || sendingMessage}
                      className="h-10 w-10 rounded-full bg-accent text-white flex items-center justify-center hover:bg-accent/90 transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Send className="h-4 w-4 ml-0.5" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
                <p className="font-semibold">Select a conversation to start messaging</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "notices" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 animate-in fade-in">
          {/* Left Side Compose Panel */}
          <div className="lg:col-span-1 space-y-4">
            {showCompose ? (
              <Panel title="Compose Announcement">
                <form onSubmit={handleCompose} className="space-y-4 mt-2">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Notice Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Mathematics Mid-Term Schedule"
                      required
                      className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">
                        Target Audience
                      </label>
                      <select
                        value={target}
                        onChange={(e) => setTarget(e.target.value as any)}
                        className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent"
                      >
                        <option value="students">Students & Parents</option>
                        <option value="teachers">Teachers Only</option>
                        <option value="staff">All Staff</option>
                        <option value="all">Everyone</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">
                        Priority Level
                      </label>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as any)}
                        className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent"
                      >
                        <option value="normal">Normal</option>
                        <option value="important">Important</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Message Content
                    </label>
                    <textarea
                      rows={5}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Write detailed announcement..."
                      required
                      className="w-full rounded-lg border border-border bg-background p-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 resize-none"
                    />
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setShowCompose(false)}
                      className="h-10 px-4 rounded-lg border border-border text-sm font-semibold hover:bg-muted"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="h-10 px-4 rounded-lg bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                    >
                      Publish Notice
                    </button>
                  </div>
                </form>
              </Panel>
            ) : (
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
                <button
                  onClick={() => setShowCompose(true)}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all"
                >
                  <Plus className="h-4 w-4" />
                  New Announcement
                </button>
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <span className="rounded-lg bg-accent/10 p-2.5 text-accent">
                    <Mail className="h-5 w-5" />
                  </span>
                  <div>
                    <h4 className="font-semibold text-sm">Need Broadcast?</h4>
                    <p className="text-xs text-muted-foreground">
                      Select audiences to push instant notifications.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  <button
                    onClick={() => toast.info("Broadcasting email batch (simulated)...")}
                    className="w-full py-2 text-xs font-semibold rounded-lg border border-border hover:bg-muted text-foreground transition-all flex items-center justify-center gap-2"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    Email Broadcast
                  </button>
                  <button
                    onClick={() => toast.info("Broadcasting SMS notifications (simulated)...")}
                    className="w-full py-2 text-xs font-semibold rounded-lg border border-border hover:bg-muted text-foreground transition-all flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    SMS Broadcast
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Side Announcement List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search announcements..."
                  className="h-10 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </div>
              <select
                value={targetFilter}
                onChange={(e) => setTargetFilter(e.target.value)}
                className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent"
              >
                <option value="all">All Targets</option>
                <option value="students">Students/Parents</option>
                <option value="teachers">Teachers</option>
                <option value="staff">Staff Only</option>
              </select>
            </div>

            <Panel title="Active Notices & Bulletins">
              {announcements.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-muted text-muted-foreground mb-3">
                    <Bell className="h-6 w-6" />
                  </div>
                  <div className="text-sm font-semibold">No announcements published</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Click "New Announcement" to publish your first bulletin.
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {announcements.map((ann) => (
                    <div
                      key={ann.id}
                      className="rounded-xl border border-border p-5 bg-card hover:shadow-sm transition-all space-y-3"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-semibold text-base text-foreground">{ann.title}</h4>
                          <div className="mt-1.5 flex flex-wrap items-center gap-2">
                            {getTargetBadge(ann.target)}
                            {getPriorityIcon(ann.priority)}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground font-medium">{ann.date}</div>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                        {ann.content}
                      </p>
                      <div className="pt-2 text-xs text-muted-foreground flex items-center justify-between border-t border-border">
                        <span>
                          Posted by{" "}
                          <span className="font-semibold text-foreground">{ann.author}</span>
                        </span>
                        <button
                          onClick={() => {
                            setAnnouncementsStore(prev => prev.filter(a => a.id !== ann.id));
                            toast.success("Notice deleted.");
                          }}
                          className="text-xs text-destructive hover:underline"
                        >
                          Delete Notice
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          </div>
        </div>
      )}

      {/* Video Call Modal (Mock) */}
      {showVideoCall && activeChatData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-4xl bg-card rounded-2xl overflow-hidden shadow-2xl border border-border flex flex-col">
            {/* Header */}
            <div className="p-4 bg-muted/30 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse" />
                <span className="font-bold text-sm tracking-widest uppercase">
                  Live Call: {activeChatName}
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-muted-foreground">02:14</span>
            </div>

            {/* Video Area */}
            <div className="flex-1 bg-black relative min-h-[400px] flex items-center justify-center group">
              {/* Main Participant */}
              <div className="absolute inset-0 flex items-center justify-center">
                <User className="h-32 w-32 text-white/20" />
              </div>
              <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-xs font-medium">
                {activeChatName}
              </div>

              {/* Self Video PIP */}
              <div className="absolute top-4 right-4 w-48 h-32 bg-gray-900 rounded-xl overflow-hidden border-2 border-white/10 flex items-center justify-center">
                <User className="h-12 w-12 text-white/20" />
                <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-md px-2 py-1 rounded text-white text-[10px] font-medium">
                  You
                </div>
              </div>

              {/* Controls overlay */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setIsMicMuted(!isMicMuted)}
                  className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${isMicMuted ? "bg-red-500 hover:bg-red-600 text-white" : "bg-white/20 hover:bg-white/30 text-white backdrop-blur-md"}`}
                >
                  {isMicMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </button>
                <button
                  onClick={() => setIsVideoOff(!isVideoOff)}
                  className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${isVideoOff ? "bg-red-500 hover:bg-red-600 text-white" : "bg-white/20 hover:bg-white/30 text-white backdrop-blur-md"}`}
                >
                  {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                </button>
                <button className="h-12 w-12 rounded-full flex items-center justify-center bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-colors">
                  <MonitorUp className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setShowVideoCall(false)}
                  className="h-12 w-16 rounded-full flex items-center justify-center bg-red-500 hover:bg-red-600 text-white shadow-lg transition-transform active:scale-95"
                >
                  <PhoneCall className="h-5 w-5 rotate-[135deg]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
