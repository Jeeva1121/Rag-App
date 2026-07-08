import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Play, FileText, MessageSquare, CheckSquare, Plus, Search } from "lucide-react";
import * as motion from "framer-motion/client";
import { auth, signIn, signOut } from "@/auth";

export default async function Home() {
  const session = await auth();
  const newChatId = crypto.randomUUID();
  return (
    <div className="flex-1 flex flex-col w-full relative min-h-screen bg-white grid-bg pb-20">
      
      {/* 1. HEADER / NAVBAR */}
      <nav className="w-full px-8 py-5 flex items-center justify-between border-b border-neutral-200 bg-white sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="Lumina AI" className="h-10 w-auto object-contain" />
        </Link>

        {/* Menu Links */}
        <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-black">
          <Link href="/">
            <button className="hero-btn hero-btn-xs">
              <div className="hero-btn-outer"><div className="hero-btn-inner"><span>Home</span></div></div>
            </button>
          </Link>
          <Link href="/how-it-works" className="hover:text-neutral-600 transition-colors font-medium">How It Works</Link>
        </div>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-3">
          {!session ? (
            <>
              <Link href="/login">
                <button className="hero-btn hero-btn-sm hero-btn-outline">
                  <div className="hero-btn-outer"><div className="hero-btn-inner"><span>Log in</span></div></div>
                </button>
              </Link>
              <Link href="/login">
                <button className="hero-btn hero-btn-sm hero-btn-yellow">
                  <div className="hero-btn-outer"><div className="hero-btn-inner"><span>Sign up</span></div></div>
                </button>
              </Link>
            </>
          ) : (
            <>
              <div className="text-sm font-semibold mr-2">{session.user?.name}</div>
              <form action={async () => { "use server"; await signOut(); }}>
                <button className="hero-btn hero-btn-sm hero-btn-outline" type="submit">
                  <div className="hero-btn-outer"><div className="hero-btn-inner"><span>Sign out</span></div></div>
                </button>
              </form>
            </>
          )}
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <div className="w-full max-w-6xl mx-auto px-6 pt-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Column (Hero copy) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-6 flex flex-col items-start text-left"
        >
          
          {/* Badge */}
          <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ duration: 0.4, delay: 0.2 }}
             className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white shadow-sm border border-neutral-200 text-xs font-bold text-neutral-800 mb-6"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#2B66FF] animate-pulse"></span>
            Your AI Research & Document Assistant
          </motion.div>

          <motion.h1 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5, delay: 0.3 }}
             className="text-3xl md:text-7xl font-extrabold leading-[1.05] tracking-tight text-black mb-6"
          >
            Chat with your <br />
            documents <span className="text-[#2B66FF]">smarter.</span>
          </motion.h1>

          <motion.p 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5, delay: 0.4 }}
             className="text-base md:text-lg text-neutral-600 mb-10 max-w-lg font-medium leading-relaxed"
          >
            Upload PDFs, ask questions, and get accurate answers instantly with Lumina AI.
          </motion.p>

          {/* Action Buttons */}
          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5, delay: 0.5 }}
             className="flex flex-col gap-6"
          >
            <div className="flex flex-wrap items-center gap-4 md:gap-8 mt-2">
                {!session ? (
                   <Link href="/login">
                      <button className="hero-btn">
                          <div className="hero-btn-outer">
                              <div className="hero-btn-inner">
                                  <span>Sign in to Start <ArrowRight className="w-4 h-4" /></span>
                              </div>
                          </div>
                      </button>
                   </Link>
                ) : (
                   <Link href={`/chat?id=${newChatId}`}>
                      <button className="hero-btn">
                          <div className="hero-btn-outer">
                              <div className="hero-btn-inner">
                                  <span>Start New Chat <ArrowRight className="w-4 h-4" /></span>
                              </div>
                          </div>
                      </button>
                   </Link>
                )}
                <Link href="/how-it-works" className="group font-semibold text-sm tracking-wider text-neutral-500 flex items-center gap-2 hover:text-black transition-colors ml-3 md:ml-0 mt-2 md:mt-0">
                  Learn how it works 
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
          </motion.div>

        </motion.div>

        {/* Right Column (Hero image) */}
        <motion.div 
           initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
           animate={{ opacity: 1, scale: 1, rotate: 0 }}
           transition={{ duration: 0.6, delay: 0.3 }}
           className="lg:col-span-6 flex justify-center items-center relative"
        >
          <video 
            src="/hero-video.mp4" 
            autoPlay 
            loop 
            muted 
            playsInline
            className="w-full h-auto object-cover mix-blend-multiply hover:scale-[1.02] transition-transform duration-500 ease-out"
          />
        </motion.div>

      </div>

      {/* 4. BOTTOM VALUE PROPOSITION & MOCKUP */}
      <div className="w-full max-w-6xl mx-auto px-6 mt-32 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
         
         {/* Left Column text */}
         <div className="lg:col-span-4 text-left flex flex-col items-start">
            <h2 className="text-2xl md:text-4xl font-extrabold text-black leading-tight mb-6">
               Built for deep thinking <br />
               Not <span className="text-[#2B66FF]">shallow</span> answers
            </h2>
            <p className="text-sm text-neutral-600 font-medium leading-relaxed mb-8">
               Lumina AI uses advanced RAG technology to understand your documents and give you accurate, source-backed responses.
            </p>
            <Link href="/how-it-works">
              <button className="hero-btn hero-btn-md">
                <div className="hero-btn-outer"><div className="hero-btn-inner"><span>See how it works <ArrowRight className="w-4 h-4" /></span></div></div>
              </button>
            </Link>
         </div>

         {/* Right Column - Styled Chat Mockup (aligned with mockup in image) */}
         <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-8 w-full bg-[#18181C] border border-neutral-800 rounded-[2.5rem] p-6 shadow-2xl relative text-white hover:shadow-[#2B66FF]/20 hover:shadow-3xl transition-shadow duration-500"
         >
            
            {/* Header controls of mock */}
            <div className="flex justify-between items-center border-b border-neutral-800 pb-4 mb-4">
               <div className="flex items-center gap-3">
                  <div className="w-3.5 h-3.5 rounded-full bg-neutral-700"></div>
                  <span className="text-[10px] font-semibold text-neutral-400 tracking-widest">Document viewport</span>
               </div>
               <span className="text-[10px] font-semibold text-neutral-500">Lumina AI 1.4</span>
            </div>

            <div className="space-y-6 min-h-[220px]">
               {/* User prompt mockup */}
               <div className="flex justify-end">
                  <motion.div 
                     initial={{ opacity: 0, scale: 0.9, originX: 1, originY: 1 }}
                     animate={{ opacity: 1, scale: 1 }}
                     transition={{ duration: 0.4, delay: 0.6, type: "spring", stiffness: 200 }}
                     className="bg-[#2B66FF] text-white px-5 py-3 rounded-[1.8rem] rounded-br-sm text-xs font-medium shadow-sm hover:scale-105 transition-transform cursor-default"
                  >
                     What is Retrieval-Augmented Generation (RAG)?
                  </motion.div>
               </div>

               {/* AI reply mockup */}
               <div className="flex flex-col items-start gap-2">
                  <motion.div 
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.4, delay: 1 }}
                     className="bg-transparent text-neutral-300 text-xs font-medium max-w-[90%] leading-relaxed"
                  >
                     RAG combines retrieval mechanisms with generative models to produce more accurate and context-aware responses.
                  </motion.div>
                  
                  {/* Reference widget */}
                  <motion.div 
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     transition={{ duration: 0.4, delay: 1.4 }}
                     className="bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-[10px] font-semibold text-neutral-400 mt-2 hover:bg-neutral-700 transition-colors cursor-pointer"
                  >
                     Source: research.pdf — Page 12
                  </motion.div>
               </div>
            </div>

            {/* Input field mock */}
            <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.4, delay: 1.8 }}
               className="bg-[#222226] border border-neutral-800 rounded-full p-1.5 flex items-center justify-between mt-4 group cursor-text"
            >
               <div className="text-neutral-500 text-xs font-medium px-4 group-hover:text-neutral-300 transition-colors">Type here...</div>
               <div className="w-9 h-9 rounded-full bg-chatin-green text-white flex items-center justify-center font-extrabold hover:scale-110 transition-transform cursor-pointer shadow-lg hover:shadow-chatin-green/50">+</div>
            </motion.div>

            {/* Post-it mock overlapping bottom right */}
            <motion.div 
               initial={{ opacity: 0, scale: 0, rotate: 0 }}
               animate={{ opacity: 1, scale: 1, rotate: 3 }}
               whileHover={{ scale: 1.1, rotate: -3 }}
               transition={{ duration: 0.5, delay: 2.2, type: "spring", stiffness: 300, damping: 15 }}
               className="absolute right-[-16px] bottom-[-24px] bg-[#2B66FF] rounded-2xl p-4 w-40 shadow-xl text-white text-left cursor-pointer z-10"
            >
               <p className="font-medium text-[10px] leading-tight tracking-wider mb-1">Accurate.</p>
               <p className="font-medium text-[10px] leading-tight tracking-wider mb-1">Verifiable.</p>
               <p className="font-medium text-[10px] leading-tight tracking-wider">Smart.</p>
            </motion.div>

         </motion.div>

      </div>

    </div>
  );
}
