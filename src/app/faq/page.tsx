"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { motion } from 'framer-motion';
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const faqData = [
	{
		question: "What is DissolvaGum?",
		answer: "DissolvaGum is a startup founded by four high school students in Folsom, California. We are designing a chewing gum that is safe to swallow once you finish chewing, so it never becomes litter.",
	},
	{
		question: "Can I buy it?",
		answer: "No. DissolvaGum is a concept in early research and development, and nothing is for sale. This site exists to show the idea and to hear from people who are interested.",
	},
	{
		question: "Why not just throw gum away?",
		answer: "A lot of it ends up on sidewalks instead. Conventional gum base is a plastic-like polymer that does not break down, and even chicle-based gums can take months to years.",
	},
	{
		question: "What does \"designed to be safe to swallow\" mean?",
		answer: "The spent gum is meant to be digestible and biodegradable. These are design goals we are working toward, not proven results.",
	},
	{
		question: "How long would it take to break down?",
		answer: "Our target is about 30 days. We have not reached it yet.",
	},
	{
		question: "How can I help?",
		answer: "Fill in the support interest form, or the business interest form if you represent a company. You can also reach the team through the contact page.",
	},
];

export default function FAQPage() {
	return (
		<div className="flex flex-col min-h-screen">
			<Header />
			<main className="flex-grow container mx-auto px-4 py-12 md:py-20">
				<motion.h1
					className="font-glacial-indifference-bold text-4xl md:text-5xl font-bold text-center mb-12 text-gray-800 dark:text-white"
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
				>
					Frequently Asked Questions
				</motion.h1>

				<div className="max-w-3xl mx-auto">
					<Accordion type="single" collapsible className="w-full space-y-4">
						{faqData.map((item, index) => (
							<motion.div
								key={index}
								initial={{ opacity: 0, x: -20 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ duration: 0.3, delay: index * 0.1 }}
							>
								<AccordionItem
									value={`item-${index}`}
									className="border dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
								>
									<AccordionTrigger className="font-glacial-indifference-bold text-lg p-6 text-left text-gray-700 dark:text-gray-200 hover:no-underline">
										{item.question}
									</AccordionTrigger>
									<AccordionContent className="p-6 pt-0 text-gray-600 dark:text-gray-400">
										{item.answer}
									</AccordionContent>
								</AccordionItem>
							</motion.div>
						))}
					</Accordion>
				</div>
			</main>
			<Footer />
		</div>
	);
}

// Ensure font-glacial-indifference-bold is defined in your globals.css or tailwind.config.js
