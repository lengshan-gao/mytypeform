import { ReactNode } from 'react'

interface CardProps {
  title?: string
  subtitle?: string
  children: ReactNode
  className?: string
  footer?: ReactNode
  noPadding?: boolean
}

export default function Card({
  title,
  subtitle,
  children,
  className = '',
  footer,
  noPadding = false,
}: CardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-card ${!noPadding && 'p-6'} ${className}`}>
      {(title || subtitle) && (
        <div className="mb-6">
          {title && (
            <h3 className="text-xl font-semibold text-gray-900">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-gray-600 mt-1">
              {subtitle}
            </p>
          )}
        </div>
      )}
      <div className={noPadding ? '' : 'mt-2'}>
        {children}
      </div>
      {footer && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          {footer}
        </div>
      )}
    </div>
  )
}