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
  { Icon: Stethoscope, label: "Healthcare & clinics" },
  { Icon: Pill, label: "Pharmacy & medical stores" },
  { Icon: Store, label: "Retail & shops" },
  { Icon: Hotel, label: "Hotels & hospitality" },
  { Icon: Factory, label: "Manufacturing" },
  { Icon: Truck, label: "Logistics & distribution" },
  { Icon: GraduationCap, label: "Education & institutes" },
  { Icon: Briefcase, label: "Professional services" },
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
        {INDUSTRIES.map(({ Icon, label }, index) => (
          <Reveal key={label} delay={index * 40} className="h-full">
            <div className="group card-3d flex h-full items-center gap-3.5 rounded-2xl p-4">
              <span aria-hidden="true" className="icon-tile relative z-10 h-11 w-11 shrink-0">
                <Icon className="h-5 w-5" />
              </span>
              <p className="relative z-10 min-w-0 text-sm font-semibold text-ink">{label}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
