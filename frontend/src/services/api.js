import axios from 'axios';
import { logger } from '../utils/logger.js';

const API_BASE_URL = 'http://localhost:3001';

class APIService {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        logger.info('api-service', `Making ${config.method.toUpperCase()} request to ${config.url}`, {
          url: config.url,
          method: config.method,
          data: config.data
        });
        return config;
      },
      (error) => {
        logger.error('api-service', 'Request interceptor error', { error: error.message });
        return Promise.reject(error);
      }
    );

    // Response interceptor for logging
    this.client.interceptors.response.use(
      (response) => {
        logger.info('api-service', `Received ${response.status} response from ${response.config.url}`, {
          status: response.status,
          url: response.config.url
        });
        return response;
      },
      (error) => {
        logger.error('api-service', 'API request failed', {
          url: error.config?.url,
          status: error.response?.status,
          message: error.response?.data?.error || error.message
        });
        return Promise.reject(error);
      }
    );
  }

  async createShortUrl(urlData) {
    try {
      logger.info('api-service', 'Creating short URL', { originalUrl: urlData.url });
      const response = await this.client.post('/shorturls', urlData);
      logger.info('api-service', 'Short URL created successfully', { shortLink: response.data.shortLink });
      return response.data;
    } catch (error) {
      logger.error('api-service', 'Failed to create short URL', { error: error.message });
      throw error;
    }
  }

  async getUrlStatistics(shortcode) {
    try {
      logger.info('api-service', 'Fetching URL statistics', { shortcode });
      const response = await this.client.get(`/shorturls/${shortcode}`);
      logger.info('api-service', 'URL statistics retrieved successfully', { shortcode });
      return response.data;
    } catch (error) {
      logger.error('api-service', 'Failed to fetch URL statistics', { shortcode, error: error.message });
      throw error;
    }
  }

  async getAllUrls() {
    try {
      logger.info('api-service', 'Fetching all URLs');
      const response = await this.client.get('/shorturls');
      logger.info('api-service', 'All URLs retrieved successfully', { count: response.data.length });
      return response.data;
    } catch (error) {
      logger.error('api-service', 'Failed to fetch all URLs', { error: error.message });
      throw error;
    }
  }
}

export const apiService = new APIService();