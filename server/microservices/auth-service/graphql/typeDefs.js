const typeDefs = `#graphql
#The User type represents a user in the system.
type User @key(fields: "id") {
  id: ID!
  username: String!
  email: String!
  role: String!
  createdAt: String
}

#Extend the Query type to include a field for fetching the current user
extend type Query {
  currentUser: User
}

#Extend the Mutation type to include authentication-related operations
extend type Mutation {
  signup(username: String!, email: String!, password: String!, role: String!): Boolean
  login(username: String!, password: String!): Boolean
  logout: Boolean
}
`;
export default typeDefs;
