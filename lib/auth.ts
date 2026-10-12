
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";

import dbConnect from "@/lib/db";
import User from "@/model/User";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  pages: {
    signIn: "/login",
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        await dbConnect();

        const user = await User.findOne({
          email: credentials.email,
        }).select("+password");

        if (!user || user.active === false) {
          return null;
        }

        if (!user.password) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          is_admin: user.is_admin === true,
          role: user.is_admin === true ? "admin" : "user",
        };
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      // Credentials users have already been validated above.
      if (account?.provider === "credentials") {
        return true;
      }

      // Only allow Google users that already exist in your database.
      // This prevents a Google login from automatically becoming an admin.
      if (account?.provider === "google" && user.email) {
        await dbConnect();

        const dbUser = await User.findOne({
          email: user.email,
        });

        if (!dbUser || dbUser.active === false) {
          return false;
        }

        user.id = dbUser._id.toString();
        user.is_admin = dbUser.is_admin === true;
        user.role = dbUser.is_admin === true ? "admin" : "user";

        return true;
      }

      return false;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.is_admin = user.is_admin === true;
        token.role = user.is_admin === true ? "admin" : "user";
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.is_admin = token.is_admin === true;
        session.user.role =
          token.is_admin === true ? "admin" : "user";
      }

      return session;
    },
  },
};
