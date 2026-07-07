export default function Coins() {
  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-16 flex flex-col items-center">
      <h1 className="text-5xl font-black mb-8 uppercase">Coins</h1>
      <div className="neo-card w-full text-center p-12 bg-[#FFDF00]">
        <h2 className="text-4xl font-black mb-4">0.00 CLD</h2>
        <p className="text-xl font-bold">Start tapping to earn coins!</p>
      </div>
    </div>
  );
}
