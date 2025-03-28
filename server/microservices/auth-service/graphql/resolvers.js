import jwt from "jsonwebtoken";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import { config } from "../config/config.js";

const resolvers = {
  Query: {
    //Resolver for fetching the current user based on the JWT in cookies
    currentUser: (_, __, context) => {
      const { req } = context;
      if (!req || !req.cookies) return null;
      const token = req.cookies.token;
      if (!token) return null;
      try {
        const decoded = jwt.verify(token, config.JWT_SECRET); // Verify the token using the secret from config
        // Return the decoded user information (id, username, email, role)
        return {
          id: decoded.id,
          username: decoded.username,
          email: decoded.email,
          role: decoded.role,
        };
      } catch (error) {
        console.error("Error verifying token:", error);
        return null;
      }
    },
  },
  Mutation: {
    //Resolver for user signup/registration
    signup: async (_, { username, email, password, role }) => {
      const existingUser = await User.findOne({
        $or: [{ username }, { email }],
      });
      if (existingUser) {
        throw new Error("Username or email is already taken");
      }

      //Create a new user with the provided fields
      const newUser = new User({ username, email, password, role });
      await newUser.save();
      return true;
    },

    //Resolver for user login/authentication
    login: async (_, { username, password }, { res }) => {
      const user = await User.findOne({ username });
      if (!user) {
        throw new Error("User not found");
      }

      //Compare provided password with stored hashed password
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        throw new Error("Invalid password");
      }
      //Sign a JWT with user details; convert _id to string for consistency
      const token = jwt.sign(
        {
          id: user._id.toString(),
          username: user.username,
          email: user.email,
          role: user.role,
        },
        config.JWT_SECRET,
        { expiresIn: "1d" }
      );
      res.cookie("token", token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      });
      return true;
    },

    //Resolver for user logout: clears the token cookie
    logout: async (_, __, { res }) => {
      res.clearCookie("token");
      return true;
    },
  },
};

export default resolvers;
