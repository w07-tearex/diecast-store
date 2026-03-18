import { client } from '@/sanity/lib/client'
import imageUrlBuilder from '@sanity/image-url'

const builder = imageUrlBuilder(client)

export const urlFor = (source: any, width: number = 480, height: number = 320) =>
  builder.image(source).width(width).height(height).url()

export const urlForLarge = (source: any) => urlFor(source, 1200, 800)

// Common Tailwind classes
export const SHADOWS = {
  glow: 'drop-shadow-[0_0_15px_rgba(255,66,176,0.5)]',
  glowLarge: 'shadow-[0_0_30px_rgba(251,146,60,0.5)]',
  glowRed: 'shadow-[0_0_15px_rgba(220,38,38,0.5)]',
}

export const COLORS = {
  primary: '#FF42B0',
  primaryDark: '#D42A7B',
  dark: '#0d1117',
  darkBg: '#0b0d17',
}
