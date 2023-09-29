import { getServerSession } from 'next-auth/next'
import EmailProvider from 'next-auth/providers/email'
import { PrismaAdapter } from '@auth/prisma-adapter'
import prisma from '@/lib/prisma'
import { sendVerificationRequest } from '@/utils/send-verification-request'

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      name: 'email',
      server: '',
      sendVerificationRequest,
    }),
  ],
  pages: {
    signIn: '/login',
    verifyRequest: '/login/verify',
  },
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    // Add user ID to session from token
    session: async ({ session, token }) => {
      if (session?.user) {
        session.user.id = token.sub
      }
      return session
    }
  }
}

export function getSession() {
  return getServerSession(authOptions)
}
