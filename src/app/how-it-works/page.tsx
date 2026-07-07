export default function HowItWorks() {
  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-16 flex flex-col items-center">
      <h1 className="text-5xl font-black mb-8 uppercase text-center">How It Works</h1>
      <div className="neo-card w-full p-12 bg-neo-purple flex flex-col gap-6">
        <div className="bg-white neo-border p-6 rounded-2xl">
          <h3 className="font-black text-2xl mb-2">1. Upload</h3>
          <p className="font-bold">Upload your PDF documents securely.</p>
        </div>
        <div className="bg-white neo-border p-6 rounded-2xl">
          <h3 className="font-black text-2xl mb-2">2. Ask</h3>
          <p className="font-bold">Chat with our AI to ask questions about your document.</p>
        </div>
        <div className="bg-white neo-border p-6 rounded-2xl">
          <h3 className="font-black text-2xl mb-2">3. Insights</h3>
          <p className="font-bold">Get fast, accurate answers directly sourced from your files.</p>
        </div>
      </div>
    </div>
  );
}
