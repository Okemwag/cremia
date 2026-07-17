export type AuthIssue = {
  title: string;
  message: string;
};

type ErrorDetails = {
  error?: unknown;
  code?: unknown;
  name?: unknown;
  message?: unknown;
  error_description?: unknown;
  status?: unknown;
};

function details(error: unknown): ErrorDetails {
  return typeof error === "object" && error !== null ? error as ErrorDetails : {};
}

function errorText(error: unknown) {
  const value = details(error);
  return [value.error, value.code, value.name, value.message, value.error_description]
    .filter((item): item is string => typeof item === "string")
    .join(" ")
    .toLowerCase();
}

export function isSessionExpiredError(error: unknown) {
  const value = details(error);
  if (value.status === 401) return true;
  const text = errorText(error);
  return [
    "login_required",
    "missing_refresh_token",
    "invalid_grant",
    "invalid_token",
    "token expired",
    "consent_required",
  ].some((code) => text.includes(code));
}

export function authIssueFor(error: unknown): AuthIssue {
  const text = errorText(error);
  if (text.includes("access_denied") || text.includes("user cancelled")) {
    return {
      title: "Sign-in cancelled",
      message: "Nothing has changed on your account. Try again whenever you’re ready.",
    };
  }
  if (text.includes("missing_transaction") || text.includes("invalid state") || text.includes("invalid_state")) {
    return {
      title: "This sign-in link has expired",
      message: "Start again to open a fresh, secure sign-in page.",
    };
  }
  if (isSessionExpiredError(error)) {
    return {
      title: "Your session has ended",
      message: "Please sign in again to continue safely.",
    };
  }
  if (text.includes("timeout")) {
    return {
      title: "Sign-in took too long",
      message: "Check your connection and try again.",
    };
  }
  if (text.includes("unauthorized_client") || text.includes("invalid_configuration") || text.includes("not authorized")) {
    return {
      title: "Sign-in is temporarily unavailable",
      message: "Please try again later. If this continues, contact Synex support.",
    };
  }
  return {
    title: "We couldn’t sign you in",
    message: "Please try again. Your account remains secure.",
  };
}

export function loginNoticeFor(reason: string | null): AuthIssue | null {
  if (reason === "session-ended") {
    return {
      title: "Your session has ended",
      message: "Sign in again to return to your workspace.",
    };
  }
  if (reason === "retry") {
    return {
      title: "Ready to try again?",
      message: "Continue when you’re ready to reopen secure sign in.",
    };
  }
  return null;
}
