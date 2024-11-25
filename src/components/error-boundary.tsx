"use client"

import React from 'react'
import { ErrorUtils } from '@/lib/error-utils'
import { Button } from '@/components/ui/button'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
  onReset?: () => void
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    ErrorUtils.reportError(error, {
      context: {
        componentStack: errorInfo.componentStack,
      },
    })
  }

  handleReset = () => {
    this.props.onReset?.()
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 text-center">
          <div className="rounded-full bg-red-100 p-3">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-bold tracking-tight">
              Something went wrong
            </h2>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <p className="text-sm text-muted-foreground">
                {this.state.error.message}
              </p>
            )}
          </div>

          <div className="flex space-x-4">
            <Button onClick={this.handleReset}>
              Try again
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
            >
              Reload page
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            If the problem persists, please try refreshing the page or contact support.
          </p>
        </div>
      )
    }

    return this.props.children
  }
}

export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}

export default ErrorBoundary
