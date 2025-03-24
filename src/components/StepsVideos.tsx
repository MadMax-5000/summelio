'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'

export default function TabSection() {
  const [isHovering, setIsHovering] = useState(false)

  return (
    <div className="w-full bg-gray-50 py-36">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Introduction Section */}
        <div className="text-center mb-10">
          <h1 className="text-7xl md:text-6xl font-extrabold text-foreground mb-6 tracking-tight">
            Get Started in <span className="relative">
              2 Steps
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M0,10 C40,0 60,20 100,10 C140,0 160,20 200,10"
                  fill="none"
                  stroke="#4f46e5"
                  strokeWidth="6"
                  strokeLinecap="round" />
              </svg>
            </span>
          </h1>
          <div className="h-1 w-20 bg-primary mx-auto rounded-full mb-24"></div>
        </div>

        {/* Upload Files Section */}
        <section className="mb-32">
          <div className="max-w-3xl mx-auto mb-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-2 text-indigo-700 tracking-tight">
              Upload your Files
            </h2>
            <p className="text-lg text-muted-foreground text-gray-700">
              Easily upload your files by dragging and dropping them or pasting the URL directly.
            </p>
          </div>

          <motion.div
            className="relative rounded-2xl overflow-hidden shadow-xl mx-auto max-w-4xl"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <Card className="border-0 shadow-none overflow-hidden aspect-video">
              <video
                className="w-full h-full object-cover"
                muted
                loop
                autoPlay
                playsInline
              >
                <source src="/videos/uploadfile-demo.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>

              {isHovering && (
                <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                  <div className="bg-background/90 backdrop-blur-sm px-6 py-3 rounded-full text-sm font-medium">
                    Step 1 : Upload your files
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        </section>

        <section className="mb-32">
          <div className="max-w-3xl mx-auto mb-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-2 text-indigo-700 tracking-tight">
              Chat with your Files
            </h2>
            <p className="text-lg text-muted-foreground text-gray-700">
              Ask questions and get answers from your files instantly.
            </p>
          </div>

          <motion.div
            className="relative rounded-2xl overflow-hidden shadow-xl mx-auto max-w-4xl"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <Card className="border-0 shadow-none overflow-hidden aspect-video">
              <video
                className="w-full h-full object-cover"
                muted
                loop
                autoPlay
                playsInline
              >
                <source src="/videos/chat-demo.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>

              {isHovering && (
                <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                  <div className="bg-background/90 backdrop-blur-sm px-6 py-3 rounded-full text-sm font-medium">
                    Step 2 : Chat with your files
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        </section>
      </div>
    </div>
  )
}