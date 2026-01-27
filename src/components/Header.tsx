import { ExternalLink } from 'lucide-react'
import DarkModeToggle from './DarkModeToggle'

interface Link {
  title: string
  url: string
}

interface HeaderProps {
  links?: Link[]
}

export default function Header({ links }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm w-full overflow-x-hidden">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <img
                src="/enderlink.png"
                alt="EnderLink"
                className="w-8 h-8 object-contain"
              />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">EnderLink</h1>
            </div>
            {links && links.length > 0 && (
              <div className="hidden md:flex items-center gap-2 ml-4">
                {links.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 mr-1.5" />
                    {link.title}
                  </a>
                ))}
              </div>
            )}
          </div>
          <DarkModeToggle />
        </div>
      </nav>
    </header>
  )
}
