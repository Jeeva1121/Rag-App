import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

// Debug logging to help identify missing variables in Vercel
console.log("NextAuth Initialization Check:");
console.log("- AUTH_SECRET present:", !!process.env.AUTH_SECRET);
console.log("- AUTH_GOOGLE_ID present:", !!process.env.AUTH_GOOGLE_ID);
console.log("- AUTH_GOOGLE_SECRET present:", !!process.env.AUTH_GOOGLE_SECRET);

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET || "",
    })
  ],
  secret: process.env.AUTH_SECRET,
  debug: true, // Enable NextAuth debug logs
})
