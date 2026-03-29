import mongoose from "mongoose";

export const withMongoTransaction = async (work, options = {}) => {
  const session = await mongoose.startSession();

  try {
    let result;

    await session.withTransaction(async () => {
      result = await work(session);
    }, options);

    return result;
  } finally {
    await session.endSession();
  }
};
