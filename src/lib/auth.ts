import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import type { NextAuthConfig } from "next-auth";

// Mock user data - in production, this would come from a database
const mockUsers = [
  {
    id: "1",
    email: "admin@nike.com",
    password: "$2a$10$K7L1OJ45/4Y2nIvhvz4M4.PE7P6.C3C6UNeKsbiXFXm0/i0vAcEHW", // password: password123
    name: "Nike Admin",
    brandId: "nike",
    brandName: "Nike",
    role: "admin"
  },
  {
    id: "2", 
    email: "admin@adidas.com",
    password: "$2a$10$K7L1OJ45/4Y2nIvhvz4M4.PE7P6.C3C6UNeKsbiXFXm0/i0vAcEHW", // password: password123
    name: "Adidas Admin",
    brandId: "adidas",
    brandName: "Adidas",
    role: "admin"
  }
];

// Mock brand guidelines - in production, this would come from a database
export const mockBrandGuidelines = {
  nike: {
    id: "nike",
    name: "Nike",
    colors: {
      primary: ["#000000", "#FFFFFF"],
      accent: ["#FF6900", "#F5A623"]
    },
    fonts: ["Futura", "Helvetica Neue"],
    style: "athletic, dynamic, bold, empowering, innovative",
    keywords: ["Just Do It", "swoosh", "athletic performance", "innovation"],
    restrictions: ["avoid competitor logos", "no static poses", "action-oriented"],
    logoUrl: "/brands/nike/logo.png"
  },
  adidas: {
    id: "adidas",
    name: "Adidas",
    colors: {
      primary: ["#000000", "#FFFFFF"],
      accent: ["#FF0000", "#0000FF", "#00FF00"]
    },
    fonts: ["Avant Garde", "Helvetica"],
    style: "sporty, modern, performance-driven, urban",
    keywords: ["three stripes", "Impossible is Nothing", "creator sports"],
    restrictions: ["avoid Nike swoosh", "maintain three-stripe identity"],
    logoUrl: "/brands/adidas/logo.png"
  }
};

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials) return null;

        try {
          const { email, password } = loginSchema.parse(credentials);
          
          // Find user by email (in production, query your database)
          const user = mockUsers.find(u => u.email === email);
          if (!user) return null;

          // Verify password
          const isValid = await bcrypt.compare(password, user.password);
          if (!isValid) return null;

          // Return user object (this will be encoded in the JWT)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            brandId: user.brandId,
            brandName: user.brandName,
            role: user.role
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.brandId = user.brandId;
        token.brandName = user.brandName;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.brandId = token.brandId as string;
        session.user.brandName = token.brandName as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

// Types for TypeScript
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      brandId: string;
      brandName: string;
      role: string;
    }
  }

  interface User {
    brandId: string;
    brandName: string;
    role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    brandId: string;
    brandName: string;
    role: string;
  }
}