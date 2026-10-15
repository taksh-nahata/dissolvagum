"use client";

import { motion } from "framer-motion";
import { BookOpen, Users, Lightbulb } from "lucide-react";

const OurStory = () => {
  return (
    <motion.section 
      className="py-12 md:py-16 bg-white dark:bg-gray-800/50 rounded-xl shadow-lg mb-12 md:mb-16"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.1 }}
    >
      <div className="container mx-auto px-6">
      <div className="text-center mb-10 md:mb-12">
        <BookOpen className="mx-auto text-teal-500 dark:text-teal-400 mb-4" size={48} />
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">Our Story</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mt-2 max-w-2xl mx-auto">
        The journey of DissolvaGum: from a simple idea to a revolutionary product.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-center">
        {/* Founder's Inspiration Story */}
        <motion.div
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
        >
        <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-lg shadow-md">
          <Lightbulb className="text-yellow-500 mb-3" size={32} />
          <h3 className="text-2xl font-semibold mb-3 text-gray-700 dark:text-white">The Spark of Innovation</h3>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
          "It all started at school," recalls Taksh Nahata. "Seeing gum stuck everywhere, including on my shoe, I realized this was a problem that needed solving. That moment sparked the idea for DissolvaGum."
          </p>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mt-3">
          That frustration became the idea for DissolvaGum: a gum designed to be safe to swallow, so it leaves no mess behind. It is still in development.
          </p>
        </div>
        </motion.div>

        {/* Show download.jpg instead of timeline */}
        <motion.div
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        >
        <div className="flex justify-center items-center bg-teal-50 dark:bg-teal-900/50 p-6 rounded-lg shadow-md h-full">
          <img
          src="/download.jpg"
          alt="DissolvaGum"
          className="rounded-lg max-h-80 object-contain"
          />
        </div>
        </motion.div>
      </div>
      </div>
    </motion.section>
  );
};

export default OurStory;

