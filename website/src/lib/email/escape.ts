/**
 * HTML escaping for email bodies. Form values are untrusted: without this,
 * a name like <script>alert(1)</script> would inject markup into the email.
 */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Header-injection defence: newlines in a value used near SMTP headers
 * could inject extra recipients or headers. Strips them entirely.
 */
export function stripHeaderBreaks(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}
