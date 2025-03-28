import { useState, useEffect } from "react";

export default function Hero() {
  const contentTypes = ["PDF", "Web Page", "YouTube Video"];
  const [currentType, setCurrentType] = useState(contentTypes[0]);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    let index = 0;

    const interval = setInterval(() => {
      setIsAnimating(true);

      setTimeout(() => {
        index = (index + 1) % contentTypes.length;
        setCurrentType(contentTypes[index]);
        setIsAnimating(false);
      }, 400);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-50">
      <header className="relative inset-x-0 top-0 z-50">
        <nav
          aria-label="Global"
          className="flex items-center justify-between p-6 lg:px-8"
        >
          {/* Navigation content if needed can go here */}
        </nav>
      </header>

      <div className="relative isolate px-6 lg:px-8">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        >
          <div
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
            className="relative left-[calc(50%-11rem)] aspect-1155/678 w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          />
        </div>
        <div className="mx-auto max-w-2xl py-20 sm:py-48 lg:py-10">
          <div className="hidden sm:mb-8 sm:flex sm:justify-center">
            {/**  <div className="relative rounded-full px-3 py-1 text-sm/6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-indigo-200 ">
              Browse All Content Types.{" "}
              <a href="#" className="font-semibold text-indigo-600">
                <span aria-hidden="true" className="absolute inset-0" />
                Read more <span aria-hidden="true">&rarr;</span>
              </a>
            </div> */}
          </div>
          <div className="text-center">
            <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-7xl flex flex-col items-center">
              <div className="w-full">Transform your</div>

              <div className="h-24 relative overflow-hidden flex items-center justify-center w-full">
                <div
                  className={`text-indigo-600 absolute transition-all duration-500 ease-in-out transform ${isAnimating ? 'opacity-0 translate-y-8' : 'opacity-100 translate-y-0'}`}
                >
                  {currentType} <span className="text-gray-900">to</span>
                </div>
              </div>

              <div className="w-full"> an AI Chatbot</div>
            </h1>

            <p className="mt-8 text-lg text-pretty text-gray-700 tracking-tight">
              Upload your files and let AI answer your questions.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <a
                href="#pricing"
                className="rounded-md bg-indigo-600 px-3 py-2 text-lg text-pretty font-normal text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Get started
              </a>
              {/**  <a href="" className="text-base font-medium text-gray-700">
                Learn more <span aria-hidden="true">→</span>
              </a>
              */}
            </div>
          </div>
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
        >
          <div
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
            className="relative left-[calc(50%+3rem)] aspect-1155/678 w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
          />
        </div>
      </div>
    </div>
  );
}