// Copied from /columbus-ai:components/Footer.tsx (Phase 0 UI shell only)

import Link from "next/link";
import {
  SITE_NAME,
  FOOTER_PRODUCT_LINKS,
  FOOTER_LEGAL_LINKS,
  CONTACT_EMAIL,
  CONTACT_PHONE,
} from "@/lib/constants";

const FOOTER_TAGLINE =
  "AI automation that streamlines your workflows.";
const BOTTOM_TAGLINE =
  "Streamline workflows with intelligent automation.";
const year = new Date().getFullYear();

const linkClass =
  "text-sm text-gray-300 hover:text-white transition-colors underline-offset-4 hover:underline";

export default function Footer() {
  const hasContact = CONTACT_EMAIL || CONTACT_PHONE;

  return (
    <footer className="bg-[#1E1E28] text-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Company */}
          <div className="space-y-3">
            <Link
              href="/"
              className="text-lg font-bold text-white no-underline hover:text-white"
            >
              {SITE_NAME}
            </Link>
            <p className="text-sm text-gray-300 max-w-xs">
              {FOOTER_TAGLINE}
            </p>
          </div>

          {/* Column 2: Product */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-white">
              Product
            </h3>
            <ul className="list-none space-y-2 pl-0">
              {FOOTER_PRODUCT_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className={linkClass}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-white">
              Contact
            </h3>
            {hasContact ? (
              <ul className="list-none space-y-1 pl-0 text-sm text-gray-300">
                {CONTACT_EMAIL ? (
                  <li>
                    <a
                      href={`mailto:${CONTACT_EMAIL}`}
                      className={linkClass}
                    >
                      {CONTACT_EMAIL}
                    </a>
                  </li>
                ) : null}
                {CONTACT_PHONE ? (
                  <li>
                    <a href={`tel:${CONTACT_PHONE}`} className={linkClass}>
                      {CONTACT_PHONE}
                    </a>
                  </li>
                ) : null}
              </ul>
            ) : (
              <p className="text-sm text-gray-300">
                <Link href="/#cta" className={linkClass}>
                  Request Demo
                </Link>
              </p>
            )}
          </div>

          {/* Column 4: Legal */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-white">
              Legal
            </h3>
            <ul className="list-none space-y-2 pl-0">
              {FOOTER_LEGAL_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className={linkClass}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-gray-700 pt-8">
          <p className="text-center text-sm text-gray-400">
            © {year} {SITE_NAME}. All rights reserved. {BOTTOM_TAGLINE}
          </p>
        </div>
      </div>
    </footer>
  );
}
