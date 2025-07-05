import { useState, useEffect, useCallback } from 'react'

interface UseDataWithRetryOptions {
  autoRetry?: boolean
  retryDelay?: number
  maxRetries?: number
}

interface UseDataWithRetryReturn<T> {
  data: T | null
  loading: boolean
  error: Error | null
  retry: () => Promise<void>
  refetch: () => Promise<void>
}

export function useDataWithRetry<T>(
  fetchFunction: () => Promise<T>,
  dependencies: any[] = [],
  options: UseDataWithRetryOptions = {}
): UseDataWithRetryReturn<T> {
  const { autoRetry = false, retryDelay = 2000, maxRetries = 3 } = options
  
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const executeFetch = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await fetchFunction()
      setData(result)
      setRetryCount(0) // Reset retry count on success
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error desconocido')
      setError(error)
      
      // Auto retry logic
      if (autoRetry && retryCount < maxRetries) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1)
          executeFetch()
        }, retryDelay)
      }
    } finally {
      setLoading(false)
    }
  }, [fetchFunction, autoRetry, retryDelay, maxRetries, retryCount])

  const retry = useCallback(async () => {
    setRetryCount(0)
    await executeFetch()
  }, [executeFetch])

  const refetch = useCallback(async () => {
    await executeFetch()
  }, [executeFetch])

  useEffect(() => {
    executeFetch()
  }, [...dependencies, executeFetch])

  return {
    data,
    loading,
    error,
    retry,
    refetch
  }
} 