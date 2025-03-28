import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import { parse } from "graphql";
import { config } from "./config/config.js";
import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { buildSubgraphSchema } from "@apollo/subgraph";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
import connectDB from "./config/mongoose.js";
import typeDefs from "./graphql/typeDefs.js";
import resolvers from "./graphql/resolvers.js";

connectDB();

const app = express();

//Configure CORS to allow requests from specified origins and enable credentials (cookies)
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
      "http://localhost:4000",
      "https://studio.apollographql.com",
    ],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const schema = buildSubgraphSchema([{ typeDefs: parse(typeDefs), resolvers }]);

//Create an Apollo Server instance with the federated schema and enable introspection
const server = new ApolloServer({
  schema,
  introspection: true,
});

//Define an asynchronous function to start the server
async function startServer() {
  await server.start();

  //Apply the Apollo Server Express middleware on the "/graphql" endpoint,
  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req, res }) => {
        const token =
          req.cookies?.token || req.headers.authorization?.split(" ")[1];
        let user = null;
        if (token) {
          try {
            const decoded = jwt.verify(token, config.JWT_SECRET);
            user = {
              username: decoded.username,
              email: decoded.email,
              role: decoded.role,
            };
          } catch (error) {
            console.error("Token verification failed:", error);
          }
        }
        return { user, req, res };
      },
    })
  );
  app.listen(config.port, () =>
    console.log(
      `🚀 Auth Microservice running at http://localhost:${config.port}/graphql`
    )
  );
}

startServer();
