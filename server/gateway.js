import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloGateway, IntrospectAndCompose } from "@apollo/gateway";
import cors from "cors";
import cookieParser from "cookie-parser";

//Create an Express application
const app = express();

//Middleware to parse JSON and URL-encoded data in requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
    ],
    credentials: true,
  })
);
app.use(cookieParser());

//Set up Apollo Gateway to compose the subgraphs into a single unified schema
const gateway = new ApolloGateway({
  supergraphSdl: new IntrospectAndCompose({
    subgraphs: [
      { name: "auth", url: "http://localhost:4001/graphql" },
      { name: "community", url: "http://localhost:4002/graphql" },
    ],
  }),
});

//Initialize Apollo Server with the gateway as its data source and enable introspection
const server = new ApolloServer({
  gateway,
  introspection: true,
});

//Start the Apollo Server and bind it to the Express app at the /graphql endpoint
async function startServer() {
  await server.start();
  app.use("/graphql", expressMiddleware(server));
  app.listen(4000, () => {
    console.log(`🚀 API Gateway ready at http://localhost:4000/graphql`);
  });
}
startServer();
