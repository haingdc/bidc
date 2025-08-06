'use client'

import { useEffect, useRef, useState } from 'react'

import { createChannel } from '../../src'
import { Messages } from './utils'

const defaultCode = `\
{
  message: 'Hello from parent!',
  delayedData: new Promise(
    resolve => setTimeout(() => resolve('Delayed data'), 2000)
  ),
  log: (data) => console.log('hi', data),
}`

export default function Home() {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [messages, setMessages] = useState<
    Array<{ from: string; content: string; timestamp: number; data?: any }>
  >([])
  const [inputValue, setInputValue] = useState(defaultCode)

  const [isConnected, setIsConnected] = useState(false)
  const channelRef = useRef<ReturnType<typeof createChannel> | null>(null)

  useEffect(() => {
    if (!iframeRef.current) return
    if (!iframeRef.current.contentWindow) return

    // Create channel for parent->iframe communication
    const channel = createChannel(iframeRef.current.contentWindow)
    channelRef.current = channel

    const timeout = setTimeout(async () => {
      // Set up message receiver
      await channel.receive((data) => {
        setMessages((prev) => [
          ...prev,
          {
            from: 'iframe',
            content: 'Received data from iframe',
            timestamp: Date.now(),
            data: data,
          },
        ])
      })

      setIsConnected(true)
      setMessages((prev) => [
        ...prev,
        {
          from: 'system',
          content: 'Connection established with iframe',
          timestamp: Date.now(),
        },
      ])
    }, 500)

    return () => {
      clearTimeout(timeout)
      channel.cleanup()
    }
  }, [])

  const sendMessage = async () => {
    if (!channelRef.current || !inputValue.trim()) return

    try {
      const data = new Function(`return ${inputValue}`)()

      // Demo: Send a promise that resolves after 2 seconds
      await channelRef.current.send(data)
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  return (
    <div className='p-2 max-w-screen-xl'>
      <h1 className='font-medium'>
        JavaScript Bidirectional Channel (BIDC) Demo
      </h1>
      <p>
        This demonstrates bidirectional communication between parent page and
        iframe using the BIDC library.
      </p>

      <div className='flex gap-5 h-[600px]'>
        {/* Parent controls */}
        <div className='flex-1'>
          <h2>Current Page</h2>
          <div className='mb-4'>
            <strong>Status:</strong>{' '}
            {isConnected ? '🟢 Connected to iframe' : '🔴 Connecting...'}
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
              placeholder='Enter a JavaScript value...'
              className='w-full min-h-48 p-2 border font-mono text-sm border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed tracking-normal outline-none active:border-gray-400 focus:border-gray-500 resize-none'
              disabled={!isConnected}
            />
            <button
              onClick={sendMessage}
              disabled={!isConnected || !inputValue.trim()}
              className='px-4 py-2 bg-black text-white rounded hover:bg-black/80 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              Send data to iframe
            </button>
          </div>

          <h3 className='my-2 font-medium'>Messages</h3>
          <Messages messages={messages} />
        </div>

        {/* Iframe */}
        <div className='flex-1 border border-gray-300 overflow-hidden'>
          <div className='p-2 bg-gray-100 border-b border-gray-300 flex justify-between items-center'>
            <h2 className='m-0 text-base font-normal'>Iframe Content</h2>
            <button
              className='px-2 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300'
              onClick={() => {
                if (iframeRef.current) {
                  iframeRef.current.contentWindow?.location.reload()
                }
              }}
            >
              Reload iframe
            </button>
          </div>
          <iframe
            ref={iframeRef}
            src='/iframe'
            className='w-full h-full border-0'
            title='BIDC Demo Iframe'
          />
        </div>
      </div>
    </div>
  )
}
