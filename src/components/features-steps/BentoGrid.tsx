"use client"

import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { Upload, Zap, Star, Pause, Play } from "lucide-react"
import MacWindow from "./mac-window"
import FileUploader from "./file-uploader"
import ChatInterface from "./chat-interface"
import AIGraphic from "./ai-graphic"

export default function ProgressSteps() {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [analysisStarted, setAnalysisStarted] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const progressRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const pausedTimeRef = useRef<number>(0)
  const [isMobile, setIsMobile] = useState(false)

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Initial check
    checkMobile()

    // Add event listener for window resize
    window.addEventListener("resize", checkMobile)

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Memoize steps to prevent unnecessary re-renders
  const steps = useMemo(
    () => [
      {
        number: 1,
        title: "Upload Your PDFs or Paste your Web Page link",
        description: "Simply select your files or drag and drop them into our secure platform.",
        icon: <Upload className="h-6 w-6 text-indigo-500" />,
        windowTitle: "File Upload",
      },
      {
        number: 2,
        title: "Click Chat with AI",
        description: "Our advanced AI algorithms automatically process and analyze your data.",
        icon: <Zap className="h-6 w-6 text-indigo-500" />,
        windowTitle: "Document Analysis",
      },
      {
        number: 3,
        title: "Ask your questions",
        description:
          "Ask questions related to the content and receive clear answers and insights based on the AI analysis.",
        icon: <Star className="h-6 w-6 text-indigo-500" />,
        windowTitle: "AI Recommendations",
      },
    ],
    [],
  )

  // Memoize step positions for better performance
  const stepPositions = useMemo(() => [0, 33, 66], [])

  // Animation speed configuration - increased to 5 seconds per step
  const animationConfig = useMemo(
    () => ({
      duration: 5000, // 5 seconds per step
      resetDelay: 5000, // 5 seconds before resetting
    }),
    [],
  )

  const togglePause = () => {
    setIsPaused((prev) => !prev)
  }

  // Function to handle dot click and navigate to specific step
  const handleDotClick = (stepIndex: number) => {
    // Cancel current animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    // Set the current step and progress
    setCurrentStep(stepIndex)
    setProgress(stepPositions[stepIndex])

    // Reset animation timers
    startTimeRef.current = null
    pausedTimeRef.current = 0

    // Restart animation from the new position
    animationRef.current = requestAnimationFrame(animate)
  }

  // Memoize the animate function with useCallback
  const animate = useCallback(
    (timestamp: number) => {
      if (isPaused) {
        // Store the elapsed time when paused
        if (startTimeRef.current !== null) {
          pausedTimeRef.current = timestamp - startTimeRef.current
        }
        animationRef.current = requestAnimationFrame(animate)
        return
      }

      if (startTimeRef.current === null) {
        // If animation is starting or resuming from pause
        startTimeRef.current = timestamp - pausedTimeRef.current
      }

      const elapsed = timestamp - startTimeRef.current
      const { duration } = animationConfig

      let targetProgress
      if (currentStep === 0) {
        targetProgress = Math.min(stepPositions[1], (elapsed / duration) * stepPositions[1])
        if (elapsed >= duration && !isPaused) {
          setCurrentStep(1)
          setProgress(stepPositions[1])
          startTimeRef.current = null
          pausedTimeRef.current = 0
          animationRef.current = requestAnimationFrame(animate)
          return
        }
      } else if (currentStep === 1) {
        targetProgress =
          stepPositions[1] +
          Math.min(stepPositions[2] - stepPositions[1], (elapsed / duration) * (stepPositions[2] - stepPositions[1]))
        if (elapsed >= duration && !isPaused) {
          setCurrentStep(2)
          setProgress(stepPositions[2])
          startTimeRef.current = null
          pausedTimeRef.current = 0
          animationRef.current = requestAnimationFrame(animate)
          return
        }
      } else if (currentStep === 2) {
        targetProgress =
          stepPositions[2] + Math.min(100 - stepPositions[2], (elapsed / duration) * (100 - stepPositions[2]))
        if (elapsed >= duration && !isPaused) {
          // Reset after delay
          setTimeout(() => {
            setProgress(0)
            setCurrentStep(0)
            startTimeRef.current = null
            pausedTimeRef.current = 0
            animationRef.current = requestAnimationFrame(animate)
          }, animationConfig.resetDelay)
          return
        }
      }

      setProgress(targetProgress || 0)
      animationRef.current = requestAnimationFrame(animate)
    },
    [currentStep, isPaused, animationConfig, stepPositions, setCurrentStep, setProgress],
  )

  useEffect(() => {
    // Only run animation on desktop
    if (!isMobile) {
      // Start animation
      startTimeRef.current = null
      pausedTimeRef.current = 0
      animationRef.current = requestAnimationFrame(animate)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [currentStep, isPaused, isMobile, animate]) // Added animate to the dependency array

  const handleFileUpload = (file: File) => {
    setUploadedFile(file)

    // Automatically move to the next step after a short delay
    setTimeout(() => {
      setCurrentStep(1)
      setProgress(stepPositions[1])
    }, 1000) // Faster transition
  }

  const handleStartAnalysis = () => {
    setAnalysisStarted(true)

    // Automatically move to the next step after a short delay
    setTimeout(() => {
      setCurrentStep(2)
      setProgress(stepPositions[2])
    }, 1000) // Faster transition
  }

  // Mobile view - vertical scrolling layout with MacWindow
  if (isMobile) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6">
        <div className="text-center">
          <h2 className="text-base font-semibold text-indigo-600 tracking-wide uppercase">HOW IT WORKS</h2>
          <h1 className="mt-1 text-3xl font-extrabold text-gray-900 sm:text-4xl">Just 3 steps to get started</h1>
        </div>

        <div className="mt-12 space-y-16">
          {/* Step 1 */}
          <div className="space-y-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                <Upload className="h-6 w-6 text-indigo-500" />
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-bold text-gray-700">1. {steps[0].title}</h3>
                <p className="mt-1 text-base text-gray-700">{steps[0].description}</p>
              </div>
            </div>

            <MacWindow title={steps[0].windowTitle}>
              <div className="p-4 h-[350px] overflow-y-auto">
                <FileUploader onFileUpload={handleFileUpload} />
              </div>
            </MacWindow>
          </div>

          {/* Step 2 */}
          <div className="space-y-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                <Zap className="h-6 w-6 text-indigo-500" />
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-bold text-gray-700">2. {steps[1].title}</h3>
                <p className="mt-1 text-base text-gray-700">{steps[1].description}</p>
              </div>
            </div>

            <MacWindow title={steps[1].windowTitle}>
              <div className="h-[350px] flex flex-col">
                <div className="flex-1">
                  <AIGraphic />
                </div>

                <div className="p-4 text-center border-t">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Analyzing your document</h3>
                  <p className="text-center text-gray-700 mb-4">
                    Our AI will process your document and extract valuable insights.
                  </p>
                  <button
                    onClick={handleStartAnalysis}
                    className="py-2 px-6 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors"
                  >
                    Start Analysis
                  </button>
                </div>
              </div>
            </MacWindow>
          </div>

          {/* Step 3 */}
          <div className="space-y-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                <Star className="h-6 w-6 text-indigo-500" />
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-bold text-gray-700">3. {steps[2].title}</h3>
                <p className="mt-1 text-base text-gray-700">{steps[2].description}</p>
              </div>
            </div>

            <MacWindow title={steps[2].windowTitle}>
              <div className="h-[350px]">
                <ChatInterface
                  title={steps[2].windowTitle}
                  initialMessage="Analysis complete! Ask your first question to get started."
                  showOptions={true}
                />
              </div>
            </MacWindow>
          </div>
        </div>
      </div>
    )
  }

  // Desktop view - original layout with progress bar
  return (
    <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h2 className="text-base font-semibold text-indigo-600 tracking-wide uppercase">HOW IT WORKS</h2>
        <h1 className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
          Just 3 steps to get started
        </h1>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="relative">
          <div className="flex h-[300px]">
            {/* Vertical progress bar container with pause/resume control */}
            <div className="relative mr-6 h-full" ref={progressRef}>
              <div className="absolute top-0 bottom-0 left-[9px] w-[2px] bg-gray-200"></div>

              {/* Dynamic progress bar with will-change for better performance */}
              <div
                className="absolute top-0 left-[9px] w-[2px] bg-indigo-500 transform-gpu"
                style={{
                  height: `${progress}%`,
                  willChange: "height",
                  transition: isPaused ? "none" : "height 50ms linear",
                }}
              ></div>

              {/* Pause/Resume button */}
              <button
                onClick={togglePause}
                className="absolute -left-8 top-0 p-2 rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors z-20"
                aria-label={isPaused ? "Resume animation" : "Pause animation"}
              >
                {isPaused ? (
                  <Play className="h-4 w-4 text-indigo-500" />
                ) : (
                  <Pause className="h-4 w-4 text-indigo-500" />
                )}
              </button>

              {/* Step indicators that sit on top of the progress bar - now clickable */}
              {steps.map((step, index) => {
                const isActive = currentStep >= index
                const stepPosition = stepPositions[index]

                return (
                  <div
                    key={index}
                    className="absolute left-0 z-10"
                    style={{ top: `${stepPosition}%`, transform: "translateY(-50%)" }}
                  >
                    <button
                      onClick={() => handleDotClick(index)}
                      className={`flex items-center justify-center h-[20px] w-[20px] rounded-full border-2 ${isActive ? "bg-indigo-500 border-indigo-500" : "bg-white border-gray-300"
                        } cursor-pointer transition-colors hover:border-indigo-400`}
                      aria-label={`Go to step ${index + 1}: ${step.title}`}
                    >
                      {isActive && <div className="h-[8px] w-[8px] rounded-full bg-white"></div>}
                    </button>
                  </div>
                )
              })}
            </div>

            {/* Text content with improved alignment */}
            <div className="flex-1">
              {steps.map((step, index) => {
                const isActive = currentStep >= index
                const stepPosition = stepPositions[index]

                return (
                  <div
                    key={index}
                    className={`absolute transition-opacity duration-300 ${isActive ? "opacity-100" : "opacity-70"}`}
                    style={{
                      top: `${stepPosition}%`,
                      transform: "translateY(-50%)",
                      left: "40px",
                      width: "calc(100% - 60px)",
                    }}
                  >
                    <div className="flex items-start">
                      <div className="ml-4">
                        <h3 className="text-xl font-bold text-gray-700">
                          {step.number}. {step.title}
                        </h3>
                        <p className="mt-2 text-base text-gray-700">{step.description}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="h-[500px]">
          {currentStep === 0 && (
            <MacWindow title={steps[0].windowTitle}>
              <div className="p-6 h-[450px]">
                <FileUploader onFileUpload={handleFileUpload} />

                {uploadedFile && (
                  <div className="mt-4">
                    <button
                      onClick={() => {
                        setCurrentStep(1)
                        setProgress(stepPositions[1])
                      }}
                      className="w-full py-2 px-4 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors"
                    >
                      Continue
                    </button>
                  </div>
                )}
              </div>
            </MacWindow>
          )}

          {currentStep === 1 && (
            <MacWindow title={steps[1].windowTitle}>
              <div className="h-[450px] flex flex-col">
                {!analysisStarted ? (
                  <div className="flex flex-col h-full">
                    {/* AI Graphic with floating message bubbles */}
                    <div className="flex-1">
                      <AIGraphic />
                    </div>

                    <div className="p-6 text-center">
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">Analyzing your document</h3>
                      <p className="text-center text-gray-700 mb-6">
                        Our AI will process your document and extract valuable insights.
                      </p>
                      <button
                        onClick={handleStartAnalysis}
                        className="py-2 px-6 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors"
                      >
                        Start Analysis
                      </button>
                    </div>
                  </div>
                ) : (
                  <ChatInterface
                    title={steps[1].windowTitle}
                    initialMessage="I'm analyzing your document. This might take a moment. What specific information are you looking for in this document?"
                  />
                )}
              </div>
            </MacWindow>
          )}

          {currentStep === 2 && (
            <MacWindow title={steps[2].windowTitle}>
              <div className="h-[450px]">
                <ChatInterface
                  title={steps[2].windowTitle}
                  initialMessage="Analysis complete! Ask your first question to get started."
                  showOptions={true}
                />
              </div>
            </MacWindow>
          )}
        </div>
      </div>
    </div>
  )
}

