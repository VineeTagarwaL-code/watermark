"use client";

import { ArrowRight, Star, Zap } from "lucide-react";

import { AnimatedGradient } from "@/components/ui/animated-gradient";
import { Button } from "@/components/ui/button";
import { GitHubStarButton } from "@/components/GitHubStarButton";
import Image from "next/image";
import ImageUpload from "@/components/ImageUpload";
import { TweetComponent } from "@/components/TweetComponent";
import { motion } from "framer-motion";

// Animation variants for staggered animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-950 dark:to-neutral-900">
      {/* GitHub Star Button (Fixed) */}
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-neutral-900/[0.02] dark:bg-grid-neutral-100/[0.02] -z-10" />
        <div className="container px-4 py-6 sm:py-12 mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center text-center max-w-3xl mx-auto"
          >
              <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="backdrop-blur-sm bg-white/30 dark:bg-black/30 rounded-full p-1 mb-4"
            >
              <GitHubStarButton />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center px-3 py-1 mb-6 text-sm font-medium rounded-full bg-primary/10 text-primary"
            >
              <Zap className="w-4 h-4 mr-1" /> AI-Powered Watermark Removal
            </motion.div>
          
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-neutral-900 to-neutral-600 dark:from-white dark:to-neutral-400"
            >
              Remove Watermarks in Seconds
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-300 max-w-2xl"
            >
              Our advanced AI technology removes watermarks from your images
              while preserving the original quality. No technical skills
              required.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="container mx-auto mt-2"
            >
              <div className="rounded-2xl shadow-xl overflow-hidden">
                <div className="p-2 sm:p-8">
                  <ImageUpload />
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex items-center justify-center gap-2 text-sm text-neutral-500 dark:text-neutral-400 mb-8"
            >
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="w-4 h-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <span>Trusted by 500+ users worldwide</span>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container px-4 mx-auto py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
            Our advanced AI technology makes watermark removal simple and
            effective
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -5, boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
            className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 flex flex-col items-center text-center"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <span className="text-primary font-bold">1</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Upload Your Image</h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              Simply drag and drop or click to upload the image with watermarks
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ y: -5, boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
            className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 flex flex-col items-center text-center"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <span className="text-primary font-bold">2</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">AI Processing</h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              Our AI analyzes and removes watermarks while preserving image
              quality
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ y: -5, boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
            className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 flex flex-col items-center text-center"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <span className="text-primary font-bold">3</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Download Result</h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              Get your clean, watermark-free image in seconds, ready to use
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Before and After Section */}
      <div className="bg-neutral-50 dark:bg-neutral-900/50 py-16 sm:py-24">
        <div className="container px-4 mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              See the Magic
            </h2>
            <p className="text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
              Check out these impressive before and after results
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-4 group"
            >
              <div className="relative aspect-square rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-lg transition-all duration-300 group-hover:shadow-xl">
                <div className="absolute top-4 left-4 bg-black/70 text-white text-xs px-3 py-1 rounded-full z-10">
                  Before
                </div>
                <Image
                  src="/before-generated.png"
                  alt="Before - Image with Watermark"
                  fill
                  className="object-contain transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-4 group"
            >
              <div className="relative aspect-square rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-lg transition-all duration-300 group-hover:shadow-xl">
                <div className="absolute top-4 left-4 bg-primary/90 dark:bg-gray-500 dark:text-white text-xs px-3 py-1 rounded-full z-10">
                  After
                </div>
                <Image
                  src="/after-generated.png"
                  alt="After - Clean Image"
                  fill
                  className="object-contain transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex justify-center mt-12"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Button size="lg" className="px-8 rounded-full">
                Try It Yourself <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="container px-4 mx-auto py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Real User Feedback
          </h2>
          <p className="text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
            See what people are saying about our watermark removal tool
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <TweetComponent id="1901485989249601622" />
          <TweetComponent id="1901512800633258222" />
          <TweetComponent id="1901494407964274749" />
          <TweetComponent id="1901631964907708650" />
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-neutral-50 dark:bg-neutral-900/50 py-16 sm:py-24">
        <div className="container px-4 mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
              Everything you need to know about our watermark removal tool
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="max-w-3xl mx-auto space-y-6"
          >
            {[
              {
                question: "How does the watermark removal work?",
                answer:
                  "Our AI technology analyzes the image to identify watermarks and then intelligently removes them while preserving the original image quality and details.",
              },
              {
                question: "What types of watermarks can be removed?",
                answer:
                  "Our tool can remove most types of watermarks including text, logos, signatures, and transparent overlays from images.",
              },
              {
                question: "Is there a limit to how many images I can process?",
                answer:
                  "The free version allows you to process up to 5 images per day. For unlimited usage, check out our premium plans.",
              },
              {
                question: "What image formats are supported?",
                answer:
                  "We support all common image formats including JPG, PNG, and JPEG. The maximum file size is 10MB per image.",
              },
            ].map((faq, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-neutral-200 dark:border-neutral-800"
              >
                <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  {faq.answer}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container px-4 mx-auto py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="rounded-2xl p-0 text-center max-w-4xl mx-auto overflow-hidden"
        >
          <AnimatedGradient className="bg-gradient-to-r from-primary/20 to-primary/10 dark:from-primary/10 dark:to-primary/5 p-8 sm:p-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to Remove Watermarks?
            </h2>
            <p className="text-neutral-600 dark:text-neutral-300 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied users and transform your images today.
              No credit card required.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Button size="lg" className="px-8 rounded-full">
                Get Started Now <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </motion.div>
          </AnimatedGradient>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800 py-12">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <p className="text-neutral-500 dark:text-neutral-400">
                © 2024 Watermark Remover. All rights reserved.
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <a
                href="https://twitter.com/vineetwts"
                className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                Created by vineetwts
              </a>
              <a
                href="#"
                className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
