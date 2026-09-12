/** Sandbox and preview deployments must never compete with the published site. */
export function isPreviewDeployment(): boolean {
  return process.env.VERCEL_ENV === "preview" || Boolean(process.env.BASE44_PUBLIC_HOST_SUFFIX);
}
