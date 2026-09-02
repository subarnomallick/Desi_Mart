import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Sparkles, CornerDownLeft } from 'lucide-react';

export default function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      sender: 'bot', 
      text: 'Namaste! Welcome to DeshiMart Farming Assistant. 🌱\nI can help you with seeds, fertilizers, organic pest management, crop seasons, or how to buy and sell on DeshiMart. What are you planting today?' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  const suggestions = [
    'What crops should I plant in Winter?',
    'How do I make organic Neem pest spray?',
    'What fertilizer is best for crop soil?',
    'How to upload and sell on DeshiMart?'
  ];

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { sender: 'user', text: query }]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query })
      });
      const data = await res.json();
      if (res.ok && data.reply) {
        setMessages(prev => [...prev, { sender: 'bot', text: data.reply }]);
      } else {
        setMessages(prev => [...prev, { sender: 'bot', text: 'Sorry, I encountered an issue. Please try asking again shortly.' }]);
      }
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { sender: 'bot', text: 'Error connecting to the farming service. Make sure backend server is running.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Custom regex-free simple markdown parser for rendering bullet points, headers, and bold text
  const parseResponse = (text) => {
    if (!text) return '';
    
    return text.split('\n').map((line, idx) => {
      const trimmed = line.trim();
      
      // Header Level 3
      if (trimmed.startsWith('### ')) {
        return (
          <h4 key={idx} className="font-extrabold text-forest-600 text-sm mt-3 mb-1.5 uppercase tracking-wide">
            {trimmed.replace('### ', '')}
          </h4>
        );
      }
      
      // Bullet Items
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        const content = trimmed.substring(2);
        return (
          <li key={idx} className="ml-3.5 list-disc text-slate-700 text-xs my-0.5 leading-relaxed">
            {renderBoldText(content)}
          </li>
        );
      }
      
      // Numbered List Items
      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        return (
          <li key={idx} className="ml-3.5 list-decimal text-slate-700 text-xs my-0.5 leading-relaxed">
            {renderBoldText(numMatch[2])}
          </li>
        );
      }

      // Empty Lines
      if (!trimmed) {
        return <div key={idx} className="h-1.5" />;
      }

      // Normal Paragraphs
      return (
        <p key={idx} className="text-slate-700 text-xs my-1 leading-relaxed">
          {renderBoldText(trimmed)}
        </p>
      );
    });
  };

  // Helper to parse **bold** inside a line
  const renderBoldText = (text) => {
    if (!text.includes('**')) return text;
    const parts = text.split('**');
    return parts.map((part, index) => 
      index % 2 === 1 ? <strong key={index} className="font-bold text-forest-600">{part}</strong> : part
    );
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      
      {/* Collapsed Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-forest-500 hover:bg-forest-600 text-white rounded-full p-4 shadow-lg flex items-center space-x-2 transition-all duration-300 transform hover:scale-105 border border-forest-400 group"
        >
          <div className="relative">
            <MessageSquare className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 bg-sage-500 h-2.5 w-2.5 rounded-full border border-forest-500 animate-ping"></span>
          </div>
          <span className="font-bold text-sm max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-out whitespace-nowrap">
            AI Assistant
          </span>
        </button>
      )}

      {/* Expanded Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl w-80 sm:w-96 h-[500px] border border-slate-100 flex flex-col overflow-hidden animate-fade-in">
          
          {/* Header */}
          <div className="bg-forest-500 text-white p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-2">
              <div className="bg-forest-600 p-2 rounded-full border border-forest-400">
                <Bot className="h-5 w-5 text-sage-300" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm flex items-center space-x-1">
                  <span>Farming Advisor</span>
                  <Sparkles className="h-3 w-3 text-sage-300 fill-sage-300" />
                </h3>
                <span className="text-[10px] text-sage-300 flex items-center">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400 mr-1 animate-pulse"></span>
                  Active Expert Engine
                </span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-forest-200 hover:text-white hover:bg-forest-600 p-1 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-grow p-4 overflow-y-auto bg-slate-50 custom-scrollbar flex flex-col space-y-3">
            {messages.map((msg, i) => (
              <div 
                key={i} 
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-sm border text-xs leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-sage-500 border-sage-400 text-white rounded-br-none' 
                      : 'bg-white border-slate-200 text-slate-800 rounded-bl-none'
                  }`}
                >
                  {msg.sender === 'bot' ? parseResponse(msg.text) : msg.text}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center space-x-1.5">
                  <span className="h-2 w-2 rounded-full bg-forest-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="h-2 w-2 rounded-full bg-forest-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="h-2 w-2 rounded-full bg-forest-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick chips (only shows when user has query options) */}
          {messages.length === 1 && !isLoading && (
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-100">
              <p className="text-[10px] text-slate-400 font-semibold mb-1">RECOMMENDED TOPICS:</p>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(s)}
                    className="bg-white hover:bg-forest-50 hover:border-forest-200 text-slate-600 text-[10px] font-semibold px-2 py-1 rounded-full border border-slate-200 transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input field */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="p-3 border-t border-slate-100 flex bg-white items-center space-x-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about seed sowing, organic pests, soil..."
              disabled={isLoading}
              className="flex-grow bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-forest-400 transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-forest-500 hover:bg-forest-600 disabled:bg-slate-100 text-white disabled:text-slate-450 p-2 rounded-lg transition-colors shadow-sm flex items-center justify-center"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

        </div>
      )}
    </div>
  );
}
