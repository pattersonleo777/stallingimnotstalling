import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./db";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({ where: { email: credentials.email as string } });
        if (!user || !user.password) return null;
        const isPasswordValid = await bcrypt.compare(credentials.password as string, user.password);
        return isPasswordValid ? user : null;
      }
    })
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async session({ session, token }: any) {
      if (session.user) { (session.user as any).id = token.sub; }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-replace-me",
  pages: { signIn: '/login' }
});

// Create a compatibility export so other files don't break
export const authOptions = {}; 
