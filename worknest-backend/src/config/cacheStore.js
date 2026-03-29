import NodeCache from "node-cache";
import path from "path";
import { createRequire } from "module";
import logger from "./logger.js";

const require = createRequire(import.meta.url);

const memoryCache = new NodeCache({
  stdTTL: 3600,
  checkperiod: 620,
  useClones: false,
});

const wrapNodeCache = (nodeCache) => ({
  async get(key) {
    return nodeCache.get(key);
  },
  async set(key, value, ttl) {
    nodeCache.set(key, value, ttl);
  },
  async del(key) {
    nodeCache.del(key);
  },
  async keys() {
    return nodeCache.keys();
  },
});

const resolveFactory = () => {
  const configuredModule = process.env.CACHE_STORE_MODULE?.trim();

  if (!configuredModule) {
    return null;
  }

  const moduleTarget = configuredModule.startsWith(".")
    ? path.resolve(process.cwd(), configuredModule)
    : configuredModule;

  try {
    const loadedModule = require(moduleTarget);
    const factory =
      loadedModule?.createCacheStore ||
      loadedModule?.default ||
      loadedModule;

    if (typeof factory !== "function") {
      throw new Error(
        "CACHE_STORE_MODULE must export a cache store factory function",
      );
    }

    return factory;
  } catch (error) {
    logger.warn(
      "Shared cache store is unavailable. Falling back to in-memory cache.",
      {
        moduleTarget,
        error: error instanceof Error ? error.message : String(error),
      },
    );
    return null;
  }
};

const cacheStoreFactory = resolveFactory();

const validateStore = (store) => {
  if (!store) {
    return null;
  }

  const requiredMethods = ["get", "set", "del", "keys"];
  const missingMethods = requiredMethods.filter(
    (methodName) => typeof store[methodName] !== "function",
  );

  if (missingMethods.length) {
    logger.warn(
      "Shared cache store is missing required methods. Falling back to in-memory cache.",
      {
        missingMethods,
      },
    );
    return null;
  }

  return store;
};

const configuredStore = validateStore(
  cacheStoreFactory?.({
    namespace: "worknest-cache",
    defaultTtlSeconds: 3600,
  }),
);

export const cacheStore = configuredStore || wrapNodeCache(memoryCache);
export const hasSharedCacheStore = () => Boolean(configuredStore);
