import React, { useState } from 'react';
import { X, Key, CheckCircle2, AlertCircle, RefreshCw, Shield, ExternalLink, Terminal } from 'lucide-react';
import { ApiStatus } from '../types';

interface ApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiStatus: ApiStatus;
  onSaveKey: (key: string) => Promise<boolean>;
  onVerify: () => Promise<void>;
  isVerifying: boolean;
}

export const ApiConfigModal: React.FC<ApiConfigModalProps> = ({
  isOpen,
  onClose,
  apiStatus,
  onSaveKey,
  onVerify,
  isVerifying,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKeyInput.trim()) return;

    setIsSubmitting(true);
    setFeedback(null);
    try {
      const ok = await onSaveKey(apiKeyInput.trim());
      if (ok) {
        setFeedback({
          type: 'success',
          message: 'Key securely configured and verified with live Qloo API.',
        });
        setApiKeyInput('');
      } else {
        setFeedback({
          type: 'error',
          message: 'Key saved on server, but Qloo test probe rejected it (check key format).',
        });
      }
    } catch (err: unknown) {
      setFeedback({
        type: 'error',
        message: (err as Error).message || 'Failed to update API key.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#101217] border border-[#262B37] rounded-sm w-full max-w-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#202532] bg-[#141720]">
          <div className="flex items-center gap-2.5">
            <Key className="w-4 h-4 text-[#CCFF00]" />
            <h2 className="font-editorial text-base text-[#F4F3EF] uppercase tracking-wider font-semibold">
              Qloo API Connection & Security
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#7E8594] hover:text-[#ECEBE6] p-1 transition-colors"
            aria-label="Close API configuration"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Connection Status Card */}
          <div className="p-4 rounded-sm border bg-[#0C0E12] border-[#202532] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-mono-code text-[#7A8293]">
                Server-Side Status
              </span>
              <div className="flex items-center gap-1.5 font-mono-code text-xs">
                {apiStatus.configured && apiStatus.verified ? (
                  <span className="flex items-center gap-1 text-[#34D399]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    CONNECTED & VERIFIED
                  </span>
                ) : apiStatus.configured ? (
                  <span className="flex items-center gap-1 text-[#FBBF24]">
                    <AlertCircle className="w-3.5 h-3.5" />
                    KEY ATTACHED (UNVERIFIED)
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[#F87171]">
                    <AlertCircle className="w-3.5 h-3.5" />
                    MISSING QLOO_API_KEY
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono-code pt-1 border-t border-[#1C202A]">
              <div>
                <span className="text-[#626A7A] block text-[11px]">ACTIVE SECRET:</span>
                <span className="text-[#B9BFCC]">
                  {apiStatus.maskedKey ? apiStatus.maskedKey : 'None'}
                </span>
              </div>
              <div>
                <span className="text-[#626A7A] block text-[11px]">SOURCE:</span>
                <span className="text-[#B9BFCC] uppercase">
                  {apiStatus.source === 'env'
                    ? 'Environment (.env)'
                    : apiStatus.source === 'runtime'
                    ? 'Server Session'
                    : 'Unconfigured'}
                </span>
              </div>
              {apiStatus.latencyMs !== undefined && (
                <div>
                  <span className="text-[#626A7A] block text-[11px]">PROBE LATENCY:</span>
                  <span className="text-[#34D399]">{apiStatus.latencyMs} ms</span>
                </div>
              )}
              {apiStatus.requestId && (
                <div className="col-span-2">
                  <span className="text-[#626A7A] block text-[11px]">QLOO REQUEST ID:</span>
                  <span className="text-[#8D94A5] truncate block">{apiStatus.requestId}</span>
                </div>
              )}
            </div>

            {/* Test Connection Probe Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={onVerify}
                disabled={isVerifying || !apiStatus.configured}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-mono-code rounded-sm border border-[#2A3140] bg-[#161922] text-[#D1D5DF] hover:border-[#3D475C] hover:text-white disabled:opacity-50 disabled:pointer-events-none transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin text-[#CCFF00]' : ''}`} />
                <span>{isVerifying ? 'Executing Live Ping to Qloo...' : 'Run Live API Test Probe (/search)'}</span>
              </button>
            </div>
          </div>

          {/* Feedback Notice */}
          {feedback && (
            <div
              className={`p-3 rounded-sm text-xs font-mono-code flex items-start gap-2 border ${
                feedback.type === 'success'
                  ? 'bg-[#0E1B10] text-[#86EFAC] border-[#1C3E21]'
                  : 'bg-[#210F0F] text-[#FCA5A5] border-[#4A2020]'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#22C55E]" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#EF4444]" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Key Input Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="block text-xs font-mono-code uppercase tracking-wider text-[#A7ADB9]">
              Configure or Update QLOO_API_KEY
            </label>
            <div className="relative">
              <input
                type="password"
                value={apiKeyInput}
                onChange={e => setApiKeyInput(e.target.value)}
                placeholder="Enter Qloo Hackathon API Key"
                className="w-full px-3.5 py-2.5 text-xs font-mono-code bg-[#0B0C10] border border-[#2B313F] text-[#ECEBE6] placeholder:text-[#525968] rounded-sm focus:outline-none focus:border-[#CCFF00] transition-colors"
              />
            </div>
            <p className="text-[11px] text-[#717887]">
              Stored strictly in server-side memory for your session. It is passed via the official{' '}
              <code className="text-[#CCFF00]">X-Api-Key</code> header and is never exposed to the client.
            </p>
            <button
              type="submit"
              disabled={isSubmitting || !apiKeyInput.trim()}
              className="w-full py-2.5 px-4 bg-[#CCFF00] text-black font-mono-code text-xs font-semibold rounded-sm hover:bg-[#bbf000] active:scale-[0.99] disabled:opacity-40 disabled:pointer-events-none transition-all"
            >
              {isSubmitting ? 'Verifying & Saving...' : 'Save & Verify Key'}
            </button>
          </form>

          {/* Official Specs Reference */}
          <div className="pt-2 border-t border-[#1F2430] space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-mono-code text-[#7A8293]">
              <Terminal className="w-3.5 h-3.5 text-[#CCFF00]" />
              <span>OFFICIAL QLOO HACKATHON SPECS</span>
            </div>
            <ul className="text-[11px] font-mono-code text-[#8A91A1] space-y-1 pl-2">
              <li>• Base URL: <code className="text-[#D8DCE5]">https://hackathon.api.qloo.com</code></li>
              <li>• Auth: <code className="text-[#D8DCE5]">X-Api-Key: &lt;YOUR_KEY&gt;</code></li>
              <li>• Entity Resolution: <code className="text-[#D8DCE5]">GET /search?query=&amp;types=</code></li>
              <li>• Cultural Insights: <code className="text-[#D8DCE5]">GET /v2/insights</code></li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#202532] bg-[#12151D] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-mono-code text-[#A6ABB8] hover:text-[#F4F3EF] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
