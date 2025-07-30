import React from 'react';
import { Link2, BarChart3 } from 'lucide-react';
import { logger } from '../utils/logger.js';

const Navigation = ({ activeTab, setActiveTab }) => {
  const handleTabChange = (tab) => {
    logger.info('navigation', `User clicked on ${tab} tab`, { previousTab: activeTab, newTab: tab });
    setActiveTab(tab);
  };

  return (
    <nav className="bg-white shadow-md border-b border-gray-200 mb-8">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center gap-2">
            <Link2 className="text-blue-600" size={28} />
            <h1 className="text-xl font-bold text-gray-800">URL Shortener Service</h1>
          </div>
          
          <div className="flex gap-1">
            <button
              onClick={() => handleTabChange('shortener')}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                activeTab === 'shortener'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Link2 size={18} />
              URL Shortener
            </button>
            <button
              onClick={() => handleTabChange('statistics')}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                activeTab === 'statistics'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BarChart3 size={18} />
              Statistics
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;