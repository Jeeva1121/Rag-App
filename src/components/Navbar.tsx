import Link from "next/link";
import Image from "next/image";
import { FC } from "react";
import { ArrowRight } from "lucide-react";

export const Navbar: FC = () => {
    return (
        <nav className="w-full px-8 py-5 flex items-center justify-between z-50">
            {/* Logo */}
            <Link href="/" className="flex items-center bg-black text-white rounded-full px-5 py-2.5 chatin-border hover:scale-105 transition-transform">
                <img src="/logo.png" alt="Logo" className="h-8 w-auto object-contain" />
            </Link>

            {/* Actions */}
            <div className="flex items-center gap-4">
                <Link href="/chat" className="text-xs uppercase tracking-wider font-extrabold text-black hover:underline px-2 py-1">
                    Login
                </Link>
                <Link href="/chat" className="bg-chatin-yellow text-black chatin-border rounded-full hover:bg-[#E6B800] transition-colors font-extrabold text-xs uppercase tracking-wider py-3 px-6 flex items-center gap-2">
                    Let's Chat
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </nav>
    );
};
