'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function EschoolDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { id: string }
}) {
  const pathname = usePathname()
  const eschoolId = params.id

  const navigation = [
    { name: 'Detail', href: `/eschool/${eschoolId}` },
    { name: 'Anggota', href: `/eschool/${eschoolId}/members` },
    { name: 'Peran', href: `/eschool/${eschoolId}/roles` },
  ]

  return (
    <div>
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                pathname === item.href
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-6">
        {children}
      </div>
    </div>
  )
}