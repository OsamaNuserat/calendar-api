# Calendar

A full-stack calendar application with Google Calendar integration.

## Features

- Create, read, update, and delete events
- Google Calendar synchronization
- Firebase backend storage
- React frontend with TypeScript
- NestJS backend with TypeScript

## Google Calendar Integration

### Important Note: Service Account Limitations

When using a service account for Google Calendar API authentication, there are important limitations to be aware of:

**Service accounts cannot invite attendees to events without Domain-Wide Delegation of Authority.**

This is a Google Calendar API limitation, not a bug in this application. When you create events with attendees using a service account, the attendees will be stored in your local database but will not be invited to the Google Calendar event.

### Solutions

#### Option 1: Use OAuth2 Authentication (Recommended for Production)

To enable attendee invitations, you need to use OAuth2 authentication instead of a service account:

1. Set up OAuth2 credentials in Google Cloud Console
2. Configure the application to use OAuth2 flow
3. Users will need to authorize the application to access their calendar

#### Option 2: Domain-Wide Delegation (For Google Workspace)

If you're using Google Workspace (formerly G Suite), you can enable Domain-Wide Delegation:

1. In Google Workspace Admin Console, authorize your service account
2. Grant the necessary scopes for calendar access
3. This allows the service account to act on behalf of users in your domain

#### Option 3: Current Implementation (Graceful Degradation)

The current implementation handles this limitation gracefully:

- Events are created in Google Calendar without attendees
- Attendees are still stored in your local database
- Users can see attendees in the local calendar interface
- Warning messages are logged when attendees cannot be invited

### Checking Authentication Status

You can check the current authentication status by calling:

```bash
GET /events/google-calendar/auth-info
```

This endpoint returns information about:
- Whether Google Calendar sync is enabled
- The type of authentication being used
- Whether attendees can be invited
- Relevant warning messages

### Environment Variables

Make sure to set the following environment variables:

```env
GOOGLE_CALENDAR_ENABLED=true
GOOGLE_APPLICATION_CREDENTIALS=path/to/your/service-account-key.json
GOOGLE_CALENDAR_ID=primary
```

## Installation and Setup

### Backend

```bash
cd backend
npm install
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
npm start
```

## API Documentation

Once the backend is running, you can access the Swagger documentation at:
http://localhost:3001/api 
