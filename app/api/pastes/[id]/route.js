import { kv } from '@vercel/kv';

function getCurrentTime(headers) {
  if (process.env.TEST_MODE === '1') {
    const testNow = headers.get('x-test-now-ms');
    if (testNow) {
      return parseInt(testNow);
    }
  }
  return Date.now();
}

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const pasteKey = `paste:${id}`;
    
    const pasteData = await kv.get(pasteKey);
    
    if (!pasteData) {
      return Response.json({ error: 'Paste not found' }, { status: 404 });
    }

    const paste = typeof pasteData === 'string' ? JSON.parse(pasteData) : pasteData;
    const currentTime = getCurrentTime(request.headers);

    if (paste.expires_at && new Date(paste.expires_at).getTime() <= currentTime) {
      await kv.del(pasteKey);
      return Response.json({ error: 'Paste expired' }, { status: 404 });
    }

    if (paste.remaining_views !== null) {
      if (paste.remaining_views <= 0) {
        return Response.json({ error: 'View limit exceeded' }, { status: 404 });
      }
      
      paste.remaining_views -= 1;
      
      if (paste.remaining_views === 0) {
        await kv.del(pasteKey);
      } else {
        await kv.set(pasteKey, JSON.stringify(paste));
        if (paste.expires_at) {
          const ttl = Math.max(1, Math.floor((new Date(paste.expires_at).getTime() - currentTime) / 1000));
          await kv.expire(pasteKey, ttl);
        }
      }
    }

    return Response.json({
      content: paste.content,
      remaining_views: paste.remaining_views,
      expires_at: paste.expires_at
    });
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}