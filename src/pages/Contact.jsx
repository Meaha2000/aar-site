import React, { useState, useEffect } from 'react';
import {
  Mail,
  Send,
  ShieldCheck,
  CreditCard,
  FileText,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  HelpCircle,
  Clock
} from 'lucide-react';
import { authApi } from '../lib/api';

export function Contact() {
  const [activeTab, setActiveTab] = useState('contact'); // 'contact' | 'terms' | 'privacy' | 'refund'
  
  // Contact Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('General API Inquiry');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  // Automated Refund State
  const [refundLoading, setRefundLoading] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [refundResult, setRefundResult] = useState(null);

  const handleAutomatedRefund = async () => {
    if (!authApi.isAuthenticated()) {
      setRefundResult({
        type: 'error',
        text: 'Please sign in to your account on the Dashboard first so we can verify your order and usage telemetry.',
      });
      return;
    }
    if (!window.confirm('Request an immediate automated refund for your latest purchase? If eligible (within 14 days and under the 2% usage threshold), your payment will be refunded and associated plan quotas or credits will be immediately deactivated.')) {
      return;
    }
    setRefundLoading(true);
    setRefundResult(null);
    try {
      const res = await authApi.requestPolarRefund(refundReason || 'Customer requested refund via Refund Policy portal');
      setRefundResult({
        type: 'success',
        text: `${res.message} (Refunded: $${Number(res.refunded_amount_usd || 0).toFixed(2)} USD · Order ID: ${res.order_id})`,
      });
    } catch (err) {
      setRefundResult({
        type: 'error',
        text: err.message || 'Refund verification failed. Your account may not meet the eligibility criteria.',
      });
    } finally {
      setRefundLoading(false);
    }
  };

  // Check URL hash for direct links (e.g. /contact#terms)
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (['terms', 'privacy', 'refund'].includes(hash)) {
      setActiveTab(hash);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError('Please enter your name before submitting.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address so our team can reply to you.');
      return;
    }
    if (message.trim().length < 5) {
      setError('Please enter at least 5 characters in your message before sending.');
      return;
    }
    setSubmitting(true);
    try {
      await authApi.sendContactMessage({
        name,
        email,
        subject,
        message,
      });
      setSubmitting(false);
      setSubmitted(true);
    } catch (err) {
      setSubmitting(false);
      setError(err.message || 'Failed to dispatch message. Please email support@aarecords.tech directly.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Page Header */}
      <div className="space-y-3 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-8">
        <span className="text-xs font-mono uppercase tracking-wider text-brand-600 dark:text-brand-400 font-semibold">
          Support & Governance
        </span>
        <h1 className="font-sans font-bold text-3xl sm:text-4xl text-zinc-900 dark:text-zinc-100">
          Contact & Legal Terms
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Official developer support channels, non-hosting intellectual property notice, and billing policies.
        </p>
      </div>

      {/* Navigation Pills */}
      <div className="w-full min-w-0 overflow-hidden pb-4 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div className="flex gap-2 overflow-x-auto tabs-scrollbar pb-1 flex-nowrap scroll-smooth touch-pan-x">
          {[
            { id: 'contact', label: 'Support & Inquiries', icon: MessageSquare },
            { id: 'refund', label: 'Refund & Cancellation Policy', icon: ShieldCheck },
            { id: 'terms', label: 'Terms of Service', icon: FileText },
            { id: 'privacy', label: 'Privacy Policy', icon: CreditCard },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  window.location.hash = tab.id;
                }}
                className={`shrink-0 whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: CONTACT FORM & CHANNELS */}
      {activeTab === 'contact' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Form */}
          <div className="md:col-span-2 p-6 sm:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-6">
            <div>
              <h2 className="font-sans font-bold text-lg text-zinc-900 dark:text-zinc-100">
                Send a Message to Engineering Support
              </h2>
              <p className="text-xs text-zinc-500 mt-1">
                We respond within 24 hours on business days.
              </p>
            </div>

            {submitted ? (
              <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Message Received</span>
                </div>
                <p>
                  Thank you! Our engineering team has received your inquiry and will follow up with you at <strong>{email}</strong> shortly.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setMessage('');
                  }}
                  className="mt-3 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Developer Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jane@company.com"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Subject / Department
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 font-sans"
                  >
                    <option value="General API Inquiry">General API Inquiry</option>
                    <option value="Enterprise High-Volume Keys">Enterprise & Custom Plans</option>
                    <option value="Billing & Invoicing Assistance">Billing, Top-Ups & Refunds</option>
                    <option value="Bug Report or Corpus Error">Technical Support & Bug Reports</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Message
                  </label>
                  <textarea
                    rows={5}
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Provide details about your query or use case (minimum 5 characters)..."
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                {error && (
                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-600 dark:text-red-400 text-xs font-sans flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
                >
                  {submitting ? 'Sending...' : 'Submit Message'}
                </button>
              </form>
            )}
          </div>

          {/* Direct channels sidebar */}
          <div className="space-y-4">
            <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold block">
                Official Channels
              </span>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-zinc-400 block text-[11px]">General & Partnerships:</span>
                  <a href="mailto:contact@aarecords.tech" className="font-mono text-brand-600 dark:text-brand-400 hover:underline">
                    contact@aarecords.tech
                  </a>
                </div>

                <div>
                  <span className="text-zinc-400 block text-[11px]">Technical & API Support:</span>
                  <a href="mailto:support@aarecords.tech" className="font-mono text-brand-600 dark:text-brand-400 hover:underline">
                    support@aarecords.tech
                  </a>
                </div>

                <div>
                  <span className="text-zinc-400 block text-[11px]">Billing, Upgrades & Refunds:</span>
                  <a href="mailto:billing@aarecords.tech" className="font-mono text-brand-600 dark:text-brand-400 hover:underline">
                    billing@aarecords.tech
                  </a>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2">
              <span className="font-sans font-bold text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-brand-500" />
                Response SLAs
              </span>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Free Sandbox: Community forum & documentation support.<br />
                Starter & Pro: 24h email turnaround.<br />
                Enterprise: 1-hour critical response via private channel.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: REFUND & CANCELLATION POLICY */}
      {activeTab === 'refund' && (
        <div className="p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-sans font-bold text-xl text-zinc-900 dark:text-zinc-100">
                14-Day Refund & Cancellation Policy
              </h2>
              <span className="text-xs text-zinc-500 font-mono">Strict Digital API Consumption & Fair-Use Terms</span>
            </div>
          </div>

          <div className="prose dark:prose-invert text-xs text-zinc-600 dark:text-zinc-300 max-w-none space-y-4 leading-relaxed">
            <p>
              Because Anime Akashic Records ("AAR") provides instant programmatic access to proprietary vector indexes, high-compute RAG pipelines, and structured metadata, our <strong>14-day refund policy</strong> is strictly governed by verifiable API consumption metrics to protect our infrastructure against automated bulk harvesting and quota abuse.
            </p>

            <h3 className="font-sans font-bold text-sm text-zinc-900 dark:text-zinc-100">
              1. Eligibility Criteria for Monthly Subscriptions (14-Day Window)
            </h3>
            <p>
              First-time subscription purchases (Starter, Pro, and Business tiers) are eligible for a refund within <strong>14 calendar days</strong> of the initial transaction date <strong>strictly and exclusively if ALL of the following conditions are met</strong>:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>Minimal Evaluation Threshold (&le; 2% Quota Usage):</strong> Total cumulative API consumption across the account (including all active and revoked API keys) has not exceeded <strong>2% of the plan's monthly quota allocation</strong> (or a hard cap of <strong>150 Normal queries and 15 Advanced Lore/RAG queries</strong>, whichever is lower).
              </li>
              <li>
                <strong>No Automated Harvesting or Rate-Limit Violations:</strong> The account has not triggered anti-scraping defenses, high-concurrency burst extraction, or Terms of Service violations.
              </li>
              <li>
                <strong>First-Time Billing Cycle Only:</strong> Refund eligibility applies strictly to a user's initial subscription purchase. Subsequent monthly renewals, mid-cycle tier upgrades, and previously refunded accounts are strictly non-refundable.
              </li>
            </ul>
            <p>
              Once an account exceeds the 2% evaluation threshold within a billing cycle, the digital service is deemed fully delivered and consumed in production, rendering the subscription <strong>100% non-refundable</strong>.
            </p>

            <h3 className="font-sans font-bold text-sm text-zinc-900 dark:text-zinc-100">
              2. Pay-As-You-Go (PAYG) Wallet Credits
            </h3>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>Consumed Credits are Non-Refundable:</strong> Any PAYG wallet balance that has already been deducted for API calls (Normal Catalog or Advanced Lore/RAG operations) is strictly non-refundable under all circumstances.
              </li>
              <li>
                <strong>Unused Wallet Top-Ups:</strong> A refund may be requested within 14 days of a wallet top-up <strong>only if 100% of the purchased credit package remains completely unused</strong> (or at AAR's sole discretion, a prorated refund of the remaining unspent balance minus payment gateway processing and administrative fees, provided less than 5% of the top-up was consumed).
              </li>
              <li>
                <strong>Promotional & Bonus Credits:</strong> Complimentary sandbox allocations, promotional credits, and manual adjustments carry no cash value and are non-refundable and non-transferable.
              </li>
            </ul>

            <h3 className="font-sans font-bold text-sm text-zinc-900 dark:text-zinc-100">
              3. Subscription Cancellations & Mid-Cycle Upgrades
            </h3>
            <p>
              You may cancel your recurring subscription at any time via the Dashboard or by contacting <code className="font-mono text-brand-600 dark:text-brand-400">billing@aarecords.tech</code>. Cancellation stops all future recurring charges; your active tier quotas remain accessible until the end of the current paid billing period, with no prorated cash refunds issued for partially unused months. When upgrading tiers mid-cycle, differential pricing applies exclusively toward the higher tier.
            </p>

            <h3 className="font-sans font-bold text-sm text-zinc-900 dark:text-zinc-100">
              4. Chargeback & Payment Dispute Policy
            </h3>
            <p>
              Initiating a fraudulent credit card chargeback or payment dispute after consuming API quota constitutes a material breach of contract. Upon receipt of a dispute notice, AAR immediately and permanently revokes all associated API keys, freezes account access, logs telemetry evidence (IP hashes, timestamps, cryptographic key signatures, and query payloads), and submits the full audit trail to the payment processor to contest the dispute.
            </p>

            <h3 className="font-sans font-bold text-sm text-zinc-900 dark:text-zinc-100">
              5. Automated Refund Verification & Submission
            </h3>
            <p>
              You can trigger an instant automated eligibility check and refund directly below if you are signed in, or email <code className="font-mono text-brand-600 dark:text-brand-400">billing@aarecords.tech</code> with your registered email address and invoice reference.
            </p>

            <div className="not-prose mt-4 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/60 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-sans font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    Instant 14-Day Automated Refund Portal
                  </h4>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Automatically verifies the 14-day window and &le;2% quota usage rule (or 100% unconsumed PAYG balance) and issues an immediate reversal via Polar.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAutomatedRefund}
                  disabled={refundLoading}
                  className="px-4 py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-sans font-semibold text-xs hover:opacity-90 transition-opacity disabled:opacity-50 shrink-0 cursor-pointer"
                >
                  {refundLoading ? 'Verifying Telemetry...' : 'Verify & Refund Latest Purchase'}
                </button>
              </div>

              <input
                type="text"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Optional: brief reason for refund request..."
                className="w-full px-3.5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-brand-500"
              />

              {refundResult && (
                <div className={`p-3.5 rounded-lg border text-xs flex items-start gap-2.5 ${
                  refundResult.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                    : 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300'
                }`}>
                  {refundResult.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  )}
                  <span>{refundResult.text}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TERMS OF SERVICE */}
      {activeTab === 'terms' && (
        <div className="p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-sans font-bold text-xl text-zinc-900 dark:text-zinc-100">
                Terms of Service & API License Agreement
              </h2>
              <span className="text-xs text-zinc-500 font-mono">Effective Date: November 2026</span>
            </div>
          </div>

          <div className="prose dark:prose-invert text-xs text-zinc-600 dark:text-zinc-300 max-w-none space-y-4 leading-relaxed">
            <h3 className="font-sans font-bold text-sm text-zinc-900 dark:text-zinc-100">1. Acceptance of Binding Agreement</h3>
            <p>
              By accessing, browsing, registering for, or executing programmatic requests against Anime Akashic Records ("AAR", "Platform", "we", "us", or "our") via <code className="font-mono">aarecords.tech</code> or <code className="font-mono">api.aarecords.tech</code>, you ("Licensee", "Developer", or "User") agree to be legally bound by these Terms of Service. If you are accessing the Service on behalf of a corporation or commercial entity, you warrant that you possess full legal authority to bind that entity.
            </p>

            <h3 className="font-sans font-bold text-sm text-zinc-900 dark:text-zinc-100">2. Scope of API License & Permitted Commercial Use</h3>
            <p>
              Subject to continuous compliance with these Terms and timely payment of applicable fees, AAR grants you a limited, revocable, non-exclusive, non-transferable, non-sublicensable license to query our API endpoints and display returned metadata, cross-platform ID mappings, and scene/arc search responses within your end-user applications, websites, bots, or AI agents.
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>Transient Caching Only:</strong> You may temporarily cache individual API responses in memory for up to <strong>24 hours</strong> solely to optimize end-user latency in your application.
              </li>
              <li>
                <strong>No Standalone Data Resale:</strong> You may not resell, redistribute, sublicense, or syndicate raw AAR API payloads as a standalone database, competing API gateway, or proxy service.
              </li>
            </ul>

            <h3 className="font-sans font-bold text-sm text-zinc-900 dark:text-zinc-100">3. Strict Anti-Scraping, Anti-Harvesting & Model Training Restrictions</h3>
            <p>
              You expressly agree NOT to engage in any of the following prohibited activities:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>Bulk Dataset Reconstruction:</strong> Systematically querying `/search`, `/advanced-search`, `/lore-ask`, or `/resolve` to scrape, mirror, dump, or reconstruct substantial portions of AAR's 146,140+ catalog works or 762,318+ indexed anime scenes, timestamps, and story arc graphs.
              </li>
              <li>
                <strong>Competing Embedding & Foundation Model Training:</strong> Using AAR responses, dense vector rankings, or synthesized RAG outputs to train, fine-tune, or distill competing search indexes, embedding models, or commercial dataset repositories without an explicit written Enterprise Dataset License.
              </li>
              <li>
                <strong>Rate-Limit Circumvention & Multi-Account Abuse:</strong> Creating multiple free accounts, rotating IP addresses/proxies, sharing API keys across unaffiliated organizations, or spoofing request headers to bypass daily sandbox quotas, RPS/RPM concurrency ceilings, or billing meters.
              </li>
              <li>
                <strong>Security & Infrastructure Interference:</strong> Attempting to reverse-engineer scoring weights, probe internal server endpoints, inject malicious payloads, or conduct denial-of-service (DoS) stress tests against AAR infrastructure.
              </li>
            </ul>
            <p>
              <strong>Enforcement & Immediate Forfeiture:</strong> Any violation of Section 3 results in immediate, permanent termination of your account and API keys without prior notice and <strong>strictly forfeits all remaining subscription quotas and PAYG wallet balances without refund</strong>.
            </p>

            <h3 className="font-sans font-bold text-sm text-zinc-900 dark:text-zinc-100">
              4. Intellectual Property, Non-Hosting & Third-Party Trademarks
            </h3>
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 space-y-2 text-xs leading-relaxed">
              <p className="font-semibold text-amber-800 dark:text-amber-300">
                CRITICAL LEGAL NOTICE ON INTELLECTUAL PROPERTY & METADATA-ONLY SERVICE:
              </p>
              <p>
                Anime Akashic Records (AAR) does NOT host, store, stream, distribute, transcode, or transmit any video files, full episodes, manga scans, audio tracks, or copyrighted media streams. All anime titles, character names, franchise lore, and promotional cover thumbnails referenced in bibliographic metadata remain the exclusive property of their respective copyright owners, authors, publishers, and production committees.
              </p>
              <p>
                AAR operates strictly as an independent bibliographic discovery engine, cross-platform identifier crosswalk, and factual scene-timestamp index. AAR's proprietary software architecture, vector embeddings, hybrid ranking algorithms, scene segmentation taxonomies, and API schemas are the exclusive intellectual property of Anime Akashic Records.
              </p>
            </div>

            <h3 className="font-sans font-bold text-sm text-zinc-900 dark:text-zinc-100">5. AI / LLM RAG Output Disclaimer</h3>
            <p>
              Endpoints utilizing Large Language Models (`/ask` and `/lore-ask`) generate synthesized responses grounded in retrieved catalog and scene passages. AI-generated outputs are provided on an "AS-IS" informational basis; AAR makes no warranty that LLM syntheses will be completely free of factual inaccuracies, hallucinations, or omissions, and Licensee assumes sole responsibility for how outputs are displayed to end-users.
            </p>

            <h3 className="font-sans font-bold text-sm text-zinc-900 dark:text-zinc-100">6. Billing, Quotas, Expiration & Accounting Finality</h3>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>Monthly Quota Reset:</strong> Subscription tier quotas (Normal, Advanced, and Utility) are valid for 30 calendar days from activation and do not roll over to subsequent months.
              </li>
              <li>
                <strong>Telemetry Finality:</strong> AAR's internal cryptographic audit ledger (`credit_ledger` and server request logs) serves as the sole, authoritative, and conclusive record of API usage and quota deduction for all billing calculations.
              </li>
              <li>
                <strong>Pricing & Tier Modifications:</strong> AAR reserves the right to modify subscription pricing, quota allocations, or PAYG unit costs with reasonable notice; changes apply to subsequent billing cycles or future top-ups.
              </li>
            </ul>

            <h3 className="font-sans font-bold text-sm text-zinc-900 dark:text-zinc-100">7. Service Availability, "AS-IS" Warranty Disclaimer & Limitation of Liability</h3>
            <p>
              THE SERVICE AND ALL API ENDPOINTS ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT. AAR DOES NOT GUARANTEE 100% UNINTERRUPTED UPTIME.
            </p>
            <p>
              IN NO EVENT SHALL ANIME AKASHIC RECORDS, ITS FOUNDERS, OR OPERATORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES (INCLUDING LOSS OF PROFITS, DATA, OR BUSINESS INTERRUPTION) ARISING OUT OF YOUR USE OR INABILITY TO USE THE API. AAR'S TOTAL CUMULATIVE LIABILITY FOR ANY CLAIM SHALL NOT EXCEED THE TOTAL AMOUNT ACTUALLY PAID BY YOU TO AAR IN THE <strong>THIRTY (30) DAYS</strong> IMMEDIATELY PRECEDING THE EVENT GIVING RISE TO LIABILITY.
            </p>

            <h3 className="font-sans font-bold text-sm text-zinc-900 dark:text-zinc-100">8. Indemnification & Account Termination</h3>
            <p>
              You agree to indemnify, defend, and hold harmless AAR and its operators from any third-party claims, damages, liabilities, and legal fees arising from your application, your violation of these Terms, or your misuse of the API. AAR reserves the right to suspend or terminate any account at its sole discretion to protect platform integrity, security, or legal compliance.
            </p>
          </div>
        </div>
      )}

      {/* TAB 4: PRIVACY POLICY */}
      {activeTab === 'privacy' && (
        <div className="p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-sans font-bold text-xl text-zinc-900 dark:text-zinc-100">
                Privacy Policy & Data Protection
              </h2>
              <span className="text-xs text-zinc-500 font-mono">GDPR & CCPA Compliant · Zero Ad-Tracking</span>
            </div>
          </div>

          <div className="prose dark:prose-invert text-xs text-zinc-600 dark:text-zinc-300 max-w-none space-y-4 leading-relaxed">
            <p>
              Anime Akashic Records respects developer privacy. We enforce strict data minimization and operate with zero third-party behavioral advertising trackers.
            </p>

            <h3 className="font-sans font-bold text-sm text-zinc-900 dark:text-zinc-100">1. Information We Collect & Purpose</h3>
            <p>
              We collect only the technical records necessary to authenticate accounts, enforce rate limits, and maintain billing accuracy:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Account Identity:</strong> Email address, display name, authentication provider (Google OAuth or OTP), and cryptographic password hashes (PBKDF2-HMAC-SHA256).</li>
              <li><strong>API & Security Telemetry:</strong> Endpoint path, HTTP status, response latency, quota consumption, hashed/raw IP addresses for anti-abuse rate limiting, and API key prefixes.</li>
              <li><strong>Billing Audit Ledger:</strong> Transaction timestamps, plan tier activations, credit adjustments, and invoice references.</li>
            </ul>

            <h3 className="font-sans font-bold text-sm text-zinc-900 dark:text-zinc-100">2. Zero Third-Party Data Selling & Security Retention</h3>
            <p>
              We do NOT load advertising pixels, cross-site tracking cookies, or sell user telemetry to data brokers. Security and billing logs are retained to prevent fraud, resolve billing disputes, and protect API infrastructure against automated attacks.
            </p>

            <h3 className="font-sans font-bold text-sm text-zinc-900 dark:text-zinc-100">3. Data Access & Deletion Rights</h3>
            <p>
              You may request an export of your account data or permanent deletion of your account and revocation of all associated API keys at any time by contacting <code className="font-mono text-brand-600 dark:text-brand-400">support@aarecords.tech</code>, subject to retention of mandatory financial transaction records required for accounting and fraud-prevention compliance.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
