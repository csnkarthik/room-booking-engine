'use client'

import { useRef, useEffect, useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ImageGalleryProps {
  images: string[]
  roomName: string
  className?: string
}

export function ImageGallery({ images, roomName, className }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const stripRef = useRef<HTMLDivElement>(null)

  const prev = () => setActiveIndex((i) => (i === 0 ? images.length - 1 : i - 1))
  const next = () => setActiveIndex((i) => (i === images.length - 1 ? 0 : i + 1))

  // Keep active thumbnail scrolled into view
  useEffect(() => {
    const strip = stripRef.current
    if (!strip) return
    const thumb = strip.children[activeIndex] as HTMLElement | undefined
    thumb?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [activeIndex])

  return (
    <>
      {/* Main image */}
      <div
        className={cn(
          'group relative aspect-[16/9] w-full overflow-hidden sm:rounded-xl',
          className
        )}
      >
        <div
          className="absolute inset-0 cursor-zoom-in"
          onClick={() => setLightboxOpen(true)}
          aria-label={`Open ${roomName} gallery`}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setLightboxOpen(true)}
        >
          <Image
            src={images[activeIndex]}
            alt={`${roomName} - view ${activeIndex + 1}`}
            fill
            className="object-cover transition-all duration-500"
            sizes="(max-width: 768px) 100vw, 66vw"
            priority
          />
        </div>

        {/* Counter badge */}
        <div className="pointer-events-none absolute right-3 bottom-3 rounded bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
          {activeIndex + 1} / {images.length}
        </div>

        {/* Prev / Next arrows — visible on hover */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Previous image"
              className="absolute top-1/2 left-3 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white opacity-70 transition-opacity hover:bg-black/70 sm:opacity-0 sm:group-hover:opacity-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={next}
              aria-label="Next image"
              className="absolute top-1/2 right-3 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white opacity-70 transition-opacity hover:bg-black/70 sm:opacity-0 sm:group-hover:opacity-100"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail strip — all images, auto-scrolls to active */}
      <div
        ref={stripRef}
        className="mt-2 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {images.map((src, i) => (
          <button
            key={src}
            onClick={() => setActiveIndex(i)}
            aria-label={`View ${roomName} image ${i + 1}`}
            className={cn(
              'relative h-16 w-24 shrink-0 cursor-pointer overflow-hidden rounded transition-opacity sm:h-20 sm:w-32',
              i === activeIndex
                ? 'opacity-100 ring-2 ring-[#006F62] ring-offset-1'
                : 'opacity-60 hover:opacity-100'
            )}
          >
            <Image
              src={src}
              alt={`${roomName} - thumbnail ${i + 1}`}
              fill
              className="object-cover"
              sizes="128px"
            />
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

          <div className="relative h-[90vh] w-[95vw] sm:h-[80vh] sm:w-[80vw]">
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

          {/* Counter + dots */}
          <div className="absolute bottom-4 flex flex-col items-center gap-2">
            <div className="flex gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  aria-label={`Go to image ${i + 1}`}
                  className={cn(
                    'h-1.5 cursor-pointer rounded-full transition-all',
                    i === activeIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/40'
                  )}
                />
              ))}
            </div>
            <span className="text-xs font-medium text-white/60">
              {activeIndex + 1} / {images.length}
            </span>
          </div>
        </div>
      )}
    </>
  )
}
