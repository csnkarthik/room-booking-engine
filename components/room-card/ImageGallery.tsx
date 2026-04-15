'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ImageGalleryProps {
  images: string[]
  roomName: string
}

export function ImageGallery({ images, roomName }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const prev = () => setActiveIndex((i) => (i === 0 ? images.length - 1 : i - 1))
  const next = () => setActiveIndex((i) => (i === images.length - 1 ? 0 : i + 1))

  return (
    <>
      {/* Main gallery grid */}
      <div className="grid grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-2xl">
        {/* Primary large image */}
        <button
          className="relative col-span-2 row-span-2 cursor-zoom-in overflow-hidden"
          onClick={() => {
            setActiveIndex(0)
            setLightboxOpen(true)
          }}
          aria-label={`View ${roomName} image 1`}
        >
          <Image
            src={images[0]}
            alt={`${roomName} - main view`}
            fill
            className="object-cover transition-transform duration-500 hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </button>

        {/* Thumbnail images */}
        {images.slice(1, 5).map((src, i) => (
          <button
            key={src}
            className="relative aspect-square cursor-zoom-in overflow-hidden"
            onClick={() => {
              setActiveIndex(i + 1)
              setLightboxOpen(true)
            }}
            aria-label={`View ${roomName} image ${i + 2}`}
          >
            <Image
              src={src}
              alt={`${roomName} - view ${i + 2}`}
              fill
              className="object-cover transition-transform duration-500 hover:scale-105"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
            {i === 3 && images.length > 5 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <span className="text-lg font-semibold text-white">+{images.length - 5} more</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
          onClick={(e) => e.target === e.currentTarget && setLightboxOpen(false)}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/10"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close lightbox"
          >
            <X className="h-6 w-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1/2 left-4 -translate-y-1/2 text-white hover:bg-white/10"
            onClick={prev}
            aria-label="Previous image"
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>

          <div className="relative h-[80vh] w-[80vw]">
            <Image
              src={images[activeIndex]}
              alt={`${roomName} - image ${activeIndex + 1}`}
              fill
              className="object-contain"
              sizes="80vw"
            />
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1/2 right-4 -translate-y-1/2 text-white hover:bg-white/10"
            onClick={next}
            aria-label="Next image"
          >
            <ChevronRight className="h-8 w-8" />
          </Button>

          {/* Dots */}
          <div className="absolute bottom-4 flex gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                aria-label={`Go to image ${i + 1}`}
                className={cn(
                  'h-2 w-2 rounded-full transition-colors',
                  i === activeIndex ? 'bg-white' : 'bg-white/40'
                )}
              />
            ))}
          </div>
        </div>
      )}
    </>
  )
}
