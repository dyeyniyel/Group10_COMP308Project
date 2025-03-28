import dotenv from "dotenv";
dotenv.config();
export const config = {
  db:
    process.env.COMMUNITY_MONGO_URI ||
    "mongodb://localhost:27017/communityServiceDB_Group10",
  JWT_SECRET: process.env.JWT_SECRET || "fallback_secret",
  port: process.env.COMMUNITY_PORT || 4002,
};

if (process.env.NODE_ENV !== "production") {
  console.log(
    `🔐 JWT_SECRET in community-service config: ${config.JWT_SECRET}`
  );
  console.log(`🚀 Community Microservice running on port: ${config.port}`);
}
