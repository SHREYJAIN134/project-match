'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Project, MatchScoreResult } from '@/types';
import { AdvisorMessage, generateInitialAdvisorSummary, answerAdvisorQuestion, generateTeamRecommendation } from '@/lib/llm-advisor';
import { Bot, Send, X, Sparkles, HelpCircle, ShieldCheck, Users, RefreshCw, MessageSquare } from 'lucide-react';

interface AICandidateAdvisorProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | undefined;
  matchResults: MatchScoreResult[];
}

export function AICandidateAdvisor({
  isOpen,
  onClose,
  project,
  matchResults,
}: AICandidateAdvisorProps) {
  const [messages, setMessages] = useState<AdvisorMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Generate Automatic First Response on Open
  useEffect(() => {
    if (isOpen && project && messages.length === 0) {
      setIsLoading(true);
      generateInitialAdvisorSummary(project, matchResults).then((initMsg) => {
        setMessages([initMsg]);
        setIsLoading(false);
      });
    }
  }, [isOpen, project, matchResults, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen || !project) return null;

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: AdvisorMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const advisorReply = await answerAdvisorQuestion(textToSend, project, matchResults);
      setMessages((prev) => [...prev, advisorReply]);
    } catch (e) {
      console.error('Advisor query error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    'Who Should I Choose?',
    'Compare Top 3 Candidates',
    'Find the safest overall candidate',
    'Show candidate weaknesses & risks',
    'Recommend a team instead of one candidate',
    'What if availability is most important?',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border-l border-slate-800 w-full max-w-2xl h-full flex flex-col shadow-2xl relative glow-box-purple">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-950 border border-indigo-800 text-indigo-400">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                AI Candidate Decision Advisor
                <span className="text-[10px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-800/80 px-2 py-0.5 rounded-full">
                  Groq / Gemini Flash
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Active Project: <strong className="text-cyan-400">{project.title}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 font-sans text-xs">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[90%] rounded-2xl p-4 space-y-2 border ${
                  msg.sender === 'user'
                    ? 'bg-cyan-950 border-cyan-800 text-cyan-100'
                    : 'bg-slate-950/90 border-slate-800 text-slate-200'
                }`}
              >
                {/* Badges */}
                {msg.badges && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {msg.badges.map((b, i) => (
                      <span
                        key={i}
                        className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold border ${
                          b.color === 'cyan'
                            ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                            : b.color === 'emerald'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                            : 'bg-purple-950 text-purple-300 border-purple-800'
                        }`}
                      >
                        {b.label}
                      </span>
                    ))}
                  </div>
                )}

                {/* Text Content */}
                <div className="prose prose-invert prose-xs max-w-none space-y-2 text-xs leading-relaxed font-sans">
                  {msg.text.split('\n').map((line, idx) => {
                    if (line.startsWith('## ')) {
                      return <h3 key={idx} className="text-sm font-bold text-white font-mono">{line.replace('## ', '')}</h3>;
                    }
                    if (line.startsWith('### ')) {
                      return <h4 key={idx} className="text-xs font-bold text-cyan-300 font-mono mt-2">{line.replace('### ', '')}</h4>;
                    }
                    if (line.startsWith('* ')) {
                      return <p key={idx} className="pl-3 text-slate-300">• {line.replace('* ', '')}</p>;
                    }
                    return <p key={idx}>{line}</p>;
                  })}
                </div>

                {/* Evidence Footer */}
                {msg.evidence && (
                  <div className="mt-3 pt-2 border-t border-slate-900 text-[10px] font-mono text-slate-500 space-y-0.5">
                    <span className="text-slate-400 font-bold block">Evidence Base:</span>
                    {msg.evidence.map((ev, idx) => (
                      <p key={idx}>✓ {ev}</p>
                    ))}
                  </div>
                )}

                <span className="text-[9px] font-mono text-slate-500 block text-right mt-1">
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-400 animate-pulse w-fit">
              <RefreshCw className="w-4 h-4 animate-spin" />
              AI Decision Engine Reasoning...
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Action Prompt Buttons */}
        <div className="p-3 bg-slate-950/90 border-t border-slate-800 space-y-2">
          <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider px-1">
            Quick Decision Prompts
          </p>
          <div className="flex flex-wrap gap-1.5">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSend(prompt)}
                className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-[11px] font-medium transition-all"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask AI Advisor about candidate trade-offs, risks, or choices..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 font-sans"
          />
          <button
            type="submit"
            disabled={isLoading || !inputQuery.trim()}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-lg shadow-indigo-500/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
