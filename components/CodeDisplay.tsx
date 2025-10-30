
import React, { useState, useEffect } from 'react';

interface CodeDisplayProps {
  code: string;
  isLoading: boolean;
  error: string | null;
}

const CodeDisplay: React.FC<CodeDisplayProps> = ({ code, isLoading, error }) => {
  const [copyText, setCopyText] = useState('Copy');

  useEffect(() => {
    if (copyText === 'Copied!') {
      const timer = setTimeout(() => setCopyText('Copy'), 2000);
      return () => clearTimeout(timer);
    }
  }, [copyText]);

  const handleCopy = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      setCopyText('Copied!');
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-slate-400">
           <svg className="animate-spin h-10 w-10 text-cyan-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-lg">Generating code with Gemini...</p>
            <p className="text-sm">This may take a moment.</p>
        </div>
      );
    }
    if (error) {
      return (
        <div className="flex items-center justify-center h-full text-red-400 p-4">
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-semibold">An Error Occurred</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      );
    }
    if (!code) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-slate-500 p-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line>
          </svg>
          <p className="text-lg">Your generated code will appear here.</p>
          <p className="text-sm text-center">Configure the settings on the left and click "Generate Function".</p>
        </div>
      );
    }
    return (
      <pre className="p-4 overflow-auto">
        <code className="language-js text-sm text-slate-300">{code}</code>
      </pre>
    );
  };


  return (
    <div className="bg-slate-800/50 rounded-lg border border-slate-700 h-[600px] lg:h-auto lg:min-h-[calc(100vh-200px)] flex flex-col relative">
      <div className="flex justify-between items-center p-3 border-b border-slate-700 bg-slate-900/40 rounded-t-lg">
        <h2 className="text-lg font-semibold text-slate-300">Generated Code</h2>
        {code && !isLoading && !error && (
          <button 
            onClick={handleCopy}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-200 flex items-center space-x-2 ${
              copyText === 'Copied!' 
              ? 'bg-green-600 text-white' 
              : 'bg-slate-600 hover:bg-slate-500 text-slate-200'
            }`}
          >
            {copyText === 'Copied!' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><polyline points="20 6 9 17 4 12"></polyline></svg>
            ) : (
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            )}
            <span>{copyText}</span>
          </button>
        )}
      </div>
      <div className="flex-grow min-h-0">
          {renderContent()}
      </div>
    </div>
  );
};

export default CodeDisplay;
   