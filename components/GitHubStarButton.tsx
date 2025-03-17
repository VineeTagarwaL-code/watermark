"use client"

import { motion, useAnimation } from "framer-motion"
import { useEffect, useState } from "react"

import { Star } from "lucide-react"
import { getGitHubRepoStats } from "@/lib/github"

export function GitHubStarButton() {
  const [stars, setStars] = useState<number | null>(null)
  const [isHovered, setIsHovered] = useState(false)
  const controls = useAnimation()
  const starIconControls = useAnimation()

  useEffect(() => {
    async function fetchStars() {
      try {
        const stats = await getGitHubRepoStats("VineeTagarwaL-code", "watermark")
        setStars(stats.stars)
        
        // Initial animation sequence
        controls.start({ opacity: 1, y: 0, scale: 1 })
        
        // Attention animation after stars are loaded
        setTimeout(async () => {
          await controls.start({ scale: 1.1, transition: { duration: 0.3 } })
          await controls.start({ scale: 1, transition: { duration: 0.2 } })
          await controls.start({ scale: 1.05, transition: { duration: 0.2 } })
          await controls.start({ scale: 1, transition: { duration: 0.2 } })
          
          // Star icon animation
          await starIconControls.start({ 
            rotate: [0, 15, -15, 0],
            scale: [1, 1.2, 1.2, 1],
            transition: { duration: 1 }
          })
        }, 1500)
      } catch (error) {
        console.error('Error fetching GitHub stars:', error)
        controls.start({ opacity: 1, y: 0 }) // Show button even on error
      }
    }
    
    fetchStars()
  }, [controls, starIconControls])

  return (
    <motion.a
      href="https://github.com/VineeTagarwaL-code/watermark"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center px-3 py-1.5 rounded-full bg-white dark:bg-neutral-800 shadow-md border border-neutral-200 dark:border-neutral-700 text-sm font-medium text-neutral-700 dark:text-neutral-200 transition-all"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ 
        scale: 1.05,
        boxShadow: "0 8px 20px rgba(0,0,0,0.1)"
      }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: -20 }}
      animate={controls}
    >
      <motion.div 
        className="flex items-center gap-1.5"
        animate={isHovered ? { gap: "8px" } : { gap: "6px" }}
      >
        <motion.div animate={starIconControls}>
          <Star className={`w-4 h-4 ${isHovered ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-700 dark:text-neutral-300'}`} />
        </motion.div>
        <span>Star on GitHub</span>
        {stars !== null && (
          <motion.div 
            className="bg-neutral-100 dark:bg-neutral-700 rounded-full px-2 py-0.5 text-xs font-semibold"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            {stars}
          </motion.div>
        )}
      </motion.div>
    </motion.a>
  )
} 