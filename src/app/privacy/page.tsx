import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = { title: "Privacy Policy" };

const lastUpdated = "August 2026";

export default function PrivacyPage() {
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
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Privacy Policy</h1>
        <p className="mt-2 text-sm text-slate-500">
          <b>MQLeads</b> (operated by <span className="text-slate-700">ZYANIX</span>, hereinafter
          &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) — Last updated: {lastUpdated}
        </p>

        <div className="prose-sm mt-8 space-y-8 text-slate-700">
          <section>
            <h2 className="mb-2 text-lg font-semibold text-slate-900">1. Overview</h2>
            <p>
              MQLeads is a lead-generation and visitor-intelligence platform. This policy explains what data we
              collect, why we collect it, how it is used, and the choices you have. By creating an account or
              using our services, you agree to the practices described here.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-slate-900">2. Data we collect</h2>
            <h3 className="mt-4 font-semibold text-slate-900">a) Account &amp; company information</h3>
            <p>
              When you register we collect your name, email address, company/agency name, and a hashed password.
              In your settings you may optionally provide further company information (description, website,
              industry, contact details, logo, and links to your social profiles).
            </p>
            <h3 className="mt-4 font-semibold text-slate-900">b) Connected account information</h3>
            <p>
              When you connect LinkedIn, Instagram, X/Twitter, YouTube, Facebook, Reddit or Google Search
              Console, we receive from those platforms the basic profile/page identifiers you chose to connect
              (account ID, account name, and public profile URL). Access tokens and refresh tokens are stored
              <b> encrypted at rest (AES-256-GCM)</b> and are used only to communicate with those platforms on
              your behalf. We never publish or sell your tokens.
            </p>
            <h3 className="mt-4 font-semibold text-slate-900">c) Visitor tracking data (sites that use our script)</h3>
            <p>
              If you add our tracking script to your own website, we collect visitor event data on your behalf:
              pages visited, referrer URL, UTM campaign parameters, browser/device type, operating system,
              locale, timezone, screen size, time spent on pages, and outbound link clicks. Where the referrer
              contains a public profile handle (for example <code className="rounded bg-slate-100 px-1">linkedin.com/in/name</code>),
              we record that handle. We do <b>not</b> collect IP addresses or use fingerprinting.
            </p>
            <h3 className="mt-4 font-semibold text-slate-900">d) Usage &amp; technical data</h3>
            <p>
              Our hosting provider (Vercel) and database provider (MongoDB) may process standard technical logs
              (request paths, response codes, timestamps) for security and reliability.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-slate-900">3. How we use your data</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>To provide and operate the platform (dashboard, leads, competitor analysis, tracking).</li>
              <li>To attribute site visitors to the social source they came from and score lead intent.</li>
              <li>To sync search queries from Google Search Console on your instruction.</li>
              <li>To process your requests (e.g. auto-fill company info from public web sources).</li>
              <li>To communicate service updates and respond to support requests.</li>
              <li>To maintain security and prevent abuse.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-slate-900">4. Who we share data with</h2>
            <p>We do not sell your personal data. We share data only with the following categories of processors, strictly to operate the service:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li><b>Hosting:</b> Vercel Inc. (application hosting).</li>
              <li><b>Database:</b> MongoDB, Inc. (Atlas — data storage).</li>
              <li><b>File storage:</b> Backblaze, Inc. (B2 — logo/asset uploads, only when configured).</li>
              <li><b>Platform APIs:</b> Google, LinkedIn, Meta (Facebook/Instagram), X, and Reddit — only for the OAuth connections you explicitly authorize.</li>
            </ul>
            <p className="mt-2">
              We may also disclose data where required by law, or to protect the rights, property, or safety of
              our users or the public.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-slate-900">5. Website owners using our tracking script</h2>
            <p>
              When you embed <code className="rounded bg-slate-100 px-1">mqleads.js</code> on your website, you are the
              <b> controller</b> of your visitors&apos; data and we act as a <b>processor</b>. You are responsible for:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Informing visitors that your site uses analytics/lead tracking.</li>
              <li>Complying with consent requirements that apply in your jurisdiction (e.g. GDPR, DPDP Act 2023, or equivalent).</li>
              <li>Not tracking sensitive personal data (health, religion, political opinions, etc.).</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-slate-900">6. Data retention</h2>
            <p>
              We retain your account and company data for as long as your account is active. Visitor event data is
              retained until you delete the corresponding site connection or your account. If you delete your
              account, we delete (or anonymise) your data within 30 days, except where we are legally required to
              retain it.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-slate-900">7. Security</h2>
            <p>
              We use HTTPS everywhere, encrypt OAuth tokens at rest (AES-256-GCM), hash passwords with bcrypt,
              and sign session cookies with a secret key. Access to production data is limited to the operators
              of this service. No system is 100% secure — you use the service at your own risk and should keep
              your login credentials safe.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-slate-900">8. Your rights</h2>
            <p>Depending on your jurisdiction (including under the GDPR and India&apos;s DPDP Act 2023), you may have the right to:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Access the personal data we hold about you.</li>
              <li>Correct inaccurate data.</li>
              <li>Request deletion of your data.</li>
              <li>Receive a copy of your data in a portable format.</li>
              <li>Withdraw consent for a connected source at any time (via Sources or by disconnecting).</li>
              <li>Lodge a complaint with a supervisory authority.</li>
            </ul>
            <p className="mt-2">
              To exercise any of these rights, email us at{" "}
              <a className="text-indigo-600 hover:underline" href="mailto:support@zyanix.xyz">support@zyanix.xyz</a>{" "}
              (or the contact email shown on our site). We respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-slate-900">9. Cookies &amp; storage</h2>
            <p>
              Our own application sets a secure session cookie to keep you logged in. Our tracking script uses
              the visitor&apos;s browser localStorage only to maintain a stable visitor identifier for the site it is
              installed on. We do not use advertising cookies.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-slate-900">10. Children</h2>
            <p>MQLeads is not directed at children under 16, and we do not knowingly collect data from children.</p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-slate-900">11. Changes to this policy</h2>
            <p>
              We may update this policy from time to time. Material changes will be announced on this page with
              an updated date. Continued use of the service after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-slate-900">12. Contact</h2>
            <p>
              Questions about this policy? Contact us at{" "}
              <a className="text-indigo-600 hover:underline" href="mailto:support@zyanix.xyz">support@zyanix.xyz</a>{" "}
              or write to <span className="text-slate-700">ZYANIX, Shikohabad, Uttar Pradesh, INDIA</span>.
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
