import React, { useState, useEffect } from 'react';
import { BarChart3, Calendar, MousePointer, Globe, RefreshCw, ExternalLink } from 'lucide-react';
import { apiService } from '../services/api.js';
import { logger } from '../utils/logger.js';

const UrlStatistics = () => {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUrl, setSelectedUrl] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    logger.info('url-statistics', 'Component mounted, loading URL statistics');
    loadUrls();
  }, []);

  const loadUrls = async () => {
    try {
      logger.info('url-statistics', 'Loading all URLs');
      setLoading(true);
      setError('');
      const urlsData = await apiService.getAllUrls();
      setUrls(urlsData);
      logger.info('url-statistics', 'URLs loaded successfully', { count: urlsData.length });
    } catch (error) {
      logger.error('url-statistics', 'Failed to load URLs', { error: error.message });
      setError('Failed to load URLs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadDetailedStats = async (shortcode) => {
    try {
      logger.info('url-statistics', 'User clicked to view detailed statistics', { shortcode });
      setStatsLoading(true);
      const stats = await apiService.getUrlStatistics(shortcode);
      setSelectedUrl(stats);
      logger.info('url-statistics', 'Detailed statistics loaded', { shortcode, clickCount: stats.clickCount });
    } catch (error) {
      logger.error('url-statistics', 'Failed to load detailed statistics', { shortcode, error: error.message });
      setError('Failed to load detailed statistics.');
    } finally {
      setStatsLoading(false);
    }
  };

  const refreshData = () => {
    logger.info('url-statistics', 'User clicked refresh button');
    loadUrls();
    setSelectedUrl(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (expiry) => {
    const isExpired = new Date(expiry) < new Date();
    return isExpired ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50';
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <span className="ml-3 text-gray-600">Loading statistics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            <BarChart3 className="text-blue-600" size={32} />
            URL Statistics
          </h1>
          <p className="text-gray-600">View analytics and detailed click data for all shortened URLs</p>
        </div>
        <button
          onClick={refreshData}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {urls.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <BarChart3 size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No URLs Found</h3>
          <p className="text-gray-500">Create some shortened URLs to see statistics here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* URLs List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">All Shortened URLs</h2>
            {urls.map((url) => (
              <div
                key={url.shortcode}
                className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <code className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-sm font-mono">
                        {url.shortLink}
                      </code>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(url.expiry)}`}>
                        {new Date(url.expiry) < new Date() ? 'Expired' : 'Active'}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm truncate mb-2" title={url.originalUrl}>
                      {url.originalUrl}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        Created: {formatDate(url.createdAt)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        Expires: {formatDate(url.expiry)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-gray-600 mb-2">
                      <MousePointer size={16} />
                      <span className="font-semibold">{url.clickCount || 0}</span>
                      <span className="text-sm">clicks</span>
                    </div>
                    <button
                      onClick={() => loadDetailedStats(url.shortcode)}
                      disabled={statsLoading}
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-200 transition-all flex items-center gap-1"
                    >
                      <BarChart3 size={14} />
                      Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Detailed Statistics */}
          <div className="lg:sticky lg:top-6">
            {selectedUrl ? (
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <BarChart3 size={20} />
                  Detailed Statistics
                </h2>
                
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-2">URL Information</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Short URL:</span>
                        <code className="ml-2 bg-blue-50 text-blue-700 px-2 py-1 rounded">
                          {selectedUrl.shortLink}
                        </code>
                      </div>
                      <div>
                        <span className="font-medium">Original URL:</span>
                        <a
                          href={selectedUrl.originalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                        >
                          {selectedUrl.originalUrl.length > 50 
                            ? selectedUrl.originalUrl.substring(0, 50) + '...' 
                            : selectedUrl.originalUrl}
                          <ExternalLink size={12} />
                        </a>
                      </div>
                      <div>
                        <span className="font-medium">Created:</span>
                        <span className="ml-2">{formatDate(selectedUrl.createdAt)}</span>
                      </div>
                      <div>
                        <span className="font-medium">Expires:</span>
                        <span className="ml-2">{formatDate(selectedUrl.expiry)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <MousePointer size={16} />
                      Click Statistics
                    </h3>
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {selectedUrl.clickCount || 0}
                    </div>
                    <div className="text-sm text-gray-600">Total Clicks</div>
                  </div>

                  {selectedUrl.clickData && selectedUrl.clickData.length > 0 && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <Globe size={16} />
                        Recent Click Data
                      </h3>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {selectedUrl.clickData.slice(0, 10).map((click, index) => (
                          <div key={index} className="bg-white p-2 rounded text-xs">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{formatDate(click.timestamp)}</span>
                              <span className="text-gray-500">{click.source || 'Direct'}</span>
                            </div>
                            {click.location && (
                              <div className="text-gray-600 mt-1">{click.location}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 text-center">
                <BarChart3 size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Select a URL</h3>
                <p className="text-gray-500">Click on "Details" for any URL to view comprehensive statistics.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UrlStatistics;