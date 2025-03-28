const typeDefs = `#graphql
extend type User @key(fields: "id") {
  id: ID! @external
  username: String @external
  email: String @external
  role: String @external
  createdAt: String @external
}

type CommunityPost {
  id: ID!
  author: User!
  title: String!
  content: String!
  category: String!
  aiSummary: String
  createdAt: String
  updatedAt: String
}

type HelpRequest {
  id: ID!
  author: User!
  description: String!
  location: String
  isResolved: Boolean
  volunteers: [User]
  createdAt: String
  updatedAt: String
}

extend type Query {
  communityPosts: [CommunityPost]
  helpRequests: [HelpRequest]
}

extend type Mutation {
  addCommunityPost(title: String!, content: String!, category: String!, aiSummary: String): CommunityPost
  addHelpRequest(description: String!, location: String): HelpRequest
  updateCommunityPost(id: ID!, content: String!): CommunityPost
  resolveHelpRequest(id: ID!): HelpRequest
  volunteerForHelpRequest(requestId: ID!): HelpRequest
}
`;
export default typeDefs;
