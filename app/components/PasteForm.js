'use client';

import { useState } from 'react';
import { AlertCircle, Copy, Check, Clock, Eye } from 'lucide-react';

export default function PasteForm() {
  const [content, setContent] = useState('');
  const [ttlSeconds, setTtlSeconds] = useState('');
  const [maxViews, setMaxViews] = useState('');
  const [pasteUrl, setPasteUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setPasteUrl('');
    setLoading(true);

    try {
      const body = { content };
      if (ttlSeconds) body.ttl_seconds = parseInt(ttlSeconds);
      if (maxViews) body.max_views = parseInt(maxViews);

      const response = await fetch('/api/pastes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create paste');
        return;
      }

      setPasteUrl(data.url);
      setContent('');
      setTtlSeconds('');
      setMaxViews('');
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(pasteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">Pastebin Lite</h1>
          <p className="text-slate-300 text-lg">
            Share text snippets with optional expiry and view limits
          </p>
        </div>

        {pasteUrl ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">
                Paste Created Successfully!
              </h2>
              <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
                <p className="text-slate-400 text-sm mb-2">Your shareable link:</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={pasteUrl}
                    readOnly
                    className="flex-1 bg-slate-900/50 text-white px-4 py-3 rounded-lg border border-slate-600"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg transition-colors flex items-center gap-2"
                  >
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <button
                onClick={() => setPasteUrl('')}
                className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Create Another Paste
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-white text-sm font-semibold mb-2">
                Paste Content *
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter your text here..."
                rows={12}
                className="w-full bg-slate-800/50 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-purple-500 focus:outline-none resize-none"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-white text-sm font-semibold mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Time to Live (seconds)
                </label>
                <input
                  type="number"
                  value={ttlSeconds}
                  onChange={(e) => setTtlSeconds(e.target.value)}
                  placeholder="Optional"
                  min="1"
                  className="w-full bg-slate-800/50 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-purple-500 focus:outline-none"
                />
                <p className="text-slate-400 text-xs mt-1">Leave empty for no expiry</p>
              </div>

              <div>
                <label className="block text-white text-sm font-semibold mb-2 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Max Views
                </label>
                <input
                  type="number"
                  value={maxViews}
                  onChange={(e) => setMaxViews(e.target.value)}
                  placeholder="Optional"
                  min="1"
                  className="w-full bg-slate-800/50 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-purple-500 focus:outline-none"
                />
                <p className="text-slate-400 text-xs mt-1">Leave empty for unlimited</p>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || !content.trim()}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Paste'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}