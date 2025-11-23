
import React, { useRef, useEffect, useState } from 'react';
import { ChatMessage, PersonalityProfile } from '../types';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  personality: PersonalityProfile;
  onSendMessage: (text: string) => void;
  isTyping: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, personality, onSendMessage, isTyping }) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  return (
    <div className="flex flex-col w-full max-w-md mx-auto relative z-20 mt-4 h-full min-h-[300px] pointer-events-auto">
      
      {/* Message List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4 scrollbar-hide mask-image-linear-gradient">
        
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`chat-bubble flex w-full relative z-20 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`relative z-20 max-w-[85%] rounded-2xl px-4 py-3 shadow-sm text-sm md:text-base transition-all duration-300 ${
                msg.sender === 'user'
                  ? 'bg-white text-gray-800 rounded-tr-none'
                  : `${personality.colors.accent} ${personality.colors.text} backdrop-blur-md rounded-tl-none`
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {isTyping && (
           <div className="flex justify-start relative z-20">
             <div className={`relative z-20 ${personality.colors.accent} ${personality.colors.text} backdrop-blur-md rounded-2xl rounded-tl-none px-4 py-3 shadow-sm`}>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-transparent relative z-30">
        <form 
          onSubmit={handleSubmit}
          className="relative flex items-center shadow-2xl rounded-full bg-white/90 backdrop-blur-lg border border-white/20 transition-all hover:bg-white"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Say hello to ${personality.name}...`}
            className="flex-1 bg-transparent px-6 py-4 outline-none text-gray-700 placeholder-gray-500 rounded-full"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className={`mr-2 p-3 rounded-full transition-transform active:scale-95 disabled:opacity-50 ${personality.colors.text} bg-gray-100 hover:bg-gray-200`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </form>
      </div>
    </div>
  );
};
