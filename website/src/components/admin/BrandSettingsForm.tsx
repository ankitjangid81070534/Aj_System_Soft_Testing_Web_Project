"use client";

import { useActionState, useEffect, useRef } from "react";
import { Field, Input, Textarea } from "@/components/ui/Input";
import { AdminSubmitButton } from "@/components/admin/AdminSubmitButton";
import { useToast } from "@/components/ui/Toast";
import { updateSettingsAction, type SettingsState } from "@/lib/admin/settings-actions";

const initialState: SettingsState = { ok: null };

export type BrandSettingsValues = {
  brand_name: string;
  brand_short_name: string;
  tagline: string;
  company_legal_name: string;
  business_hours: string;
  contact_email: string;
  support_email: string;
  phone: string;
  whatsapp: string;
  address_line: string;
  map_url: string;
  global_cta_label: string;
  global_cta_href: string;
  company_description: string;
};

function ErrorText({ id, message }: { id: string; message?: string }) {
  return message ? (
    <p id={id} className="mt-1.5 text-xs text-danger">
      {message}
    </p>
  ) : null;
}

export function BrandSettingsForm({ initial }: { initial: BrandSettingsValues }) {
  const [state, formAction] = useActionState(updateSettingsAction, initialState);
  const dirtyRef = useRef(false);
  const { toast } = useToast();
  const error = (name: keyof BrandSettingsValues) =>
    state.ok === false ? state.fieldErrors?.[name]?.[0] : undefined;

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (dirtyRef.current) event.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  useEffect(() => {
    if (state.ok === true) {
      dirtyRef.current = false;
      toast({ title: state.message ?? "Settings saved", variant: "success" });
    } else if (state.ok === false && state.message) {
      toast({ title: state.message, variant: "error" });
    }
  }, [state, toast]);

  const inputA11y = (name: keyof BrandSettingsValues) => ({
    "aria-invalid": Boolean(error(name)),
    "aria-describedby": error(name) ? `s-${name}-error` : undefined,
  });

  return (
    <form
      action={formAction}
      onChange={() => {
        dirtyRef.current = true;
      }}
      className="mt-5 grid max-w-4xl gap-4 rounded-2xl border border-line bg-surface p-6 shadow-e2 sm:grid-cols-2"
    >
      <Field label="Brand name" htmlFor="s-brand_name">
        <Input
          id="s-brand_name"
          name="brand_name"
          defaultValue={initial.brand_name}
          maxLength={120}
          {...inputA11y("brand_name")}
        />
      </Field>
      <Field label="Short brand name" htmlFor="s-brand_short_name">
        <Input
          id="s-brand_short_name"
          name="brand_short_name"
          defaultValue={initial.brand_short_name}
          maxLength={60}
          {...inputA11y("brand_short_name")}
        />
      </Field>
      <Field label="Tagline" htmlFor="s-tagline">
        <Input
          id="s-tagline"
          name="tagline"
          defaultValue={initial.tagline}
          maxLength={200}
          {...inputA11y("tagline")}
        />
      </Field>
      <Field label="Business hours" htmlFor="s-business_hours">
        <Input
          id="s-business_hours"
          name="business_hours"
          defaultValue={initial.business_hours}
          maxLength={160}
          {...inputA11y("business_hours")}
        />
      </Field>
      <Field label="Contact email" htmlFor="s-contact_email">
        <Input
          id="s-contact_email"
          name="contact_email"
          type="email"
          defaultValue={initial.contact_email}
          maxLength={200}
          {...inputA11y("contact_email")}
        />
        <ErrorText id="s-contact_email-error" message={error("contact_email")} />
      </Field>
      <Field label="Support email (optional)" htmlFor="s-support_email">
        <Input
          id="s-support_email"
          name="support_email"
          type="email"
          defaultValue={initial.support_email}
          maxLength={200}
          {...inputA11y("support_email")}
        />
        <ErrorText id="s-support_email-error" message={error("support_email")} />
      </Field>
      <Field label="Phone" htmlFor="s-phone">
        <Input
          id="s-phone"
          name="phone"
          defaultValue={initial.phone}
          maxLength={20}
          {...inputA11y("phone")}
        />
      </Field>
      <Field
        label="WhatsApp number"
        htmlFor="s-whatsapp"
        hint="Enables the WhatsApp CTA on the contact page."
      >
        <Input
          id="s-whatsapp"
          name="whatsapp"
          defaultValue={initial.whatsapp}
          maxLength={20}
          {...inputA11y("whatsapp")}
        />
      </Field>
      <Field label="Address line" htmlFor="s-address_line">
        <Input
          id="s-address_line"
          name="address_line"
          defaultValue={initial.address_line}
          maxLength={300}
          {...inputA11y("address_line")}
        />
      </Field>
      <Field label="Map link" htmlFor="s-map_url">
        <Input
          id="s-map_url"
          name="map_url"
          defaultValue={initial.map_url}
          maxLength={500}
          {...inputA11y("map_url")}
        />
        <ErrorText id="s-map_url-error" message={error("map_url")} />
      </Field>
      <Field label="Global CTA label" htmlFor="s-global_cta_label">
        <Input
          id="s-global_cta_label"
          name="global_cta_label"
          defaultValue={initial.global_cta_label}
          maxLength={60}
          {...inputA11y("global_cta_label")}
        />
      </Field>
      <Field label="Global CTA link" htmlFor="s-global_cta_href">
        <Input
          id="s-global_cta_href"
          name="global_cta_href"
          defaultValue={initial.global_cta_href}
          maxLength={200}
          {...inputA11y("global_cta_href")}
        />
        <ErrorText id="s-global_cta_href-error" message={error("global_cta_href")} />
      </Field>
      <div className="sm:col-span-2">
        <Field label="Company description" htmlFor="s-company_description">
          <Textarea
            id="s-company_description"
            name="company_description"
            rows={3}
            defaultValue={initial.company_description}
            maxLength={1000}
            {...inputA11y("company_description")}
          />
        </Field>
      </div>
      <Field label="Company legal name" htmlFor="s-company_legal_name">
        <Input
          id="s-company_legal_name"
          name="company_legal_name"
          defaultValue={initial.company_legal_name}
          maxLength={120}
          {...inputA11y("company_legal_name")}
        />
      </Field>
      <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
        <AdminSubmitButton idleLabel="Save settings" pendingLabel="Saving settings…" />
        {state.ok === true ? (
          <p role="status" className="text-sm text-success">
            {state.message}
          </p>
        ) : null}
        {state.ok === false ? (
          <p role="alert" className="text-sm text-danger">
            {state.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
