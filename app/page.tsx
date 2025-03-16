import Image from "next/image"
import ImageUpload from "../components/ImageUpload"
export default function Home() {
  return (
    <main className="min-h-screen p-4 sm:p-6 md:p-8 bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-950 dark:to-neutral-900">
      <div className="max-w-4xl mx-auto mt-8 sm:mt-12 md:mt-20">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 text-center">Fuck Watermarks</h1>
        <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400 text-center mb-6 sm:mb-8 max-w-2xl mx-auto">
          Remove watermarks from images with ease without giving any fucks
        </p>
        <div className="px-4 sm:px-6 md:px-0">
          <ImageUpload />
        </div>
      </div>

      {/* Before and After Section */}
      <div className="max-w-4xl mx-auto mt-16 sm:mt-20">
        <h2 className="text-xl sm:text-2xl font-semibold text-center mb-8">See the Magic</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="relative aspect-square rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800">
              <Image 
                src="/tiling.jpg" 
                alt="Before - Image with Watermark" 
                fill
                  className="object-contain"
              />
            </div>
            <p className="text-center text-sm font-medium text-neutral-500 dark:text-neutral-400">
              Before
            </p>
          </div>
          <div className="space-y-4">
            <div className="relative aspect-square rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800">
              <Image 
                src="/generated-image.png" 
                alt="After - Clean Image" 
                fill
                className="object-contain"
              />
            </div>
            <p className="text-center text-sm font-medium text-neutral-500 dark:text-neutral-400">
              After
            </p>
          </div>
        </div>
      </div>

      <footer className="mt-12 sm:mt-16 md:mt-20">
        <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400 text-center">
          Made with no fucks given by{" "}
          <a 
            href="https://twitter.com/vineetwts" 
            className="underline hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            vineetwts
          </a>
        </p>
      </footer>
    </main>
  )
}

