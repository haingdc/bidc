'use client'

import { useEffect, useRef, useState } from 'react'
import { createChannel } from '../../../src'
import { Messages } from '../utils'

export default function IframePage() {
  const [messages, setMessages] = useState<
    Array<{
      from: string
      content: string
      timestamp: number
      hasPromise?: boolean
      data?: any
    }>
  >([])
  const [inputValue, setInputValue] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const channelRef = useRef<ReturnType<typeof createChannel> | null>(null)

  useEffect(() => {
    // Create channel for iframe->parent communication
    const channel = createChannel()
    channelRef.current = channel

    // Set up message receiver
    channel.receive(async (data) => {
      console.log(data)
      setMessages((prev) => [
        ...prev,
        {
          from: 'parent',
          content: data.message,
          timestamp: Date.now(),
          data,
        },
      ])
    })

    // Signal that connection is ready
    const timeout = setTimeout(async () => {
      setIsConnected(true)
      setMessages((prev) => [
        ...prev,
        {
          from: 'system',
          content: 'Connected to parent page!',
          timestamp: Date.now(),
        },
      ])
    }, 500)

    return () => {
      // Cleanup would go here if needed
      clearTimeout(timeout)
      channel.cleanup()
    }
  }, [])

  const sendMessage = async () => {
    if (!channelRef.current || !inputValue.trim()) return

    try {
      await channelRef.current.send({
        message: inputValue,
        timestamp: Date.now(),
        // Demo: Send some complex data
        metadata: {
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          randomData: Math.random(),
        },
      })
    } catch (error) {
      console.error('Failed to send message:', error)
    }

    // clear input after sending
    setInputValue('')
  }

  const sendTestData = async () => {
    if (!channelRef.current) return

    try {
      await channelRef.current.send({
        message: 'Complex data test',
        data: {
          array: [1, 2, 3, 'test'],
          nested: { deep: { value: 'nested data' } },
          date: new Date(),
          bigInt: BigInt(12345),
          map: new Map([
            ['key1', 'value1'],
            ['key2', 'value2'],
          ]),
          set: new Set([1, 2, 3, 'unique']),
          // Promise that resolves with more complex data
          asyncData: Promise.resolve({
            resolved: true,
            complexResult: { success: true, data: [1, 2, 3] },
          }),
        },
      })
    } catch (error) {
      console.error('Failed to send test data:', error)
    }
  }

  return (
    <div className='font-system p-4 h-full bg-gray-50'>
      <div className='mb-4'>
        <strong>Status:</strong>{' '}
        {isConnected ? '🟢 Connected to parent' : '🔴 Connecting...'}
      </div>

      <div className='mb-4'>
        <textarea
          rows={4}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              sendMessage()
              e.preventDefault()
            }
          }}
          placeholder='Type a message...'
          className='w-full min-h-32 p-2 text-sm font-mono border border-gray-300 bg-white disabled:opacity-50 disabled:cursor-not-allowed'
          disabled={!isConnected}
        />
        <button
          onClick={sendMessage}
          disabled={!isConnected || !inputValue.trim()}
          className='px-3 py-1.5 mr-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          Send
        </button>
        <button
          onClick={sendTestData}
          disabled={!isConnected}
          className='px-3 py-1.5 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          Send Complex Data
        </button>
      </div>

      <h3 className='m-0 mb-2.5 text-base'>Messages:</h3>
      <Messages messages={messages} />
    </div>
  )
}
