'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import {
  Home,
  User,
  BarChart2,
  Calendar as CalendarIcon,
  MessageSquare,
  LogOut,
  Menu,
  X,
  Send,
  Bot,
  User as UserIcon,
  Loader2,
  Sparkles
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

function ChatbotContent() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'bot',
      text: "Hello Rebeka! I am your ABI&Co. Assistant. Ask me anything about your registered clients, upcoming events, venue addresses, or payment statuses!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // Fetch Supabase Clients Data on load
  useEffect(() => {
    const fetchClientsData = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.from('clients').select('*');
        if (error) throw error;
        if (data) setClients(data);
      } catch (err) {
        console.error('Error loading chatbot context:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClientsData();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {}
    document.cookie = 'auth_token=; path=/; max-age=0;';
    router.push('/login');
    router.refresh();
  };

  // Logic engine to generate answers based on real database records
  const generateBotResponse = (query: string): string => {
    const q = query.toLowerCase().trim();

    if (q.includes('total client') || q.includes('how many client') || q.includes('total count')) {
      return `You currently have ${clients.length} total client record(s) synced in your database.`;
    }

    if (q.includes('new') || q.includes('inquir')) {
      const count = clients.filter((c) => (c.status || '').toUpperCase() === 'NEW').length;
      return `There are ${count} new client inquiry/inquiries waiting in your pipeline.`;
    }

    if (q.includes('active') || q.includes('booked') || q.includes('half')) {
      const count = clients.filter((c) => (c.status || '').toUpperCase() === 'BOOKED(PAID HALF)').length;
      return `You have ${count} active booking(s) where half deposit has been paid.`;
    }

    if (q.includes('full') || q.includes('payed full') || q.includes('paid full')) {
      const count = clients.filter((c) => 
        (c.status || '').toUpperCase() === 'PAYED FULL' || (c.status || '').toUpperCase() === 'PAID FULL'
      ).length;
      return `There are ${count} client(s) who have paid in full.`;
    }

    if (q.includes('revenue') || q.includes('money') || q.includes('payment') || q.includes('deposit')) {
      const totalRev = clients.reduce((sum, c) => sum + (parseFloat(String(c.total_payment || 0).replace(/,/g, '')) || 0), 0);
      const totalDep = clients.reduce((sum, c) => sum + (parseFloat(String(c.deposited_amount || 0).replace(/,/g, '')) || 0), 0);
      const outstanding = Math.max(0, totalRev - totalDep);

      return `Financial Summary:\n• Total Potential Revenue: ${totalRev.toLocaleString()} ETB\n• Total Deposited: ${totalDep.toLocaleString()} ETB\n• Outstanding Balance: ${outstanding.toLocaleString()} ETB`;
    }

    if (q.includes('upcoming') || q.includes('event') || q.includes('calendar') || q.includes('next')) {
      const upcoming = [...clients]
        .filter((c) => c.event_date)
        .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());

      if (upcoming.length === 0) return "No scheduled event dates found in your records.";

      const listStr = upcoming
        .slice(0, 4)
        .map((c) => `• ${c.full_name || 'Client'}: ${c.event_date} @ ${c.venue_address || 'Venue TBD'}`)
        .join('\n');

      return `Here are your upcoming events:\n${listStr}`;
    }

    // Individual Name Lookup
    const matchedClient = clients.find((c) => 
      c.full_name && c.full_name.toLowerCase().includes(q)
    );

    if (matchedClient) {
      return `Here are the details for ${matchedClient.full_name}:\n` +
        `• Status: ${matchedClient.status || 'NEW'}\n` +
        `• Phone: ${matchedClient.contact_info || 'N/A'}\n` +
        `• Event Date: ${matchedClient.event_date || 'TBD'}\n` +
        `• Venue: ${matchedClient.venue_address || 'N/A'}\n` +
        `• Total Payment: ${matchedClient.total_payment || '0'} ETB\n` +
        `• Deposited: ${matchedClient.deposited_amount || '0'} ETB`;
    }

    return `I searched your ${clients.length} client record(s). You can ask me:\n` +
      `• "How many total clients do we have?"\n` +
      `• "Show me our upcoming events"\n` +
      `• "What is our total revenue and deposits?"\n` +
      `• Or type a client's name (e.g., "Rebeka Tilahun")`;
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userText = inputMessage;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');

    // Simulate bot thinking response
    setTimeout(() => {
      const responseText = generateBotResponse(userText);
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 400);
  };

  return (
    <div className="flex h-screen h-[100dvh] w-screen overflow-hidden bg-[#ECECEC] font-sans text-black antialiased select-none relative">
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 lg:w-56 h-full bg-black text-white flex flex-col justify-between shrink-0 py-8 px-4 transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div>
          <div className="flex items-center justify-between lg:justify-center mb-12 px-2 lg:px-0">
            <h1 className="font-serif text-2xl font-bold tracking-wider text-center w-full">ABI&amp;Co.</h1>
            <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-gray-400 hover:text-white p-1">
              <X size={22} />
            </button>
          </div>

          <nav className="space-y-1 text-xs font-semibold tracking-wider">
            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-md text-gray-300 hover:text-white hover:bg-zinc-900 transition">
              <Home size={18} />
              <span>DASHBOARD</span>
            </Link>

            <Link href="/customers" className="flex items-center gap-3 px-4 py-3 rounded-md text-gray-300 hover:text-white hover:bg-zinc-900 transition">
              <User size={18} />
              <span>CUSTOMERS</span>
            </Link>

            <Link href="/analytics" className="flex items-center gap-3 px-4 py-3 rounded-md text-gray-300 hover:text-white hover:bg-zinc-900 transition">
              <BarChart2 size={18} />
              <span>ANALYTICS</span>
            </Link>

            <Link href="/calendar" className="flex items-center gap-3 px-4 py-3 rounded-md text-gray-300 hover:text-white hover:bg-zinc-900 transition">
              <CalendarIcon size={18} />
              <span>CALENDAR</span>
            </Link>

            <Link href="/chatbot" className="flex items-center gap-3 px-4 py-3 rounded-md bg-white text-black transition shadow-sm font-bold">
              <MessageSquare size={18} />
              <span>CHATBOT</span>
            </Link>
          </nav>
        </div>

        <div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-white text-black font-semibold text-xs py-2.5 px-4 rounded-full hover:bg-gray-200 transition shadow-md">
            <span>LOG OUT</span>
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Chat Container */}
      <main className="flex-1 h-full flex flex-col p-4 sm:p-6 lg:p-8 overflow-hidden">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden bg-black text-white p-2.5 rounded-xl hover:bg-zinc-800 transition shadow-md">
              <Menu size={20} />
            </button>
            <h2 className="text-xl sm:text-2xl font-serif tracking-widest font-normal uppercase text-black flex items-center gap-2">
              <Sparkles size={22} />
              ABI&amp;Co. AI ASSISTANT
            </h2>
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-2 shrink-0 scrollbar-none">
          {[
            "How many total clients?",
            "Show upcoming events",
            "What is our total revenue?",
            "New inquiries count",
          ].map((prompt) => (
            <button
              key={prompt}
              onClick={() => {
                setInputMessage(prompt);
              }}
              className="bg-white border border-gray-300 text-black text-[11px] font-semibold px-3 py-1.5 rounded-full hover:bg-black hover:text-white transition whitespace-nowrap cursor-pointer shadow-xs"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat Messages Box */}
        <div className="flex-1 bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-200 overflow-y-auto flex flex-col gap-4">
          {loading ? (
            <div className="flex-1 flex justify-center items-center gap-2 text-gray-500 font-medium text-xs">
              <Loader2 size={18} className="animate-spin" />
              Syncing client database for Chatbot...
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] sm:max-w-[75%] ${
                  msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.sender === 'user' ? 'bg-black text-white' : 'bg-zinc-200 text-black'
                  }`}
                >
                  {msg.sender === 'user' ? <UserIcon size={16} /> : <Bot size={16} />}
                </div>

                <div className="space-y-1">
                  <div
                    className={`p-4 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                      msg.sender === 'user'
                        ? 'bg-black text-white rounded-tr-none'
                        : 'bg-[#F2F2F2] text-black rounded-tl-none border border-gray-200/60'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className={`text-[10px] text-gray-400 block px-1 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="mt-4 flex gap-2 shrink-0">
          <input
            type="text"
            placeholder="Ask about clients, events, payments or inquiries..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-1 bg-white border border-gray-300 rounded-full px-5 py-3 text-xs outline-none focus:border-black shadow-sm"
          />
          <button
            type="submit"
            className="bg-black text-white px-6 py-3 rounded-full text-xs font-semibold uppercase hover:bg-zinc-800 transition shadow flex items-center gap-2 cursor-pointer"
          >
            <span>Send</span>
            <Send size={14} />
          </button>
        </form>
      </main>
    </div>
  );
}

export default function ChatbotPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-[#ECECEC]">Loading Chatbot...</div>}>
      <ChatbotContent />
    </Suspense>
  );
}