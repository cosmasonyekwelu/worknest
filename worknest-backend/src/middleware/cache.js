import logger from "../config/logger.js";
import { cacheStore, hasSharedCacheStore } from "../config/cacheStore.js";

export const cacheMiddleware =
  (key, ttl = 600) =>
  async (req, res, next) => {
    const userId = req.user?._id?.toString?.() || req.user?.id || "anonymous";
    const cacheKey = `user_${userId}_${key}_${req.originalUrl}_${JSON.stringify(req.query)}`;

    try {
      const cachedData = await cacheStore.get(cacheKey);
      if (cachedData) {
        logger.debug("Cache hit", {
          cacheKey,
          store: hasSharedCacheStore() ? "shared" : "memory",
        });
        return res.json(cachedData);
      }

      const originalJSON = res.json;
      res.json = function (data) {
        Promise.resolve(cacheStore.set(cacheKey, data, ttl)).catch((cacheError) => {
          logger.warn("Cache set failed", {
            cacheKey,
            error: cacheError instanceof Error ? cacheError.message : String(cacheError),
          });
        });
        logger.debug("Cache set", {
          cacheKey,
          ttl,
          store: hasSharedCacheStore() ? "shared" : "memory",
        });
        return originalJSON.call(this, data);
      };

      return next();
    } catch (error) {
      logger.error("Cache error", { error: error.message });
      return next(error);
    }
  };

export const clearCache =
  (pattern = null, clearAll = false) =>
  async (req, res, next) => {
    const keys = await cacheStore.keys();

    if (clearAll) {
      await Promise.all(keys.map((key) => cacheStore.del(key)));
      logger.info("Cleared all cache entries", {
        store: hasSharedCacheStore() ? "shared" : "memory",
      });
      return next();
    }

    const userId = req.user?._id?.toString?.() || req.user?.id || "";
    const userPrefix = userId ? `user_${userId}_` : "";

    const matchingKeys = pattern
      ? keys.filter((key) => {
          if (userId) return key.includes(userPrefix) && key.includes(pattern);
          return key.includes(pattern);
        })
      : keys;

    await Promise.all(matchingKeys.map((key) => cacheStore.del(key)));
    logger.info("Cleared cache entries", {
      count: matchingKeys.length,
      userId: userId || null,
      pattern,
      store: hasSharedCacheStore() ? "shared" : "memory",
    });

    return next();
  };
