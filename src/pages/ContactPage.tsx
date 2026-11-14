import React, { useState } from 'react';
import { CheckCircle2, Mail, MapPin, Phone, Send } from 'lucide-react';
import { useLearning } from '../hooks/useLearning';

export default function ContactPage() {
  const { siteContent, submitContactMessage } = useLearning();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      setError('Please complete all fields before sending.');
      return;
    }

    setSending(true);
    setError(null);
    try {
      await submitContactMessage({ name, email, subject, message });
      setSent(true);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send message right now.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-[#100B20] text-white">
      <div className="mx-auto max-w-[1280px] px-6 py-12 lg:py-16">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-wide text-[#A855F7]">
            Learn It With AI · Support &amp; Inquiries
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
            Contact Us
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            Have questions about courses, certificates, enterprise training, or your student
            account? Send our team a message directly.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-5">
            <div className="rounded-2xl border border-white/10 bg-[#17112B]/80 backdrop-blur-md p-6">
              <Mail className="h-5 w-5 text-[#A855F7]" />
              <h2 className="mt-3 font-display text-base font-semibold text-white">Email</h2>
              <p className="mt-1 text-sm text-slate-300">{siteContent.contactEmail}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#17112B]/80 backdrop-blur-md p-6">
              <Phone className="h-5 w-5 text-[#A855F7]" />
              <h2 className="mt-3 font-display text-base font-semibold text-white">Phone</h2>
              <p className="mt-1 text-sm text-slate-300">{siteContent.contactPhone}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#17112B]/80 backdrop-blur-md p-6">
              <MapPin className="h-5 w-5 text-[#A855F7]" />
              <h2 className="mt-3 font-display text-base font-semibold text-white">Campus</h2>
              <p className="mt-1 text-sm text-slate-300">{siteContent.contactLocation}</p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-2xl border border-white/10 bg-[#17112B]/80 backdrop-blur-md p-6 sm:p-8 lg:col-span-7"
          >
            <h2 className="font-display text-lg font-semibold text-white">Send a Message</h2>

            {sent && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-200">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Your message has been delivered to the Learn It With AI team.</span>
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-200">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="contact-name" className="block text-xs font-medium text-slate-300">
                  Full Name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#100B20] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-[#A855F7] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="contact-email" className="block text-xs font-medium text-slate-300">
                  Email Address
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#100B20] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-[#A855F7] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="contact-subject" className="block text-xs font-medium text-slate-300">
                Subject
              </label>
              <input
                id="contact-subject"
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Course inquiry, technical support, or partnership"
                className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#100B20] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-[#A855F7] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="contact-message" className="block text-xs font-medium text-slate-300">
                Message
              </label>
              <textarea
                id="contact-message"
                rows={5}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message here..."
                className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#100B20] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-[#A855F7] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="inline-flex items-center gap-2 rounded-lg bg-[#6D28D9] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#7C3AED] disabled:opacity-60"
            >
              <Send className="h-4 w-4" />
              {sending ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
