import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = { title: "Terms of Service" };

const lastUpdated = "August 2026";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-100">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="h-8 w-8" />
            <span className="text-lg font-bold tracking-tight">MQLeads</span>
          </Link>
          <Link href="/" className="btn-ghost">
            ← Back
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Terms of Service</h1>
        <p className="mt-2 text-sm text-slate-500">
          <b>MQLeads</b> (operated by <span className="text-slate-700">ZYANIX</span>) — Last
          updated: {lastUpdated}
        </p>

        <div className="mt-8 space-y-8 text-slate-700">
          <section>
            <h2 className="mb-2 text-lg font-semibold text-slate-900">1. Acceptance of terms</h2>
            <p>
              By creating an account or using MQLeads (&quot;the Service&quot;), you agree to these Terms. If you
              are using the Service on behalf of a company or agency, you represent that you have authority to
              bind that entity. If you do not agree, do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-slate-900">2. The Service</h2>
            <p>
              MQLeads lets you connect your company&apos;s social accounts and domain, track visitors to your
              website, generate and manage leads, analyse competitors, and sync search-query data. We may
              add, change, or remove features; we will make reasonable efforts to notify you of material
              changes.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-slate-900">3. Accounts &amp; security</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>You must provide accurate registration information and keep it up to date.</li>
              <li>You are responsible for safeguarding your password and for all activity under your account.</li>
              <li>One account may not be shared with persons outside your company/agency without our permission.</li>
              <li>Notify us immediately at <a className="text-indigo-600 hover:underline" href="mailto:support@zyanix.xyz">support@zyanix.xyz</a> of any unauthorised use.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-slate-900">4. Connected accounts</h2>
            <p>
              You authorise us to connect to third-party platforms (LinkedIn, Instagram, X, YouTube, Facebook,
              Reddit, Google) using OAuth on your behalf. You must comply with those platforms&apos; own terms,
              and you are responsible for ensuring that the accounts you connect are yours or that you have the
              right to connect them. We are not liable for actions those platforms take (including revoking or
              restricting access).
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-slate-900">5. Your content &amp; data</h2>
            <p>
              You retain ownership of the data you enter into the Service and the visitor data collected through
              the tracking script on your site. You grant us a limited licence to process that data solely to
              provide the Service. You are responsible for the lawfulness of the data you upload or track,
              including obtaining any required consent from your website visitors.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-slate-900">6. Acceptable use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Use the Service to collect sensitive personal data (health, religion, political opinions, etc.).</li>
              <li>Track visitors without the disclosures or consent required by law.</li>
              <li>Attempt to access other users&apos; data or accounts.</li>
              <li>Abuse, overload, or interfere with the Service or its infrastructure.</li>
              <li>Reverse engineer, resell, or sublicense the Service without written permission.</li>
              <li>Use the Service for any unlawful purpose.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-slate-900">7. Third-party services</h2>
            <p>
              The Service relies on third-party providers (including Vercel, MongoDB, Backblaze, Google, Meta,
              LinkedIn, X, and Reddit). We do not control and are not responsible for those services. Their
              availability may affect ours, and we are not liable for interruptions caused by them.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-slate-900">8. Disclaimers</h2>
            <p>
              The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind,
              whether express or implied, including fitness for a particular purpose. We do not guarantee that
              lead-scoring, attribution, or competitor analysis will produce any particular business outcome.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-slate-900">9. Limitation of liability</h2>
            <p>
              To the maximum extent permitted by law, we shall not be liable for indirect, incidental,
              consequential, or punitive damages, or for loss of profits, data, or goodwill, arising out of or
              relating to your use of the Service. Our total liability for any claim shall not exceed the
              amount you paid us in the 12 months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-slate-900">10. Termination</h2>
            <p>
              You may stop using the Service at any time and delete your account by contacting us. We may
              suspend or terminate accounts that violate these Terms. Upon termination, we will delete or
              anonymise your data within 30 days, except where retention is legally required.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-slate-900">11. Changes</h2>
            <p>
              We may update these Terms from time to time. Continued use of the Service after changes are posted
              constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-slate-900">12. Governing law</h2>
            <p>
              These Terms are governed by the laws of <span className="text-slate-700">INDIA</span>,
              without regard to conflict-of-law rules. Any disputes shall be subject to theexclusive jurisdiction of the courts of <span className="text-slate-700">Shikohabad</span>.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-slate-900">13. Contact</h2>
            <p>
              Questions? Email{" "}
              <a className="text-indigo-600 hover:underline" href="mailto:support@zyanix.xyz">support@zyanix.xyz</a>.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-slate-100 py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} MQLeads ·{" "}
        <Link href="/privacy" className="hover:underline">Privacy</Link> ·{" "}
        <Link href="/terms" className="hover:underline">Terms</Link>
      </footer>
    </div>
  );
}
