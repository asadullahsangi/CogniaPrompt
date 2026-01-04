
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  activeView: string;
  onNavigate: (view: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeView, onNavigate }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('optimizer')}>
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">CogniaPrompt<span className="text-sm font-normal text-slate-500 ml-2">Prompt Optimizer</span></span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <button 
                onClick={() => onNavigate('optimizer')}
                className={`${activeView === 'optimizer' ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'} text-sm font-medium transition-colors focus:outline-none`}
              >
                Optimizer
              </button>
              <button 
                onClick={() => onNavigate('templates')}
                className={`${activeView === 'templates' ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'} text-sm font-medium transition-colors focus:outline-none`}
              >
                Templates
              </button>
              <button 
                onClick={() => onNavigate('guide')}
                className={`${activeView === 'guide' ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'} text-sm font-medium transition-colors focus:outline-none`}
              >
                Guide
              </button>
            </nav>
            <div className="flex items-center gap-4">
              <button className="bg-slate-100 text-slate-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-200 transition-all">Sign In</button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 shadow-sm transition-all">Get Pro</button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-white border-t border-slate-200 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm">
            © 2024 CogniaPrompt. Precision engineering for the AI age.
          </p>
        </div>
      </footer>
    </div>
  );
};
