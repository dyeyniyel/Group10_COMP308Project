import "./App.css";
import CommunityComponent from "./CommunityComponent";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";

const client = new ApolloClient({
  uri: "http://localhost:4002/graphql", // Or use the API Gateway endpoint if desired
  cache: new InMemoryCache(),
  credentials: "include",
});

function App() {
  return (
    <div className="App">
      <ApolloProvider client={client}>
        <CommunityComponent />
      </ApolloProvider>
    </div>
  );
}
export default App;
