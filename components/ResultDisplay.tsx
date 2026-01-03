
import React, { useState } from 'react';
import { OptimizationResult } from '../types';

interface ResultDisplayProps {
  result: OptimizationResult;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ result }) => {
  const [activeTab, setActiveTab] = useState<'optimized' | 'variants' | 'reasoning'>('optimized');
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setActiveTab('optimized')}
            className={`text-sm font-semibold pb-4 -mb-[17px] border-b-2 transition-all ${activeTab === 'optimized' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Optimized Prompt
          </button>
          <button 
            onClick={() => setActiveTab('variants')}
            className={`text-sm font-semibold pb-4 -mb-[17px] border-b-2 transition-all ${activeTab === 'variants' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Variants
          </button>
          <button 
            onClick={() => setActiveTab('reasoning')}
            className={`text-sm font-semibold pb-4 -mb-[17px] border-b-2 transition-all ${activeTab === 'reasoning' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Reasoning & Tips
          </button>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-xs font-medium text-slate-400">Quality Score:</span>
           <div className="flex items-center gap-1.5">
              <div className="h-2 w-24 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${result.score > 80 ? 'bg-green-500' : result.score > 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${result.score}%` }}
                />
              </div>
              <span className={`text-sm font-bold ${result.score > 80 ? 'text-green-600' : result.score > 60 ? 'text-yellow-600' : 'text-red-600'}`}>{result.score}/100</span>
           </div>
        </div>
      </div>

      <div className="p-6">
        {activeTab === 'optimized' && (
          <div className="space-y-4">
            <div className="relative group">
              <div className="absolute top-4 right-4 flex gap-2">
                <button 
                  onClick={() => copyToClipboard(result.optimizedPrompt)}
                  className="bg-white/80 backdrop-blur-sm border border-slate-200 p-2 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <span className="text-xs font-bold text-green-600">Copied!</span>
                  ) : (
                    <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                  )}
                </button>
              </div>
              <pre className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 text-sm font-mono whitespace-pre-wrap leading-relaxed min-h-[150px]">
                {result.optimizedPrompt}
              </pre>
            </div>
            <p className="text-xs text-slate-400 italic">This prompt has been refined using persona-assignment, clear delimiters, and instruction-first structure.</p>
          </div>
        )}

        {activeTab === 'variants' && (
          <div className="grid md:grid-cols-3 gap-6">
            {result.variants.map((v, idx) => (
              <div key={idx} className="flex flex-col border border-slate-100 rounded-lg p-4 bg-slate-50/30">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">{v.label}</h4>
                  <button 
                    onClick={() => copyToClipboard(v.content)}
                    className="text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                  </button>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed overflow-hidden text-ellipsis line-clamp-6">
                  {v.content}
                </p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'reasoning' && (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
                Optimization Logic
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                {result.reasoning}
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
                Engineering Tips
              </h4>
              <ul className="space-y-3">
                {result.tips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-slate-600">
                    <span className="mt-1 flex-shrink-0 w-4 h-4 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-[10px] font-bold">✓</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
