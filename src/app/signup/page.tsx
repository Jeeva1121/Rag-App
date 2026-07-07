export default function SignUp() {
  return (
    <div className="flex-1 w-full max-w-md mx-auto px-4 py-16 flex flex-col items-center justify-center">
      <div className="neo-card w-full bg-white flex flex-col items-center">
        <h1 className="text-3xl font-black mb-6 uppercase">Join the Challenge</h1>
        <input 
          type="email" 
          placeholder="Email address" 
          className="w-full mb-4 px-4 py-3 neo-border rounded-xl font-bold outline-none focus:neo-shadow-sm transition-shadow"
        />
        <input 
          type="password" 
          placeholder="Password" 
          className="w-full mb-6 px-4 py-3 neo-border rounded-xl font-bold outline-none focus:neo-shadow-sm transition-shadow"
        />
        <button className="neo-button w-full bg-[#FFDF00]">
          SIGN UP
        </button>
      </div>
    </div>
  );
}
