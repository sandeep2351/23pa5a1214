# URL Shortener Web Application

A comprehensive URL shortener service built with React frontend and Node.js backend, featuring extensive logging middleware and analytics capabilities.

## Features

### Core Functionality
- **URL Shortening**: Shorten up to 5 URLs concurrently
- **Custom Shortcodes**: Optional custom shortcode support (3-20 characters)
- **Validity Periods**: Configurable expiry times (1-10080 minutes, default: 30 minutes)
- **Global Uniqueness**: All short links are globally unique
- **Automatic Redirection**: Seamless redirection to original URLs

### Analytics & Statistics
- **Click Tracking**: Comprehensive click analytics
- **Detailed Statistics**: View click counts, timestamps, and sources
- **Real-time Data**: Live statistics updates
- **Historical Data**: Persistent click data with geographical information

### Frontend Logging Middleware
- **Comprehensive Logging**: Structured logging for all user interactions
- **Log Levels**: Support for info, warn, error, and debug levels
- **Component Tracking**: Package-level logging for debugging
- **Required Format**: Logs output in the specified JSON format

## Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Storage**: In-memory (can be extended to databases)

## Getting Started

### Prerequisites
- Node.js 14+ installed
- npm or yarn package manager

### Installation & Running

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Both Frontend and Backend**:
   ```bash
   npm run start-all
   ```

   This will start:
   - Backend server on `http://localhost:3001`
   - Frontend development server on `http://localhost:3000`

3. **Alternative: Start Individually**:
   ```bash
   # Terminal 1 - Backend
   npm run start-backend

   # Terminal 2 - Frontend
   npm run dev
   ```

## API Endpoints

### Create Short URL
```http
POST /shorturls
Content-Type: application/json

{
  "url": "https://example.com/very/long/url",
  "validity": 30,
  "shortcode": "custom-code"
}
```

**Response**:
```json
{
  "shortLink": "http://localhost:3001/abc123",
  "expiry": "2024-01-01T10:30:00.000Z"
}
```

### Get URL Statistics
```http
GET /shorturls/:shortcode
```

**Response**:
```json
{
  "shortcode": "abc123",
  "originalUrl": "https://example.com/very/long/url",
  "shortLink": "http://localhost:3001/abc123",
  "expiry": "2024-01-01T10:30:00.000Z",
  "createdAt": "2024-01-01T10:00:00.000Z",
  "clickCount": 5,
  "clickData": [...]
}
```

### Get All URLs
```http
GET /shorturls
```

## Frontend Logging

The application implements comprehensive frontend logging middleware that outputs logs in the required format:

```json
{
    "stack": "frontend",
    "level": "info",
    "package": "component",
    "message": "User clicked on the submit button."
}
```

### Logging Levels
- **info**: General application events and user interactions
- **warn**: Warning conditions and validation failures
- **error**: Error conditions and API failures
- **debug**: Detailed debugging information

### Component Coverage
All major components include extensive logging:
- User interactions (clicks, form submissions)
- API requests and responses
- Navigation events
- Validation results
- Error conditions

## Application Structure

```
src/
├── components/
│   ├── Navigation.jsx      # Main navigation component
│   ├── UrlShortener.jsx    # URL shortening interface
│   └── UrlStatistics.jsx   # Statistics and analytics
├── services/
│   └── api.js             # API service with logging
├── utils/
│   └── logger.js          # Frontend logging middleware
└── App.jsx                # Main application component

server/
├── app.js                 # Express server
└── package.json           # Backend dependencies
```

## Key Features Implementation

### Client-Side Validation
- URL format validation (must start with http:// or https://)
- Validity range validation (1-10080 minutes)
- Shortcode format validation (alphanumeric, dash, underscore, 3-20 chars)
- Concurrent URL limit enforcement (max 5)

### Error Handling
- Comprehensive error messages
- HTTP status code handling
- User-friendly error displays
- Logging of all error conditions

### Responsive Design
- Mobile-first design approach
- Tablet and desktop optimizations
- Clean, professional interface
- Intuitive user experience

### Logging Implementation
- Structured logging throughout the application
- Component-level package identification
- Request/response logging
- User interaction tracking
- Error and warning capture

## Production Considerations

For production deployment, consider:
- Replace in-memory storage with a proper database (PostgreSQL, MongoDB)
- Implement rate limiting and API authentication
- Add Redis for caching and session management
- Set up proper logging infrastructure (ELK stack)
- Configure HTTPS and domain-based short URLs
- Implement monitoring and alerting
- Add database migrations and backup strategies

## License

This project is developed for educational and evaluation purposes.