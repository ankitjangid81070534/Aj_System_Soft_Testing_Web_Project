import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { ContactForm, AppointmentForm } from "@/components/site/LeadForms";
import { buildRouteMetadata } from "@/lib/seo/metadata";
import { getSiteSettings, whatsappLink } from "@/lib/data/settings";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, contactPageJsonLd, localBusinessJsonLd } from "@/lib/seo/jsonld";

// Forms and settings are per-request; the spam time-trap needs a fresh stamp.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildRouteMetadata({
    title: "Contact Us",
    description:
      "Contact AJ System Soft Technology to discuss your software project — message us, request a consultation, or reach us on WhatsApp.",
    path: "/contact",
  });
}

export default async function ContactPage() {
  // eslint-disable-next-line react-hooks/purity -- server-rendered per request; the timestamp feeds the spam time-trap
  const startedAt = Date.now();
  const settings = await getSiteSettings();
  const whatsapp = whatsappLink(settings);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ])}
      />
      <JsonLd
        data={contactPageJsonLd({
          description:
            "Contact AJ System Soft Technology to discuss your software project — message us, request a consultation, or reach us on WhatsApp.",
        })}
      />
      <JsonLd
        data={localBusinessJsonLd({
          contactEmail: settings?.contactEmail,
          phone: settings?.phone,
          addressLine: settings?.addressLine,
          businessHours: settings?.businessHours,
          mapUrl: settings?.mapUrl,
          sameAs: settings?.socialLinks.map((link) => link.url),
        })}
      />

      <div className="mx-auto w-full max-w-content px-4 py-10 sm:px-6 sm:py-14">
        <Breadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Contact", href: "/contact" },
          ]}
        />
        <div className="mt-6 max-w-3xl">
          <SectionHeader
            as="h1"
            eyebrow="Contact"
            title="Tell us what you need built"
            description="Send a message, request a consultation, or reach us directly — every genuine enquiry gets a reply."
          />
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.6fr_1fr] lg:items-start">
          <div className="rounded-3xl border border-line bg-surface p-6 shadow-e1 sm:p-8">
            <h2 className="text-lg font-semibold tracking-tight text-ink">Send a message</h2>
            <p className="mt-1 mb-6 text-sm text-ink-muted">
              Brief is fine — we will ask the right follow-up questions.
            </p>
            <ContactForm startedAt={startedAt} />
          </div>

          <aside className="flex flex-col gap-4">
            <div className="rounded-2xl border border-line bg-surface p-5 shadow-e1">
              <h2 className="text-sm font-semibold text-ink">Direct contact</h2>
              <ul className="mt-3 flex flex-col gap-3 text-sm">
                {settings?.contactEmail ? (
                  <li className="flex items-center gap-2.5">
                    <Mail aria-hidden="true" className="h-4 w-4 shrink-0 text-brand-600" />
                    <a
                      href={`mailto:${settings.contactEmail}`}
                      className="text-ink-soft hover:text-ink focus-ring rounded-sm"
                    >
                      {settings.contactEmail}
                    </a>
                  </li>
                ) : null}
                {settings?.phone ? (
                  <li className="flex items-center gap-2.5">
                    <Phone aria-hidden="true" className="h-4 w-4 shrink-0 text-brand-600" />
                    <a
                      href={`tel:${settings.phone.replace(/[^+0-9]/g, "")}`}
                      className="text-ink-soft hover:text-ink focus-ring rounded-sm"
                    >
                      {settings.phone}
                    </a>
                  </li>
                ) : null}
                {settings?.businessHours ? (
                  <li className="flex items-center gap-2.5">
                    <Clock aria-hidden="true" className="h-4 w-4 shrink-0 text-brand-600" />
                    <span className="text-ink-soft">{settings.businessHours}</span>
                  </li>
                ) : null}
                {settings?.addressLine ? (
                  <li className="flex items-start gap-2.5">
                    <MapPin aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                    <span className="text-ink-soft">
                      {settings.addressLine}
                      {settings.mapUrl ? (
                        <>
                          {" · "}
                          <a
                            href={settings.mapUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-brand-600 hover:text-brand-700 focus-ring rounded-sm"
                          >
                            View map
                          </a>
                        </>
                      ) : null}
                    </span>
                  </li>
                ) : null}
              </ul>
              {whatsapp ? (
                <Button href={whatsapp} variant="outline" className="mt-4 w-full">
                  <MessageCircle aria-hidden="true" className="h-4 w-4" />
                  Chat on WhatsApp
                </Button>
              ) : null}
              {!settings ? (
                <p className="mt-3 text-xs text-ink-muted">
                  Direct contact details are managed from the admin panel and appear here once
                  configured.
                </p>
              ) : null}
            </div>

            <div className="rounded-2xl border border-brand-100 bg-brand-50 p-5">
              <h2 className="text-sm font-semibold text-ink">Prefer a guided conversation?</h2>
              <p className="mt-1.5 text-sm text-ink-muted">
                Request a consultation slot and we will call you at a time that suits you.
              </p>
              <Button href="/request-quote" variant="secondary" className="mt-3">
                Request a quote instead
              </Button>
            </div>
          </aside>
        </div>

        <section
          className="mt-14 rounded-3xl border border-line bg-surface p-6 shadow-e1 sm:p-8"
          aria-labelledby="consultation"
        >
          <h2 id="consultation" className="text-lg font-semibold tracking-tight text-ink">
            Request a consultation
          </h2>
          <p className="mt-1 mb-6 text-sm text-ink-muted">
            Free 30-minute call to discuss your requirements and the possible approaches.
          </p>
          <AppointmentForm startedAt={startedAt} />
        </section>
      </div>
    </>
  );
}
