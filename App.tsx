
import React, { useState, useCallback } from 'react';
import { type DataConfig } from './types';
import { generateDataFunction } from './services/geminiService';
import ConfigurationPanel from './components/ConfigurationPanel';
import CodeDisplay from './components/CodeDisplay';
import { DEFAULT_CONFIG } from './constants';

const App: React.FC = () => {
  const [config, setConfig] = useState<DataConfig>(DEFAULT_CONFIG);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const code = await generateDataFunction(config);
      setGeneratedCode(code);
    } catch (e) {
      setError('Failed to generate code. Please check your API key and try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [config]);

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-200">
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 p-4 sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
            <h1 className="text-xl md:text-2xl font-bold text-slate-100">Observable Data Generator</h1>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <ConfigurationPanel config={config} setConfig={setConfig} onGenerate={handleGenerate} isLoading={isLoading} />
        <CodeDisplay code={generatedCode} isLoading={isLoading} error={error} />
      </main>

      <footer className="text-center p-4 text-slate-500 text-sm">
        <p>Powered by React, Tailwind CSS, and Google Gemini</p>
      </footer>
    </div>
  );
};

export default App;
   