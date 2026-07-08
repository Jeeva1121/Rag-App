import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { signIn } from "@/auth";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-neutral-50 grid-bg relative px-4">
      
      {/* Back Button */}
      <div className="absolute top-8 left-8">
        <Link href="/" className="flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-black transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-neutral-100 p-8 md:p-10 relative overflow-hidden">
        {/* Decorative blur */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#2B66FF] rounded-full blur-[80px] opacity-20 pointer-events-none"></div>

        <div className="text-center mb-8 relative z-10">
          <img src="/logo.png" alt="Lumina" className="h-10 w-auto mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Welcome to Lumina AI</h1>
          <p className="text-sm text-neutral-500">Sign in or create an account to continue.</p>
        </div>

        <div className="space-y-4 relative z-10">
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 transition-all active:scale-[0.98] shadow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </button>
          </form>
        </div>

        <div className="mt-8 text-center text-xs text-neutral-400 relative z-10">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </div>
      </div>
    </div>
  );
}
