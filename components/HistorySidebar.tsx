
import React, { useState, useMemo } from 'react';
import { PromptHistoryItem } from '../types';

interface HistorySidebarProps {
  history: PromptHistoryItem[];
  onSelect: (item: PromptHistoryItem) => void;
  onClear: () => void;
  onUpdateTag: (id: string, newTag: string) => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({ history, onSelect, onClear, onUpdateTag }) => {
  const [filter, setFilter] = useState('');
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [tagValue, setTagValue] = useState('');

  const filteredHistory = useMemo(() => {
    if (!filter) return history;
    const lowerFilter = filter.toLowerCase();
    return history.filter(item => 
      item.original.toLowerCase().includes(lowerFilter) || 
      item.tag?.toLowerCase().includes(lowerFilter)
    );
  }, [history, filter]);

  const handleEditTag = (e: React.MouseEvent, item: PromptHistoryItem) => {
    e.stopPropagation();
    setEditingTagId(item.id);
    setTagValue(item.tag || '');
  };

  const saveTag = (id: string) => {
    onUpdateTag(id, tagValue);
    setEditingTagId(null);
    setTagValue('');
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col h-full max-h-[calc(100vh-10rem)] shadow-sm">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-slate-800 text-sm">Recent Optimizations</h3>
          {history.length > 0 && (
            <button 
              onClick={onClear}
              className="text-[10px] uppercase font-bold text-slate-400 hover:text-red-500 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
        <div className="relative">
          <input 
            type="text"
            placeholder="Filter by tag or text..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none pl-8"
          />
          <svg className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
      </div>
      
      <div className="flex-grow overflow-y-auto">
        {filteredHistory.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-400 text-sm">{filter ? 'No matches found' : 'No history yet'}</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredHistory.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelect(item)}
                className="w-full text-left p-4 hover:bg-blue-50/50 transition-all group relative"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-wrap gap-1.5 items-center">
                    <span className="text-[10px] font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                      Score: {item.result.score}
                    </span>
                    {editingTagId === item.id ? (
                      <input 
                        autoFocus
                        type="text"
                        value={tagValue}
                        onChange={(e) => setTagValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && saveTag(item.id)}
                        onBlur={() => saveTag(item.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="text-[10px] bg-white border border-blue-400 px-1 py-0.5 rounded focus:outline-none w-20"
                        placeholder="Tag name..."
                      />
                    ) : item.tag ? (
                      <span 
                        onClick={(e) => handleEditTag(e, item)}
                        className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 hover:bg-slate-200 transition-colors"
                      >
                        {item.tag}
                      </span>
                    ) : (
                      <button 
                        onClick={(e) => handleEditTag(e, item)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-slate-400 hover:text-blue-500 flex items-center gap-1"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
                        Tag
                      </button>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                  {item.original}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
