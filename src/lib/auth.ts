import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "./db"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email.toLowerCase() },
            include: { 
              company: {
                select: {
                  id: true,
                  name: true,
                  isApproved: true,
                }
              }
            },
          })

          if (!user) return null

          if (!user.isActive) {
            throw new Error("UserInactive")
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) return null

          if (user.role === "CLIENT_PRO" || user.role === "SALES_REP") {
            if (!user.company || !user.company.isApproved) {
              throw new Error("CompanyNotApproved")
            }
          }

          return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            name: `${user.firstName} ${user.lastName}`,
            role: user.role,
            companyId: user.companyId,
            companyName: user.company?.name,
          }
        } catch (error) {
          console.error("Auth error:", error)
          throw error
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.firstName = user.firstName
        token.lastName = user.lastName
        token.companyId = user.companyId
        token.companyName = user.companyName
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.firstName = token.firstName
        session.user.lastName = token.lastName
        session.user.companyId = token.companyId
        session.user.companyName = token.companyName
      }
      return session
    },
  },
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      firstName: string
      lastName: string
      name: string
      role: string
      companyId?: string
      companyName?: string
    }
  }

  interface User {
    id: string
    email: string
    firstName: string
    lastName: string
    role: string
    companyId?: string
    companyName?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    firstName: string
    lastName: string
    companyId?: string
    companyName?: string
  }
}
