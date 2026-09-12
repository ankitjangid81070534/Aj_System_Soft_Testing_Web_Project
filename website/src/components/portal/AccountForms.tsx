"use client";

import { useActionState } from "react";
import { Camera, Save, Send, Star } from "lucide-react";
import {
  completeProfileAction,
  submitVerifiedReviewAction,
  updateProfileAction,
  uploadAvatarAction,
  type PortalActionState,
} from "@/lib/portal/actions";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Input";
import { AddressFields } from "@/components/portal/AuthForms";
import { AgreementCheckbox } from "@/components/site/LeadForms";

import { PortalFeedback as FormFeedback } from "./PortalFeedback";
import styles from "./portal-ui.module.css";

const initialState: PortalActionState = { status: "idle" };

export type CompleteProfileDefaults = {
  fullName: string;
  username: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

/**
 * Shown to Google OAuth / legacy accounts until username, mobile, address and
 * the current Service Agreement acceptance are all on file.
 */
export function CompleteProfileForm({ defaults }: { defaults: CompleteProfileDefaults }) {
  const [state, action, pending] = useActionState(completeProfileAction, initialState);
  return (
    <form action={action} aria-busy={pending} className={`${styles.form} space-y-4`}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" htmlFor="complete-name" required>
          <Input
            id="complete-name"
            name="fullName"
            defaultValue={defaults.fullName}
            autoComplete="name"
            required
            maxLength={120}
          />
        </Field>
        <Field label="Username" htmlFor="complete-username" required>
          <Input
            id="complete-username"
            name="username"
            defaultValue={defaults.username}
            autoComplete="username"
            autoCapitalize="none"
            required
            minLength={3}
            maxLength={30}
            pattern="[A-Za-z0-9][A-Za-z0-9._-]*"
          />
        </Field>
      </div>
      <Field label="Mobile number" htmlFor="complete-phone" required>
        <Input
          id="complete-phone"
          name="phone"
          type="tel"
          inputMode="tel"
          defaultValue={defaults.phone}
          autoComplete="tel"
          required
          minLength={8}
          maxLength={20}
        />
      </Field>
      <AddressFields prefix="complete" defaults={defaults} />
      <AgreementCheckbox id="complete-agreement" />
      <FormFeedback state={state} focusOnError />
      <Button type="submit" size="sm" loading={pending}>
        <Save aria-hidden="true" className="h-4 w-4" />
        {pending ? "Saving…" : "Complete profile"}
      </Button>
    </form>
  );
}

export function ProfileForm({
  fullName,
  phone,
  company,
}: {
  fullName: string;
  phone: string;
  company: string;
}) {
  const [state, action, pending] = useActionState(updateProfileAction, initialState);
  return (
    <form action={action} aria-busy={pending} className={`${styles.form} space-y-4`}>
      <Field label="Full name" htmlFor="profile-name" required>
        <Input
          id="profile-name"
          name="fullName"
          defaultValue={fullName}
          autoComplete="name"
          required
          maxLength={120}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Phone" htmlFor="profile-phone">
          <Input
            id="profile-phone"
            name="phone"
            type="tel"
            defaultValue={phone}
            autoComplete="tel"
            maxLength={20}
          />
        </Field>
        <Field label="Company" htmlFor="profile-company">
          <Input
            id="profile-company"
            name="company"
            defaultValue={company}
            autoComplete="organization"
            maxLength={160}
          />
        </Field>
      </div>
      <FormFeedback state={state} focusOnError />
      <Button type="submit" size="sm" loading={pending}>
        <Save aria-hidden="true" className="h-4 w-4" />
        {pending ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
}

export function AvatarForm() {
  const [state, action, pending] = useActionState(uploadAvatarAction, initialState);
  return (
    <form action={action} aria-busy={pending} className={`${styles.form} space-y-3`}>
      <Field
        label="Profile photo"
        htmlFor="profile-avatar"
        hint="JPG, PNG, WebP or AVIF · maximum 3 MB"
      >
        <input
          id="profile-avatar"
          name="avatar"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          required
          className="focus-ring block min-w-0 w-full rounded-xl border border-line bg-canvas px-3 py-2 text-xs text-ink-muted file:mr-3 file:rounded-full file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-brand-700"
        />
      </Field>
      <FormFeedback state={state} focusOnError />
      <Button type="submit" size="sm" variant="secondary" loading={pending}>
        <Camera aria-hidden="true" className="h-4 w-4" />
        {pending ? "Uploading…" : "Update photo"}
      </Button>
    </form>
  );
}

export function ReviewForm({ projects }: { projects: { id: string; name: string }[] }) {
  const [state, action, pending] = useActionState(submitVerifiedReviewAction, initialState);
  return (
    <form action={action} aria-busy={pending} className={`${styles.form} space-y-4`}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Rating" htmlFor="review-rating" required>
          <Select id="review-rating" name="rating" defaultValue="5" required>
            {[5, 4, 3, 2, 1].map((rating) => (
              <option key={rating} value={rating}>
                {rating} / 5
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Project (optional)" htmlFor="review-project">
          <Select id="review-project" name="projectId" defaultValue="">
            <option value="">General engagement</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label="Review title" htmlFor="review-title" required>
        <Input
          id="review-title"
          name="title"
          required
          minLength={3}
          maxLength={120}
          placeholder="What stood out?"
        />
      </Field>
      <Field
        label="Your experience"
        htmlFor="review-text"
        required
        hint="Your review stays private until an administrator approves it."
      >
        <Textarea
          id="review-text"
          name="reviewText"
          required
          minLength={20}
          maxLength={2000}
          rows={5}
        />
      </Field>
      <FormFeedback state={state} focusOnError />
      <Button type="submit" loading={pending}>
        <Star aria-hidden="true" className="h-4 w-4" />
        {pending ? "Submitting…" : "Post review"}
        {!pending ? <Send aria-hidden="true" className="h-4 w-4" /> : null}
      </Button>
    </form>
  );
}
