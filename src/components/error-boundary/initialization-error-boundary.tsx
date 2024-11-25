"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, RefreshCw, LifeBuoy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { initLogger } from '@/lib/initialization-logger'
import { InitializationError } from '@/types/initialization'

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
  errorId: string
}

export class InitializationErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    }
  }

  static getDerivedStateFromError(error: Error) {
    return {
      hasError: true,
      error,
      errorId: `init-${Date.now().toString(36)}`
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to our initialization logger
    initLogger.log({
      type: 'error',
      timestamp: new Date(),
      data: {
        error: {
          stage: 'initialization',
          message: error.message,
          attempt: 0,
          details: {
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            errorId: this.state.errorId
          }
        }
      }
    })

    this.setState({
      error,
      errorInfo
    })
  }

  handleRefresh = () => {
    initLogger.log({
      type: 'error',
      timestamp: new Date(),
      data: {
        error: {
          stage: 'initialization',
          message: 'User initiated refresh from error boundary',
          attempt: 0,
          details: {
            errorId: this.state.errorId
          }
        }
      }
    })
    window.location.reload()
  }

  handleSupport = () => {
    initLogger.log({
      type: 'error',
      timestamp: new Date(),
      data: {
        error: {
          stage: 'initialization',
          message: 'User requested support from error boundary',
          attempt: 0,
          details: {
            errorId: this.state.errorId
          }
        }
      }
    })
    window.location.href = '/support'
  }

  render() {
    if (this.state.hasError) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        >
          <div className="w-full max-w-md space-y-4 p-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="space-y-4"
            >
              <div className="text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
                <h1 className="mt-4 text-2xl font-bold">Initialization Error</h1>
                <p className="mt-2 text-muted-foreground">
                  An unexpected error occurred while initializing the application.
                </p>
              </div>

              <Alert variant="destructive" className="mt-4">
                <AlertTitle>Error Details</AlertTitle>
                <AlertDescription>
                  <div className="mt-2 space-y-2">
                    <p className="font-mono text-sm">
                      {this.state.error?.message}
                    </p>
                    {process.env.NODE_ENV === 'development' && (
                      <details className="mt-4">
                        <summary className="cursor-pointer text-sm">
                          Stack Trace
                        </summary>
                        <pre className="mt-2 max-h-48 overflow-auto rounded bg-destructive/10 p-2 text-xs">
                          {this.state.error?.stack}
                        </pre>
                      </details>
                    )}
                  </div>
                </AlertDescription>
              </Alert>

              <div className="mt-6 space-y-2">
                <Button
                  variant="default"
                  className="w-full"
                  onClick={this.handleRefresh}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Page
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={this.handleSupport}
                >
                  <LifeBuoy className="mr-2 h-4 w-4" />
                  Contact Support
                </Button>
              </div>

              <p className="text-center text-xs text-muted-foreground">
                Error ID: {this.state.errorId}
              </p>
            </motion.div>
          </div>
        </motion.div>
      )
    }

    return this.props.children
  }
}