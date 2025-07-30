import React, { useState } from 'react';
import { Plus, Link, Clock, Code, X, ExternalLink } from 'lucide-react';
import { apiService } from '../services/api.js';
import { logger } from '../utils/logger.js';

const UrlShortener = () => {
  const [urls, setUrls] = useState([{ id: 1, url: '', validity: 30, shortcode: '', result: null, loading: false, error: '' }]);
  const [globalError, setGlobalError] = useState('');

  const validateUrl = (url) => {
    logger.debug('url-shortener', 'Validating URL', { url });
    const urlPattern = /^https?:\/\/.+\..+/;
    return urlPattern.test(url);
  };

  const validateShortcode = (shortcode) => {
    logger.debug('url-shortener', 'Validating shortcode', { shortcode });
    if (!shortcode) return true;
    return /^[a-zA-Z0-9-_]{3,20}$/.test(shortcode);
  };

  const addUrlField = () => {
    if (urls.length >= 5) {
      logger.warn('url-shortener', 'Maximum URL limit reached', { currentCount: urls.length });
      setGlobalError('Maximum 5 URLs can be shortened concurrently');
      return;
    }
    
    logger.info('url-shortener', 'Adding new URL field', { currentCount: urls.length });
    setUrls([...urls, { 
      id: Date.now(), 
      url: '', 
      validity: 30, 
      shortcode: '', 
      result: null, 
      loading: false, 
      error: '' 
    }]);
    setGlobalError('');
  };

  const removeUrlField = (id) => {
    logger.info('url-shortener', 'Removing URL field', { id });
    setUrls(urls.filter(url => url.id !== id));
    setGlobalError('');
  };

  const updateUrl = (id, field, value) => {
    logger.debug('url-shortener', 'Updating URL field', { id, field, value });
    setUrls(urls.map(url => 
      url.id === id ? { ...url, [field]: value, error: '' } : url
    ));
  };

  const shortenUrl = async (id) => {
    const urlData = urls.find(url => url.id === id);
    
    logger.info('url-shortener', 'User clicked shorten URL button', { id, url: urlData.url });

    // Client-side validation
    if (!urlData.url.trim()) {
      logger.warn('url-shortener', 'URL validation failed - empty URL', { id });
      updateUrl(id, 'error', 'URL is required');
      return;
    }

    if (!validateUrl(urlData.url)) {
      logger.warn('url-shortener', 'URL validation failed - invalid format', { id, url: urlData.url });
      updateUrl(id, 'error', 'Please enter a valid URL (must start with http:// or https://)');
      return;
    }

    if (urlData.validity < 1 || urlData.validity > 10080) {
      logger.warn('url-shortener', 'Validity validation failed', { id, validity: urlData.validity });
      updateUrl(id, 'error', 'Validity must be between 1 and 10080 minutes (1 week)');
      return;
    }

    if (urlData.shortcode && !validateShortcode(urlData.shortcode)) {
      logger.warn('url-shortener', 'Shortcode validation failed', { id, shortcode: urlData.shortcode });
      updateUrl(id, 'error', 'Shortcode must be 3-20 characters (alphanumeric, dash, underscore only)');
      return;
    }

    // Set loading state
    setUrls(urls.map(url => 
      url.id === id ? { ...url, loading: true, error: '', result: null } : url
    ));

    try {
      logger.info('url-shortener', 'Sending URL shortening request', { id });
      const requestData = {
        url: urlData.url,
        validity: parseInt(urlData.validity),
        ...(urlData.shortcode && { shortcode: urlData.shortcode })
      };

      const result = await apiService.createShortUrl(requestData);
      
      logger.info('url-shortener', 'URL shortened successfully', { 
        id, 
        shortLink: result.shortLink,
        expiry: result.expiry 
      });

      setUrls(urls.map(url => 
        url.id === id ? { ...url, loading: false, result, error: '' } : url
      ));

    } catch (error) {
      logger.error('url-shortener', 'URL shortening failed', { 
        id, 
        error: error.message,
        status: error.response?.status
      });

      const errorMessage = error.response?.data?.error || 'Failed to shorten URL. Please try again.';
      setUrls(urls.map(url => 
        url.id === id ? { ...url, loading: false, error: errorMessage } : url
      ));
    }
  };

  const copyToClipboard = (text, id) => {
    logger.info('url-shortener', 'User clicked copy to clipboard', { id, text });
    navigator.clipboard.writeText(text).then(() => {
      logger.info('url-shortener', 'Text copied to clipboard successfully', { id });
    }).catch(() => {
      logger.error('url-shortener', 'Failed to copy text to clipboard', { id });
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <Link className="text-blue-600" size={32} />
          URL Shortener
        </h1>
        <p className="text-gray-600">Shorten up to 5 URLs concurrently with custom shortcodes and validity periods</p>
      </div>

      {globalError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {globalError}
        </div>
      )}

      <div className="space-y-6">
        {urls.map((urlData, index) => (
          <div key={urlData.id} className="p-6 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-700">URL #{index + 1}</h3>
              {urls.length > 1 && (
                <button
                  onClick={() => removeUrlField(urlData.id)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                  title="Remove URL"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Original URL *
                </label>
                <input
                  type="url"
                  value={urlData.url}
                  onChange={(e) => updateUrl(urlData.id, 'url', e.target.value)}
                  placeholder="https://example.com/very/long/url"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <Clock size={16} />
                  Validity (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10080"
                  value={urlData.validity}
                  onChange={(e) => updateUrl(urlData.id, 'validity', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <Code size={16} />
                  Custom Shortcode (optional)
                </label>
                <input
                  type="text"
                  value={urlData.shortcode}
                  onChange={(e) => updateUrl(urlData.id, 'shortcode', e.target.value)}
                  placeholder="my-custom-code"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {urlData.error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {urlData.error}
              </div>
            )}

            <button
              onClick={() => shortenUrl(urlData.id)}
              disabled={urlData.loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {urlData.loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Shortening...
                </>
              ) : (
                <>
                  <Link size={16} />
                  Shorten URL
                </>
              )}
            </button>

            {urlData.result && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Shortened URL Created!</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-green-700">Short URL:</span>
                    <code className="bg-green-100 px-2 py-1 rounded text-sm">{urlData.result.shortLink}</code>
                    <button
                      onClick={() => copyToClipboard(urlData.result.shortLink, urlData.id)}
                      className="text-green-600 hover:text-green-800 transition-colors"
                      title="Copy to clipboard"
                    >
                      <ExternalLink size={16} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-green-700">Expires:</span>
                    <span className="text-sm">{new Date(urlData.result.expiry).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {urls.length < 5 && (
        <button
          onClick={addUrlField}
          className="mt-6 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-all flex items-center gap-2 border-2 border-dashed border-gray-300"
        >
          <Plus size={20} />
          Add Another URL ({urls.length}/5)
        </button>
      )}
    </div>
  );
};

export default UrlShortener;