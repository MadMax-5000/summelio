import {
  FileText,
  Globe,
  MessageSquare,
  Zap,
  Database,
  Shield,
  Sparkles,
  Bot,
} from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 tracking-tight">
      <section className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-semibold text-indigo-600 mb-4 tracking-tight">
            Transform Content into Conversations
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto tracking-tight items-center flex justify-center">
            Turn your PDFs and web pages into AI chatbots that understand your
            content.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-5 max-w-6xl mx-auto">
          {/* AI-Powered Chatbots */}
          <div className="col-span-1 md:col-span-4 bg-indigo-50 rounded-3xl p-8 transition-all hover:shadow-md flex flex-col h-full">
            <div className="flex items-start">
              <div className="bg-indigo-100 p-3 rounded-2xl">
                <Bot className="h-8 w-8 text-indigo-600" />
              </div>
            </div>
            <h3 className="text-2xl font-semibold text-gray-700 mt-6 mb-3">
              AI-Powered Chatbots
            </h3>
            <p className="text-gray-700">
              Our advanced AI understands the context your documents, providing
              accurate and helpful responses to user queries.
            </p>
          </div>

          {/* PDF Upload */}
          <div className="col-span-1 md:col-span-2 bg-indigo-100 rounded-3xl p-8 transition-all hover:shadow-md flex flex-col h-full">
            <div className="flex items-start">
              <div className="bg-white p-3 rounded-2xl">
                <FileText className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mt-6 mb-3">
              PDF Processing
            </h3>
            <p className="text-gray-700">
              Upload any PDF document and convert it into an interactive chatbot
              in seconds.
            </p>
          </div>

          {/* Demo Image */}
          <div className="col-span-1 md:col-span-4 bg-white rounded-3xl overflow-hidden transition-all hover:shadow-md border border-indigo-100 h-[400px]">
            <div className="relative w-full h-full">
              <Image
                src="/images/bentoimage.png"
                alt="PDF to Chatbot Demo showing Napoleon Bonaparte information"
                fill
                className="object-contain"
              />
            </div>
          </div>

          {/* Web Scraping */}
          <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-3xl p-8 text-white transition-all hover:shadow-md flex flex-col h-full">
            <div className="flex items-start">
              <div className="bg-white/20 p-3 rounded-2xl">
                <Globe className="h-6 w-6 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mt-6 mb-3">
              Web Page Integration
            </h3>
            <p className="text-white/90">
              Simply enter a URL and our system will crawl the content to create
              a knowledgeable smart chatbot.
            </p>
          </div>

          {/* Fast Processing */}
          <div className="col-span-1 md:col-span-2 bg-indigo-50 rounded-3xl p-8 transition-all hover:shadow-md flex flex-col h-full">
            <div className="flex items-start">
              <div className="bg-indigo-100 p-3 rounded-2xl">
                <Zap className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mt-6 mb-3">
              Lightning Fast
            </h3>
            <p className="text-gray-700">
              Process documents and generate chatbots in seconds, not minutes or
              hours.
            </p>
          </div>

          {/* Knowledge Base */}
          <div className="col-span-1 md:col-span-2 bg-indigo-900 rounded-3xl p-8 text-white transition-all hover:shadow-md flex flex-col h-full">
            <div className="flex items-start">
              <div className="bg-white/20 p-3 rounded-2xl">
                <Database className="h-6 w-6 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mt-6 mb-3">Knowledge Base</h3>
            <p className="text-white/90">
              All your documents are stored in a secure, searchable knowledge
              base that powers your chatbots.
            </p>
          </div>

          {/* Security */}
          <div className="col-span-1 md:col-span-2 bg-indigo-50 rounded-3xl p-8 transition-all hover:shadow-md flex flex-col h-full">
            <div className="flex items-start">
              <div className="bg-indigo-100 p-3 rounded-2xl">
                <Shield className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mt-6 mb-3">
              Enterprise Security
            </h3>
            <p className="text-gray-700">
              Your data is encrypted and protected with enterprise-grade
              security measures.
            </p>
          </div>

          {/* Conversations */}
          <div className="col-span-1 md:col-span-3 bg-indigo-100 rounded-3xl p-8 transition-all hover:shadow-md flex flex-col h-full">
            <div className="flex items-start">
              <div className="bg-white p-3 rounded-2xl">
                <MessageSquare className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mt-6 mb-3">
              Natural Conversations
            </h3>
            <p className="text-gray-700">
              Users can have natural, flowing conversations with your content
              through our intuitive chat interface.
            </p>
          </div>

          {/* AI Features */}
          <div className="col-span-1 md:col-span-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-3xl p-8 text-white transition-all hover:shadow-md flex flex-col h-full">
            <div className="flex items-start">
              <div className="bg-white/20 p-3 rounded-2xl">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mt-6 mb-3">
              Advanced AI Features
            </h3>
            <p className="text-white/90">
              Benefit from continuous learning, multi-language support, and
              context-aware responses.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
