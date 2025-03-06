import { Zap, BrainCircuit, Infinity } from "lucide-react";

const features = [
  {
    name: "Instant Answers",
    description:
      " No more scrolling. Get direct responses from your documents and web pages in seconds.",
    icon: Zap,
  },
  {
    name: "Smart AI-Powered Chat",
    description: "Ask anything, and our AI extracts key insights instantly.",
    icon: BrainCircuit,
  },
  {
    name: "Seamless Workflow",
    description:
      "Upload, chat, and get the information you need—without switching tabs.",
    icon: Infinity,
  },
];

export default function FeatureSection() {
  return (
    <section id="feature-section">
      <div className="overflow-hidden bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
            <div className="lg:pt-4 lg:pr-8">
              <div className="lg:max-w-lg">
                <h2 className="text-base/7 font-semibold text-indigo-600">
                  Chat with your content in Seconds
                </h2>
                <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl">
                  Turn PDFs & Web Pages into Conversations
                </p>
                <p className="mt-6 text-lg/8 text-gray-600">
                  Stop wasting time reading through endless pages. Simply upload
                  a PDF or paste a website link, and start asking questions—just
                  like chatting with a real person.
                </p>
                <dl className="mt-10 max-w-xl space-y-8 text-base/7 text-gray-600 lg:max-w-none">
                  {features.map((feature) => (
                    <div key={feature.name} className="relative pl-9">
                      <dt className="inline font-semibold text-gray-900">
                        <feature.icon
                          aria-hidden="true"
                          className="absolute top-1 left-1 size-6 text-indigo-600"
                        />
                        {feature.name}
                      </dt>{" "}
                      <dd className="inline">{feature.description}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
            <img
              alt="Product screenshot"
              src="/images/features-image.png"
              width={2432}
              height={1442}
              className="w-[48rem] max-w-none rounded-xl ring-1 shadow-xl ring-gray-400/10 sm:w-[57rem] md:-ml-4 lg:-ml-0"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
