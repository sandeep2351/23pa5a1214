import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation.jsx';
import UrlShortener from './components/UrlShortener.jsx';
import UrlStatistics from './components/UrlStatistics.jsx';
import { logger } from './utils/logger.js';

function App() {
  const [activeTab, setActiveTab] = useState('shortener');

  useEffect(() => {
    logger.info('app', 'Application initialized', { 
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });
  }, []);

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'shortener':
        return <UrlShortener />;
      case 'statistics':
        return <UrlStatistics />;
      default:
        logger.warn('app', 'Unknown tab requested', { activeTab });
        return <UrlShortener />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="container mx-auto px-4 pb-8">
        {renderActiveComponent()}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-6xl mx-auto px-6 py-4 text-center text-sm text-gray-500">
          URL Shortener Service - Built with React & Node.js
        </div>
      </footer>
    </div>
  );
}

export default App;