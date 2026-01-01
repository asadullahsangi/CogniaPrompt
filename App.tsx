
import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/Layout';
import { HistorySidebar } from './components/HistorySidebar';
import { ResultDisplay } from './components/ResultDisplay';
import { LiveAssistant } from './components/LiveAssistant';
import { optimizePrompt } from './services/gemini';
import { OptimizationResult, PromptHistoryItem, Tone, Role } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState('optimizer');
  const [inputPrompt, setInputPrompt] = useState('');
  const [tone, setTone] = useState<Tone>(Tone.PROFESSIONAL);
  const [role, setRole] = useState<Role>(Role.GENERAL);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [history, setHistory] = useState<PromptHistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState('');
  const [showLiveMode, setShowLiveMode] = useState(false);

  const toneHelp: Record<Tone, string> = {
    [Tone.PROFESSIONAL]: "Formal, clear, and authoritative language.",
    [Tone.CREATIVE]: "Imaginative, narrative, and evocative style.",
    [Tone.CONCISE]: "Direct, brief, and fluff-free output.",
    [Tone.INSTRUCTIONAL]: "Step-by-step, educational, and structured.",
    [Tone.ACADEMIC]: "Scholarly, precise, and logically rigorous."
  };

  const roleHelp: Record<Role, string> = {
    [Role.GENERAL]: "Versatile assistant for any general task.",
    [Role.EXPERT_CODER]: "Focused on clean code, bugs, and architecture.",
    [Role.WRITER]: "Specialized in narrative flow and creative expression.",
    [Role.DATA_SCIENTIST]: "Analytical, data-driven, and mathematically sound.",
    [Role.MARKETER]: "Persuasive, growth-oriented, and brand-aware."
  };

  useEffect(() => {
    const saved = localStorage.getItem('cogniaprompt_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  const saveHistory = (newHistory: PromptHistoryItem[]) => {
    setHistory(newHistory);
    localStorage.setItem('cogniaprompt_history', JSON.stringify(newHistory));
  };

  const handleOptimize = async () => {
    if (!inputPrompt.trim()) return;
    
    setIsOptimizing(true);
    setError(null);
    try {
      const res = await optimizePrompt(inputPrompt, tone, role);
      setResult(res);
      
      const newHistoryItem: PromptHistoryItem = {
        id: crypto.randomUUID(),
        original: inputPrompt,
        result: res,
        timestamp: Date.now(),
        tag: activeTag.trim() || undefined
      };
      
      const updatedHistory = [newHistoryItem, ...history].slice(0, 50);
      saveHistory(updatedHistory);
      setActiveTag(''); 
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during optimization.');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleUpdateTag = (id: string, newTag: string) => {
    const updatedHistory = history.map(item => 
      item.id === id ? { ...item, tag: newTag.trim() || undefined } : item
    );
    saveHistory(updatedHistory);
  };

  const handleSelectHistory = useCallback((item: PromptHistoryItem) => {
    setCurrentView('optimizer');
    setInputPrompt(item.original);
    setResult(item.result);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  }, []);

  const clearHistory = () => {
    saveHistory([]);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'templates':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-4xl font-extrabold text-slate-900">Prompt Templates</h2>
            <p className="text-slate-500 max-w-lg mx-auto text-lg">Access our curated library of high-performance templates for marketing, coding, and creative writing.</p>
            <div className="bg-blue-50 border border-blue-100 p-8 rounded-2xl max-w-md mx-auto mt-8">
               <span className="text-blue-600 font-bold uppercase tracking-widest text-xs">Available in v2.0</span>
               <p className="text-slate-600 mt-2 text-sm font-medium">We are currently curating the best AI patterns for you.</p>
            </div>
            <button onClick={() => setCurrentView('optimizer')} className="mt-8 bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 shadow-lg transition-all">Return to Optimizer</button>
          </div>
        );
      case 'guide':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-4xl font-extrabold text-slate-900">Engineering Guide</h2>
              <p className="text-slate-500 max-w-lg mx-auto text-lg">Master the art of prompt engineering with our comprehensive documentation.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
               {['Zero-Shot', 'Few-Shot', 'Chain of Thought'].map(topic => (
                 <div key={topic} className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
                   <h4 className="font-bold text-slate-900 mb-2">{topic}</h4>
                   <p className="text-slate-500 text-sm">Advanced patterns for optimizing {topic.toLowerCase()} reasoning in Gemini models.</p>
                 </div>
               ))}
            </div>
            <div className="text-center mt-12">
              <button onClick={() => setCurrentView('optimizer')} className="text-blue-600 font-bold hover:underline">Back to tool</button>
            </div>
          </div>
        );
      default:
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in duration-500">
            <div className="grid lg:grid-cols-12 gap-10">
              {/* Main Workspace */}
              <div className="lg:col-span-8 space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Prompt Optimizer</h1>
                      <p className="text-slate-500 mt-1">Transform simple ideas into powerful engineering instructions.</p>
                    </div>
                    <div className="hidden sm:flex gap-2">
                      <button 
                        onClick={() => setShowLiveMode(true)}
                        className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-bold border border-blue-500 hover:bg-blue-700 transition-colors shadow-sm"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
                        Live Mode
                      </button>
                      <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-bold border border-slate-200">Gemini 3 Flash</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-blue-600/20 focus-within:border-blue-600 transition-all">
                    <textarea
                      value={inputPrompt}
                      onChange={(e) => setInputPrompt(e.target.value)}
                      placeholder="Type your basic prompt here (e.g. 'Write a story about a space cat')"
                      className="w-full h-48 p-6 text-slate-800 placeholder-slate-400 focus:outline-none resize-none border-none leading-relaxed"
                    />
                    <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex flex-wrap gap-4 items-center justify-between">
                      <div className="flex flex-wrap gap-4">
                        <div className="flex flex-col group relative">
                          <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 ml-1 flex items-center gap-1 cursor-help">
                            Tone
                            <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path></svg>
                          </label>
                          <select 
                            value={tone}
                            onChange={(e) => setTone(e.target.value as Tone)}
                            className="bg-white border border-slate-200 text-slate-700 text-xs font-medium rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none cursor-pointer"
                          >
                            {Object.values(Tone).map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                          <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
                            {toneHelp[tone]}
                          </div>
                        </div>

                        <div className="flex flex-col group relative">
                          <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 ml-1 flex items-center gap-1 cursor-help">
                            AI Role
                            <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path></svg>
                          </label>
                          <select 
                            value={role}
                            onChange={(e) => setRole(e.target.value as Role)}
                            className="bg-white border border-slate-200 text-slate-700 text-xs font-medium rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none cursor-pointer"
                          >
                            {Object.values(Role).map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                          <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
                            {roleHelp[role]}
                          </div>
                        </div>

                        <div className="flex flex-col">
                          <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 ml-1">Initial Tag (Optional)</label>
                          <input 
                            type="text"
                            placeholder="e.g. Marketing"
                            value={activeTag}
                            onChange={(e) => setActiveTag(e.target.value)}
                            className="bg-white border border-slate-200 text-slate-700 text-xs font-medium rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none w-32"
                          />
                        </div>
                      </div>
                      
                      <button
                        onClick={handleOptimize}
                        disabled={isOptimizing || !inputPrompt.trim()}
                        className={`flex items-center gap-2 px-8 py-3 rounded-lg font-bold text-white shadow-lg shadow-blue-600/20 transition-all ${isOptimizing || !inputPrompt.trim() ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'}`}
                      >
                        {isOptimizing ? (
                          <>
                            <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Optimizing...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                            Optimize Prompt
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm font-medium flex gap-3 items-center">
                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path></svg>
                    {error}
                  </div>
                )}

                {result && <ResultDisplay result={result} />}

                <div className="bg-blue-600 rounded-2xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden relative shadow-xl">
                   <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                   <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-blue-400/20 rounded-full blur-2xl"></div>
                   
                   <div className="relative z-10 max-w-md">
                     <h3 className="text-2xl font-bold mb-2">Unlock Pro Features</h3>
                     <p className="text-blue-100 text-sm">Get unlimited optimizations, advanced tone controls, and bulk processing capabilities today.</p>
                   </div>
                   <button className="relative z-10 bg-white text-blue-600 px-8 py-3 rounded-full font-bold hover:bg-blue-50 transition-all shadow-lg whitespace-nowrap">
                     Upgrade to Cognia Pro
                   </button>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-4">
                <HistorySidebar 
                  history={history} 
                  onSelect={handleSelectHistory} 
                  onClear={clearHistory}
                  onUpdateTag={handleUpdateTag}
                />
                
                <div className="mt-8 p-6 bg-slate-900 rounded-xl text-white">
                  <h4 className="font-bold mb-4 flex items-center gap-2">
                    <span className="text-blue-400">⚡</span>
                    Prompt Tips
                  </h4>
                  <ul className="space-y-4 text-xs text-slate-300">
                    <li className="flex gap-2">
                      <span className="text-blue-400 font-bold">01</span>
                      <span><strong>Assign a Persona:</strong> Start with "You are an expert [Role]..." to anchor the AI's perspective.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-blue-400 font-bold">02</span>
                      <span><strong>Use Delimiters:</strong> Wrap source text in triple backticks or quotes to separate instructions from data.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-blue-400 font-bold">03</span>
                      <span><strong>Negative Constraints:</strong> Explicitly state what NOT to include to avoid common pitfalls.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <Layout activeView={currentView} onNavigate={setCurrentView}>
      {renderContent()}
      {showLiveMode && <LiveAssistant onClose={() => setShowLiveMode(false)} />}
    </Layout>
  );
};

export default App;
