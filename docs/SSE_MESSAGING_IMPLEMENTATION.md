# SSE Real-Time Messaging Implementation

## Overview

This document describes the implementation of Server-Sent Events (SSE) for real-time messaging in the Xians platform, replacing the previous polling mechanism with a more efficient, real-time communication system.

## Changes Summary

### Backend Changes (XiansAi.Server)

#### New Files Created

1. **WebApiSSEStreamHandler.cs** (`Features/WebApi/Utils/`)
   - Manages SSE stream connections for thread-based messaging
   - Filters messages by thread ID and tenant
   - Handles connection lifecycle and heartbeats

2. **SseEndpoints.cs** (`Features/WebApi/Endpoints/`)
   - Defines SSE endpoint: `GET /api/client/messaging/threads/{threadId}/events`
   - Configurable heartbeat interval (1-300 seconds)
   - Integrates with existing MessageEventPublisher

3. **SSE_IMPLEMENTATION.md** (`Features/WebApi/Endpoints/`)
   - Comprehensive documentation of the SSE implementation
   - Usage examples and troubleshooting guide

#### Modified Files

1. **WebApiConfiguration.cs** (`Features/WebApi/Configuration/`)
   - Added `WebApiSseEndpoints.MapWebApiSseEndpoints(app)` to endpoint mapping
   - Enables SSE endpoints for WebAPI

### Frontend Changes (XiansAi.UI)

#### New Files Created

1. **useMessageStreaming.js** (`src/modules/Manager/Components/Messaging/hooks/`)
   - Custom React hook for managing SSE connections
   - Handles connection lifecycle (start, stop, reconnect)
   - Processes different message event types (Chat, Data, Handoff)

2. **SSE_MESSAGING_IMPLEMENTATION.md** (`docs/`)
   - This documentation file

#### Modified Files

1. **messaging-api.js** (`src/modules/Manager/services/`)
   - Added `streamThreadMessages()` method
   - Connects to SSE endpoint and handles events

2. **api-client.js** (`src/modules/Manager/services/`)
   - Updated `stream()` method to properly parse SSE format
   - Handles `event:` and `data:` lines from SSE

3. **ChatConversation.jsx** (`src/modules/Manager/Components/Messaging/Conversation/`)
   - Replaced `useMessagePolling` with `useMessageStreaming`
   - Removed polling logic and timers
   - Added real-time message handling via SSE
   - Automatic streaming on thread selection

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (React)                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ChatConversation Component                                  │
│       ↓                                                       │
│  useMessageStreaming Hook                                    │
│       ↓                                                       │
│  messagingApi.streamThreadMessages()                         │
│       ↓                                                       │
│  apiClient.stream()                                          │
│       ↓                                                       │
└───────┼───────────────────────────────────────────────────────┘
        │
        │ SSE Connection
        │ GET /api/client/messaging/threads/{threadId}/events
        ↓
┌─────────────────────────────────────────────────────────────┐
│                    Backend (ASP.NET Core)                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  WebApiSseEndpoints                                          │
│       ↓                                                       │
│  WebApiSSEStreamHandler                                      │
│       ↓                                                       │
│  MessageEventPublisher (shared with UserApi)                 │
│       ↑                                                       │
│  MongoChangeStreamService                                    │
│       ↑                                                       │
│  MongoDB Change Stream                                       │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Event Flow

1. **User opens a conversation thread**
   - `ChatConversation` component mounts
   - `useMessageStreaming` hook initializes
   - SSE connection established to `/api/client/messaging/threads/{threadId}/events`

2. **Backend establishes SSE stream**
   - `WebApiSSEStreamHandler` validates thread ID and tenant
   - Subscribes to `MessageEventPublisher` events
   - Sends "connected" event to client
   - Starts heartbeat timer

3. **New message arrives in MongoDB**
   - `MongoChangeStreamService` detects change
   - Publishes event to `MessageEventPublisher`
   - `WebApiSSEStreamHandler` receives event
   - Filters by thread ID and tenant
   - Sends message to client via SSE

4. **Client receives message**
   - `api-client.stream()` parses SSE format
   - `useMessageStreaming` processes event
   - `ChatConversation` adds message to state
   - UI updates in real-time

## Benefits

### Performance Improvements

- **Reduced Server Load**: One persistent connection vs. many polling requests
- **Lower Latency**: Messages appear instantly (< 100ms) vs. 3-10 second polling delay
- **Network Efficiency**: Single connection vs. repeated HTTP requests
- **Scalability**: Better server resource utilization

### Developer Experience

- **Simpler Code**: Removed complex polling logic with exponential backoff
- **Better Debugging**: Clear event logging for connection and messages
- **Type Safety**: Structured event handling with defined event types

### User Experience

- **Real-time Updates**: Messages appear instantly
- **No Refresh Needed**: Automatic updates without user action
- **Better Reliability**: Automatic reconnection on connection loss

## Configuration

### Backend Configuration

