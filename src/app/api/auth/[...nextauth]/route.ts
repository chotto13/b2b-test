import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"

const handler = NextAuth({
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
            console.log("Missing credentials")
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

          if (!user) {
            console.log("User not found:", credentials.email)
            return null
          }

          if (!user.isActive) {
            console.log("User inactive:", credentials.email)
            throw new Error("UserInactive")
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            console.log("Invalid password for:", credentials.email)
            return null
          }

          // Check company approval for non-admin users
          if (user.role === "CLIENT_PRO" || user.role === "SALES_REP") {
            if (!user.company || !user.company.isApproved) {
              console.log("Company not approved:", credentials.email)
              throw new Error("CompanyNotApproved")
            }
          }

          console.log("Login successful:", credentials.email)

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
  debug: process.env.NODE_ENV === "development",
})

export { handler as GET, handler as POST }
