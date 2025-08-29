import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role: string
      nom?: string
      prenom?: string
    }
  }

  interface User {
    id: string
    email: string
    name?: string | null
    image?: string | null
    role: string
    nom?: string
    prenom?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
  }
}
