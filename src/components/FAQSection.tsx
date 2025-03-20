import { useState } from "react";
import { Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type FAQItem = {
  question: string;
  answer: string;
};

const faqs: FAQItem[] = [
  {
    question: "What is Summelio?",
    answer:
      "A tool that allows you to upload PDFs and Web Pages and interact with them through an AI-powered chatbot.",
  },
  {
    question: "What file types are supported?",
    answer:
      "Currently, we support: PDFs and Web pages. Future support will include: Audio, Word, PowerPoint and Excel",
  },
  {
    question: "How does the AI chatbot work?",
    answer:
      "It uses AI technologies like embeddings and NLP to understand your content and engage with you and answering questions.",
  },
  {
    question: "Do I need to install anything?",
    answer:
      "No, it’s completely web-based. Just sign up, upload your content, and start interacting.",
  },
  {
    question: "Is my data secure?",
    answer: "Yes, your files are encrypted and stored securely.",
  },
  {
    question: "Can I get support?",
    answer: "Yes, our support team is available via email or our portal.",
  },
  {
    question: "What’s the pricing?",
    answer: "We offer flexible plans. Check our Pricing page for details.",
  },
];

const FAQSection = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section id="faq">
      <div className="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto bg-gray-50">
        <div className="max-w-2xl mx-auto text-center mb-10 lg:mb-14">
          <h2 className="text-2xl font-bold md:text-4xl md:leading-tight">
            Your questions, answered
          </h2>
          <p className="mt-1 text-gray-600">
            Answers to the most frequently asked questions.
          </p>
        </div>
        <div className="max-w-2xl mx-auto">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`rounded-xl p-6 mb-4 transition ${activeIndex === index ? "bg-indigo-100" : "bg-gray-100"
                }`}
            >
              <button
                onClick={() => toggleAccordion(index)}
                className="pb-3 inline-flex items-center justify-between gap-x-3 w-full md:text-lg font-semibold text-start text-indigo-600 rounded-lg transition hover:text-indigo-500 focus:outline-none"
              >
                {faq.question}
                <Plus className="w-6 h-6 text-gray-600" />
              </button>
              <AnimatePresence initial={false}>
                {activeIndex === index && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="text-gray-800">{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
