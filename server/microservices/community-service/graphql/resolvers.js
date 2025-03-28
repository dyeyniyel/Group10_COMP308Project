import CommunityPost from "../models/CommunityPost.js";
import HelpRequest from "../models/HelpRequest.js";
import User from "../models/User.js";

const resolvers = {
  //Fetch all community posts; only allow if the user is logged in
  Query: {
    communityPosts: async (_, __, { user }) => {
      if (!user) throw new Error("You must be logged in");
      return await CommunityPost.find({}).populate("author");
    },

    //Fetch all help requests; only allow if the user is logged in
    helpRequests: async (_, __, { user }) => {
      if (!user) throw new Error("You must be logged in");
      return await HelpRequest.find({})
        .populate("author")
        .populate("volunteers");
    },
  },
  Mutation: {
    //Mutation to add a new community post
    addCommunityPost: async (
      _,
      { title, content, category, aiSummary },
      { user }
    ) => {
      if (!user) throw new Error("You must be logged in");
      let localUser = await User.findById(user.id);
      if (!localUser) {
        localUser = new User({
          _id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        });
        await localUser.save();
      }

      //Create a new CommunityPost document with the provided data
      const newPost = new CommunityPost({
        author: user.id,
        title,
        content,
        category,
        aiSummary,
        updatedAt: new Date(),
      });
      await newPost.save();
      //Populate the "author" field so that the returned post contains full user details
      return await newPost.populate("author");
    },

    //Mutation to add a new help request
    addHelpRequest: async (_, { description, location }, { user }) => {
      if (!user) throw new Error("You must be logged in");

      //Ensure a local user record exists for population purposes
      let localUser = await User.findById(user.id);
      if (!localUser) {
        localUser = new User({
          _id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        });
        await localUser.save();
      }

      //Create a new HelpRequest document
      const newRequest = new HelpRequest({
        author: user.id,
        description,
        location,
        volunteers: [],
      });
      await newRequest.save();

      //Populate the "author" field for returning complete user information
      return await newRequest.populate("author");
    },

    //Mutation to update an existing community post's content
    updateCommunityPost: async (_, { id, content }, { user }) => {
      if (!user) throw new Error("You must be logged in");
      const post = await CommunityPost.findById(id);
      if (!post) throw new Error("Post not found");
      post.content = content;
      post.updatedAt = new Date();
      await post.save();
      return await post.populate("author");
    },
    resolveHelpRequest: async (_, { id }, { user }) => {
      if (!user) throw new Error("You must be logged in");
      const request = await HelpRequest.findById(id);
      if (!request) throw new Error("Help request not found");
      request.isResolved = true;
      request.updatedAt = new Date();
      await request.save();
      return await request.populate("author").populate("volunteers");
    },

    //Mutation to allow a user to volunteer for a help request
    volunteerForHelpRequest: async (_, { requestId }, { user }) => {
      if (!user) throw new Error("You must be logged in");

      // Ensure local user record exists for population purposes
      let localUser = await User.findById(user.id);
      if (!localUser) {
        localUser = new User({
          _id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        });
        await localUser.save();
      }

      const helpRequest = await HelpRequest.findById(requestId);
      if (!helpRequest) throw new Error("Help request not found");

      // Add user to volunteers if not already present
      const alreadyVolunteered = helpRequest.volunteers.some(
        (volId) => volId.toString() === user.id
      );
      if (!alreadyVolunteered) {
        helpRequest.volunteers.push(user.id);
        helpRequest.updatedAt = new Date();
        await helpRequest.save();
      }

      // Populate both "author" and "volunteers" in a single populate call
      await helpRequest.populate([{ path: "author" }, { path: "volunteers" }]);
      return helpRequest;
    },
  },
};

export default resolvers;
