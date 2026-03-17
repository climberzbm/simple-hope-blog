import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 mt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Simple Hope Blog. All rights reserved.
          </div>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="/rss" className="hover:text-blue-600">RSS</Link>
            <a href="https://github.com/climberzbm" target="_blank" rel="noopener" className="hover:text-blue-600">
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}