No additional configuration required. SSE uses the existing:
- `MessageEventPublisher` (already registered in UserApiConfiguration)
- `MongoChangeStreamService` (already running)
- Authentication and authorization (existing WebAPI auth)

### Frontend Configuration

The SSE implementation automatically:
- Starts when a thread is selected
- Stops when switching threads
- Reconnects on connection loss
- Handles errors gracefully

### Heartbeat Interval

Default: 5 seconds (configurable via query parameter)

```javascript
// Custom heartbeat interval
messagingApi.streamThreadMessages(threadId, onEventReceived, { heartbeatSeconds: 30 });
```

## Testing

### Manual Testing Steps

1. **Basic Connection**
   ```
   1. Navigate to http://localhost:3000/manager/messaging?org=hasith
   2. Select an agent
   3. Select a conversation thread
   4. Open browser DevTools → Network tab
   5. Verify SSE connection to "/api/client/messaging/threads/{threadId}/events"
   6. Check Console for "Connected to message stream" log
   ```

2. **Real-time Message Reception**
   ```
   1. With a thread open, send a message via the workflow
   2. Verify message appears in UI without refresh
   3. Check Console for SSE event logs
   4. Verify < 100ms latency from send to display
   ```

3. **Heartbeat Monitoring**
   ```
   1. Keep a thread open
   2. Monitor Console for heartbeat events (every 5 seconds)
   3. Verify subscriber count in heartbeat data
   ```

4. **Connection Handling**
   ```
   1. Open a thread (connection established)
   2. Switch to another thread (old connection closed, new opened)
   3. Navigate away from messaging page (connection closed)
   4. Return to messaging page (connection re-established)
   ```

5. **Error Handling**
   ```
   1. Open DevTools → Network tab
   2. Throttle network to "Offline"
   3. Wait for connection error
   4. Restore network
   5. Verify automatic reconnection
   ```

### Browser DevTools Verification

**Network Tab:**
- Look for SSE connection (type: "eventsource" or status: "Pending")
- Connection should persist (not close immediately)
- No polling requests to `/messages` endpoint

**Console Logs:**
```
Starting message stream for thread: abc123
Received SSE event: {event: "connected", data: {...}}
Received SSE event: {event: "heartbeat", data: {...}}
Received new message from stream: {...}
```

**Server Logs:**
```
[Info] WebAPI SSE connection established for thread abc123, tenant tenant1
[Debug] Sending WebAPI SSE event Chat for message msg456 to thread abc123
[Info] WebAPI SSE connection closed for thread abc123, tenant tenant1
```

## Migration Notes

### Removed Code

The following polling-related code has been removed:
- `useMessagePolling` hook usage in `ChatConversation.jsx`
- Polling timer and exponential backoff logic
- `pollingStartTimeRef` and related polling state
- `triggerPolling` imperative handle

### Backward Compatibility

The implementation maintains backward compatibility:
- REST API endpoints still available (`/api/client/messaging/threads/{threadId}/messages`)
- Manual refresh still works
- No breaking changes to existing APIs

## Troubleshooting

### SSE Connection Not Establishing

**Symptoms:**
- No connection in Network tab
- No "Connected to message stream" log

**Solutions:**
1. Check browser console for errors
2. Verify JWT token is valid (not expired)
3. Check CORS configuration if running on different domains
4. Verify backend SSE endpoint is registered

### Messages Not Appearing in Real-time

**Symptoms:**
- Messages only appear on refresh
- SSE connection established but no events

**Solutions:**
1. Check browser console for SSE events
2. Verify MongoDB change streams are working (server logs)
3. Check thread ID matches between client and server
4. Verify tenant ID is correct

### Connection Dropping Frequently

**Symptoms:**
- Frequent reconnection logs
- Intermittent message delivery

**Solutions:**
1. Check network stability
2. Increase heartbeat interval if on slow network
3. Check server logs for errors
4. Verify proxy/load balancer supports SSE

### High Memory Usage

**Symptoms:**
- Browser tab memory increases over time
- Server memory grows with active connections

**Solutions:**
1. Verify connections are properly closed on unmount
2. Check for message state accumulation in React
3. Monitor subscriber count in heartbeat events
4. Implement message pagination/cleanup

## Future Enhancements

1. **Message Buffering**: Buffer messages during reconnection
2. **Connection Pooling**: Share SSE connections across threads
3. **Compression**: Enable gzip for SSE streams
4. **Metrics**: Add detailed performance metrics
5. **Offline Support**: Queue messages during offline periods
6. **Connection Status UI**: Visual indicator for SSE connection state

## References

- [Server-Sent Events MDN](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [SSE Specification](https://html.spec.whatwg.org/multipage/server-sent-events.html)
- UserApi SSE Implementation: `Features/UserApi/Endpoints/SSE_IMPLEMENTATION.md`
- WebApi SSE Implementation: `Features/WebApi/Endpoints/SSE_IMPLEMENTATION.md`

