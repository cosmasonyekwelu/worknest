const emitClientLogEvent = (detail) => {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent("worknest:client-log", {
      detail,
    }),
  );
};

const serializeError = (error) => ({
  message: error?.message || "Unknown client error",
  status: error?.response?.status,
  response: error?.response?.data,
});

const logInDevelopment = (level, message, detail) => {
  if (!import.meta.env.DEV) {
    return;
  }

  const logger = console[level] || console.error;
  logger(message, detail);
};

export const reportClientError = (event, error, context = {}) => {
  const detail = {
    level: "error",
    event,
    context,
    error: serializeError(error),
  };

  logInDevelopment("error", `[client-error] ${event}`, detail);
  emitClientLogEvent(detail);
};

export const reportClientWarning = (event, context = {}) => {
  const detail = {
    level: "warn",
    event,
    context,
  };

  logInDevelopment("warn", `[client-warn] ${event}`, detail);
  emitClientLogEvent(detail);
};
