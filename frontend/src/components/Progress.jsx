export const Progress = ({ isVisible, elapsedSeconds }) => {
  if (!isVisible) return null;

  return (
    <div className="bg-blue-50 border-b-2 border-blue-200 px-6 py-4">
      <div className="max-w-6xl mx-auto space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="animate-spin">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.25" />
                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
            <div>
              <p className="text-13 font-semibold text-blue-900">Scraper is running...</p>
              <p className="text-12 text-blue-700">Elapsed: {Math.floor(elapsedSeconds / 60)}m {elapsedSeconds % 60}s</p>
            </div>
          </div>
        </div>

        {/* Indeterminate progress bar */}
        <div className="w-full h-1.5 bg-blue-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 rounded-full"
            style={{
              width: '30%',
              animation: 'indeterminateProgress 2s infinite ease-in-out'
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes indeterminateProgress {
          0% { transform: translateX(-100%); width: 30%; }
          50% { transform: translateX(400%); width: 70%; }
          100% { transform: translateX(900%); width: 30%; }
        }
      `}</style>
    </div>
  );
};
