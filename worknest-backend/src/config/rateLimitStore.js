import path from "path";
import { createRequire } from "module";
import logger from "./logger.js";

const require = createRequire(import.meta.url);

const resolveFactory = () => {
  const configuredModule = process.env.RATE_LIMIT_STORE_MODULE?.trim();

  if (!configuredModule) {
    return null;
  }

  const moduleTarget = configuredModule.startsWith(".")
    ? path.resolve(process.cwd(), configuredModule)
    : configuredModule;

  try {
    const loadedModule = require(moduleTarget);
    const factory =
      loadedModule?.createRateLimitStore ||
      loadedModule?.default ||
      loadedModule;

    if (typeof factory !== "function") {
      throw new Error(
        "RATE_LIMIT_STORE_MODULE must export a store factory function",
      );
    }

    return factory;
  } catch (error) {
    logger.warn(
      "Shared rate-limit store is unavailable. Falling back to in-memory limits.",
      {
        moduleTarget,
        error: error instanceof Error ? error.message : String(error),
      },
    );
    return null;
  }
};

const rateLimitStoreFactory = resolveFactory();

export const getSharedRateLimitStore = (options = {}) => {
  if (!rateLimitStoreFactory) {
    return undefined;
  }

  return rateLimitStoreFactory(options);
};

export const hasSharedRateLimitStore = () => Boolean(rateLimitStoreFactory);
