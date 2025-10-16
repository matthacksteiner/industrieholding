# Netlify Hybrid Images Plugin - Retry Logic Improvements

## Summary

Implemented robust retry logic with timeout handling for the `netlify-hybrid-images` plugin to
address socket hang up errors and HTTP 500 errors during builds.

## Changes Made

### 1. Configuration Options (`plugins/netlify-hybrid-images/index.js`)

Added three new configuration options:

- **`concurrency`**: Reduced from 4 to 2 (less aggressive on Kirby server)
- **`maxRetries`**: 3 retry attempts for failed downloads (new)
- **`retryDelay`**: 1000ms base delay with exponential backoff (new)
- **`timeout`**: 30000ms (30 seconds) request timeout (new)

### 2. Download Function (`plugins/netlify-hybrid-images/src/setup.js`)

Implemented intelligent retry logic with:

#### Timeout Handling

- Uses native `AbortController` and `AbortSignal` (as per node-fetch v3 best practices)
- 30-second timeout per request to prevent hanging
- Proper cleanup with `clearTimeout` in finally block

#### Smart Retry Detection

**Retriable errors** (will retry up to 3 times):

- Socket hang up
- Connection reset (ECONNRESET)
- Connection timeout (ETIMEDOUT)
- Connection refused (ECONNREFUSED)
- Timeout via AbortController
- HTTP 500 Internal Server Error
- HTTP 429 Rate Limit

**Non-retriable errors** (fail immediately):

- HTTP 404 Not Found
- HTTP 403 Forbidden
- Other 4xx client errors

#### Exponential Backoff

- First retry: 1 second delay
- Second retry: 2 seconds delay
- Third retry: 3 seconds delay

#### Improved Logging

- Clear indication of retry attempts: `Attempt 1/3 failed, retrying in 1000ms...`
- Distinguishes between timeout and connection errors
- Shows final failure message after all retries exhausted

### 3. Documentation Updates

Updated `plugins/netlify-hybrid-images/README.md` with:

- New configuration options table
- Retry logic explanation
- Backoff strategy details

### 4. Package Script Update

Updated `package.json` `sync:images` script to include new default options.

## Benefits

1. **Reduced Server Load**: Lower concurrency (2 vs 4) prevents overwhelming the Kirby server
2. **Automatic Recovery**: Transient network issues are automatically retried
3. **Smart Error Handling**: Doesn't retry on permanent failures (404, 403)
4. **Better Visibility**: Clear logging shows what's happening during retries
5. **No Hanging**: 30-second timeout prevents indefinite waits
6. **Exponential Backoff**: Gives the server time to recover between retries

## Expected Results

Based on the error logs:

- **Socket hang up errors**: Should be automatically retried and succeed on subsequent attempts
- **HTTP 500 errors**: Will retry up to 3 times (may still fail if Kirby can't generate the image)
- **Build success rate**: Should significantly improve with automatic retry handling
- **Build time**: May be slightly longer due to retries, but much more reliable

## Configuration Examples

### Default Configuration

```js
netlifyHybridImages(); // Uses all defaults
```

### Custom Configuration (More Conservative)

```js
netlifyHybridImages({
  concurrency: 1, // One at a time (very conservative)
  maxRetries: 5, // More retry attempts
  retryDelay: 2000, // Longer delays between retries
  timeout: 60000, // 60-second timeout for large images
});
```

### Custom Configuration (More Aggressive)

```js
netlifyHybridImages({
  concurrency: 4, // More simultaneous downloads
  maxRetries: 2, // Fewer retry attempts
  retryDelay: 500, // Shorter delays
  timeout: 15000, // 15-second timeout
});
```

## Technical Details

- **Node-fetch v3 compatibility**: Uses standard `AbortController` API
- **No external dependencies**: Uses native Node.js APIs
- **Proper cleanup**: All timeouts are cleared to prevent memory leaks
- **Type-safe**: Includes JSDoc comments for better IDE support

## Testing

To test locally:

```bash
npm run sync:images
```

This will run the plugin in standalone mode with the new retry logic.

## Monitoring

Watch for these log patterns during builds:

**Success after retry:**

```
⚠ Attempt 1/3 failed for /media/path/image.png: connection error, retrying in 1000ms...
✓ Cached /media/path/image.png
```

**Permanent failure:**

```
✖ Failed to cache [URL] after 3 attempts
⚠ Skipped URL rewriting because 5 assets failed to cache
```

## Next Steps

1. Monitor build logs on Netlify
2. Adjust `concurrency`, `maxRetries`, or `timeout` if needed
3. Consider increasing `timeout` for very large images if 500 errors persist
4. Contact Kirby server admin if persistent 500 errors occur (may indicate server-side image
   processing limits)
