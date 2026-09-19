/** Display only known, local copy; never echo provider/query text into login feedback. */
export function loginErrorMessage(code?: string): string | undefined {
  if (!code) return undefined;
  switch (code) {
    case "oauth_callback":
      return "Google sign-in could not be completed. Please try again.";
    case "invalid_email_link":
      return "This email link is invalid or expired. Request a new link and try again.";
    default:
      return "Sign-in could not be completed. Please try again or request a new recovery link.";
  }
}
