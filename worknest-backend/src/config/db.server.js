import mongoose from "mongoose";
import logger from "./logger.js";

const dbConnection = {
  isConnected: false,
  retryCount: 0,
  maxRetries: 5,
  connectPromise: null,
  reconnectTimer: null,
  listenersRegistered: false,
  isShuttingDown: false,
  shutdownPromise: null,
};

export const isDatabaseReady = () => mongoose.connection?.readyState === 1;

const clearReconnectTimer = () => {
  if (dbConnection.reconnectTimer) {
    clearTimeout(dbConnection.reconnectTimer);
    dbConnection.reconnectTimer = null;
  }
};

const scheduleReconnect = () => {
  if (
    dbConnection.isShuttingDown ||
    dbConnection.reconnectTimer ||
    dbConnection.retryCount >= dbConnection.maxRetries
  ) {
    return;
  }

  dbConnection.retryCount++;
  logger.info(
    `MongoDB reconnect scheduled (${dbConnection.retryCount}/${dbConnection.maxRetries})`,
  );

  dbConnection.reconnectTimer = setTimeout(() => {
    dbConnection.reconnectTimer = null;
    connectToDB().catch(() => null);
  }, 5000);
};

const registerConnectionListeners = () => {
  if (dbConnection.listenersRegistered) {
    return;
  }

  mongoose.connection.on("error", (error) => {
    logger.error("MongoDB connection error", {
      error: error instanceof Error ? error.message : String(error),
    });
    dbConnection.isConnected = false;
  });

  mongoose.connection.on("disconnected", () => {
    logger.info("MongoDB disconnected");
    dbConnection.isConnected = false;

    if (!dbConnection.isShuttingDown) {
      scheduleReconnect();
    }
  });

  dbConnection.listenersRegistered = true;
};

export const connectToDB = async () => {
  if (dbConnection.isShuttingDown) {
    return null;
  }

  if (dbConnection.isConnected || mongoose.connection.readyState === 1) {
    dbConnection.isConnected = true;
    logger.info("Using existing MongoDB connection");
    return mongoose.connection;
  }

  if (dbConnection.connectPromise) {
    return dbConnection.connectPromise;
  }

  if (dbConnection.retryCount >= dbConnection.maxRetries) {
    logger.error("Max MongoDB connection retries reached");
    process.exit(1);
  }

  const connectionOptions = {
    dbName: process.env.DATABASE_NAME,
    serverSelectionTimeoutMS: 45000,
    socketTimeoutMS: 5000,
    retryWrites: true,
    retryReads: true,
    maxPoolSize: 50,
    minPoolSize: 1,
    monitorCommands: process.env.NODE_ENV === "development",
  };

  dbConnection.connectPromise = mongoose
    .connect(process.env.MONGO_URI, connectionOptions)
    .then((conn) => {
      dbConnection.isConnected = conn.connections[0].readyState === 1;
      dbConnection.retryCount = 0;
      clearReconnectTimer();
      registerConnectionListeners();

      if (dbConnection.isConnected) {
        logger.info(`MongoDB Connected: ${conn.connection.host}`);
      }

      return conn;
    })
    .catch((error) => {
      dbConnection.isConnected = false;

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      logger.error(
        `MongoDB connection failed (attempt ${dbConnection.retryCount + 1}/${dbConnection.maxRetries})`,
        { error: errorMessage },
      );

      if (!dbConnection.isShuttingDown) {
        scheduleReconnect();
      } else {
        dbConnection.retryCount++;
      }

      if (dbConnection.retryCount >= dbConnection.maxRetries) {
        logger.error("Max retries reached. Exiting.");
        process.exit(1);
      }

      throw error;
    })
    .finally(() => {
      dbConnection.connectPromise = null;
    });

  return dbConnection.connectPromise;
};

export const gracefulShutdown = async (server = null) => {
  if (dbConnection.shutdownPromise) {
    return dbConnection.shutdownPromise;
  }

  dbConnection.shutdownPromise = (async () => {
    dbConnection.isShuttingDown = true;
    clearReconnectTimer();
    logger.info("Received shutdown signal. Closing server...");

    if (server?.listening) {
      await new Promise((resolve) => {
        server.close(() => {
          logger.info("HTTP server closed");
          resolve();
        });
      });
    }

    if (mongoose.connection && mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      logger.info("MongoDB connection closed");
    }

    logger.info("Server shutdown complete");
  })();

  return dbConnection.shutdownPromise;
};

process.once("uncaughtException", (error) => {
  logger.error("UNCAUGHT EXCEPTION! Shutting down...");
  logger.error(error.name || "Error", error.message || "Unknown error");
  if (error.stack) {
    logger.error(error.stack);
  }

  gracefulShutdown()
    .catch(() => null)
    .finally(() => process.exit(1));
});

connectToDB().catch(() => null);
