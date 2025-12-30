import { kv } from '@vercel/kv';
import { notFound } from 'next/navigation';

function getCurrentTime(headers) {
  if (process.env.TEST_MODE === '1') {
    const testNow = headers['x-test-now-ms'];
    if (testNow) {
      return parseInt(testNow);
    }
  }
  return Date.now();
}

async function getPaste(id, headers) {
  const pasteKey = `paste:${id}`;
  const pasteData = await kv.get(pasteKey);
  
  if (!pasteData) {
    return null;
  }

  const paste = typeof pasteData === 'string' ? JSON.parse(pasteData) : pasteData;
  const currentTime = getCurrentTime(headers || {});

  if (paste.expires_at && new Date(paste.expires_at).getTime() <= currentTime) {
    await kv.del(pasteKey);
    return null;
  }

  if (paste.remaining_views !== null) {
    if (paste.remaining_views <= 0) {
      return null;
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

  return paste;
}

export default async function PastePage({ params }) {
  const { id } = params;
  const paste = await getPaste(id);

  if (!paste) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          <h1 className="text-3xl font-bold text-white mb-6">Paste Content</h1>
          <div className="bg-slate-800/50 rounded-lg p-6">
            <pre className="text-white whitespace-pre-wrap break-words font-mono text-sm">
              {paste.content}
            </pre>
          </div>
          {(paste.remaining_views !== null || paste.expires_at) && (
            <div className="mt-4 flex gap-4 text-sm text-slate-300">
              {paste.remaining_views !== null && (
                <div>Remaining views: {paste.remaining_views}</div>
              )}
              {paste.expires_at && (
                <div>Expires: {new Date(paste.expires_at).toLocaleString()}</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}