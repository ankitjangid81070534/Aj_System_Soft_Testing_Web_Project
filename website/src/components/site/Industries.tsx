import Link from "next/link";
import {
  Briefcase,
  Factory,
  GraduationCap,
  Hotel,
  Pill,
  Stethoscope,
  Store,
  Truck,
} from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/site/Reveal";

const INDUSTRIES = [
  { Icon: Stethoscope, label: "Healthcare & clinics", workflow: "Appointments, patient records and billing" },
  { Icon: Pill, label: "Pharmacy & medical stores", workflow: "Medicine batches, expiry tracking and counter billing" },
  { Icon: Store, label: "Retail & shops", workflow: "Point of sale, stock, returns and daily closing" },
  { Icon: Hotel, label: "Hotels & hospitality", workflow: "Room availability, check-ins and housekeeping" },
  { Icon: Factory, label: "Manufacturing", workflow: "Purchasing, inventory and operational reporting" },
  { Icon: Truck, label: "Logistics & distribution", workflow: "Orders, dispatch workflows and system integrations" },
  { Icon: GraduationCap, label: "Education & institutes", workflow: "Browser-based portals, records and staff workflows" },
  { Icon: Briefcase, label: "Professional services", workflow: "Customer portals, follow-ups and internal tools" },
] as const;

export function Industries() {
  return (
    <section data-home-section="industries" className="relative mx-auto w-full max-w-content px-4 py-16 sm:px-6 sm:py-24">
      <div
        aria-hidden="true"
        className="aurora aurora-c -right-40 top-10 -z-10 hidden h-96 w-96 lg:block"
      />
      <Reveal>
        <SectionHeader
          eyebrow="Industries"
          title="Software for the way your industry works"
          description="Every trade has its own rules, documents and workflows. We build around them."
          align="center"
        />
      </Reveal>
      <div data-section-grid className="mt-12 grid grid-cols-1 gap-3.5 min-[360px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
        {INDUSTRIES.map(({ Icon, label, workflow }, index) => (
          <Reveal key={label} delay={index * 40} className="h-full">
            <div className="group card-3d flex h-full items-center gap-3.5 rounded-2xl p-4">
              <span aria-hidden="true" className="icon-tile relative z-10 h-11 w-11 shrink-0">
                <Icon className="h-5 w-5" />
              </span>
              <div className="relative z-10 min-w-0">
                <h3 className="text-sm font-semibold leading-relaxed text-ink">{label}</h3>
                <span className="mt-1 block text-sm leading-relaxed text-ink-muted">{workflow}</span>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
      <div className="mt-6 text-center">
        <p className="text-sm leading-relaxed text-ink-muted">
          Workflow examples to discuss—not a list of completed projects or a compliance certification.
          Scope, integrations and data requirements are agreed for your business.
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-x-6 gap-y-2">
          <Link href="/services#service-matcher" className="inline-flex min-h-11 items-center rounded-lg text-sm font-semibold text-brand-700 underline underline-offset-4 focus-ring dark:text-brand-400">
            Find a relevant service
          </Link>
          <Link href="/services#solution-comparison" className="inline-flex min-h-11 items-center rounded-lg text-sm font-semibold text-brand-700 underline underline-offset-4 focus-ring dark:text-brand-400">
            Compare solution approaches
          </Link>
        </div>
      </div>
    </section>
  );
}
