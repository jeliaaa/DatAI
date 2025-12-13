import { useState } from "react";
import { Send } from "lucide-react";

interface ChatMessage {
  id: number;
  sender: "user" | "ai";
  text: string;
}

export default function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");

  async function sendMessage() {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now(),
      sender: "user",
      text: input,
    };

    setMessages((prev) => [...prev, userMsg]);

    const text = input;
    setInput("");

    // MOCK AI RESPONSE (safe)
    setTimeout(() => {
      const aiMsg: ChatMessage = {
        id: Date.now() + 1,
        sender: "ai",
        text: `You said: "${text}". When you add your backend later, this will be replaced by a real AI reply.`,
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 500);
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-[450px] flex flex-col">
      <h2 className="text-lg font-semibold text-gray-800 mb-3">Chat</h2>

      <div className="flex-1 overflow-y-auto border rounded-lg p-3 bg-gray-50">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`mb-3 flex ${
              m.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`px-3 py-2 rounded-lg max-w-[75%] text-sm ${
                m.sender === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Send a message..."
        />
        <button
          onClick={sendMessage}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-1"
        >
          <Send size={16} />
          Send
        </button>
      </div>
    </div>
  );
}
