import { Metadata } from 'next'
import SeriesListClient from './SeriesListClient'

export const metadata: Metadata = {
  title: '专栏系列 - 简希博客',
  description: '技术专栏文章系列',
}

export default function SeriesPage() {
  return <SeriesListClient />
}