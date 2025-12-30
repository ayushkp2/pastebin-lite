import { kv } from '@vercel/kv';
import { nanoid } from 'nanoid';

function getCurrentTime(headers) {
  if (process.env.TEST_MODE === '1') {
    const testNow = headers.get('x-test-now-ms');
    if (testNow) {
      return parseInt(testNow);
    }
  }
  return Date.now();
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { content, ttl_seconds, max_views } = body;

    if (!content || typeof content !== 'string' || content.trim() === '') {
      return Response.json(
        { error: 'Content is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    if (ttl_seconds !== undefined) {
      if (!Number.isInteger(ttl_seconds) || ttl_seconds < 1) {
        return Response.json(
          { error: 'ttl_seconds must be an integer >= 1' },
          { status: 400 }
        );
      }
    }

    if (max_views !== undefined) {
      if (!Number.isInteger(max_views) || max_views < 1) {
        return Response.json(
          { error: 'max_views must be an integer >= 1' },
          { status: 400 }
        );
      }
    }

    const id = nanoid(10);
    const currentTime = getCurrentTime(request.headers);
    
    const paste = {
      content,
      max_views: max_views || null,
      remaining_views: max_views || null,
      expires_at: ttl_seconds ? new Date(currentTime + ttl_seconds * 1000).toISOString() : null,
      created_at: currentTime
    };

    await kv.set(`paste:${id}`, JSON.stringify(paste));

    if (ttl_seconds) {
      await kv.expire(`paste:${id}`, ttl_seconds);
    }

    const protocol = request.headers.get('x-forwarded-proto') || 'https';
    const host = request.headers.get('host');
    const url = `${protocol}://${host}/p/${id}`;

    return Response.json({ id, url }, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}