import { useEffect, useState } from 'react'
import {
  Inspector,
  ObjectInspector,
  ObjectLabel,
  ObjectRootLabel,
} from 'react-inspector'
import cn from 'clsx'

const isPromise = (data: any): data is Promise<any> => {
  return data && typeof data.then === 'function'
}

export const NodeRenderer = ({ depth, name, data, isNonenumerable }: any) => {
  const [promisePreview, setPromisePreview] = useState<any>(null)

  useEffect(() => {
    if (isPromise(data)) {
      data
        .then((result: any) => {
          setPromisePreview(
            <ObjectInspector
              name={name}
              data={{ '<fulfilled>': result }}
              table={false}
              expandLevel={1}
              nodeRenderer={NodeRenderer}
            />
          )
        })
        .catch((error: any) => {
          setPromisePreview(
            <ObjectInspector
              name={name}
              data={{ '<rejected>': error }}
              table={false}
              expandLevel={1}
              nodeRenderer={NodeRenderer}
            />
          )
        })
    } else {
      setPromisePreview(null)
    }
  }, [data])

  if (isPromise(data)) {
    return promisePreview || <ObjectLabel name={name} data={data} />
  }

  return depth === 0 ? (
    <ObjectRootLabel name={name} data={data} />
  ) : (
    <ObjectLabel name={name} data={data} isNonenumerable={isNonenumerable} />
  )
}

export const Messages = ({
  messages,
}: {
  messages: Array<{
    from: string
    content: string
    timestamp: number
    data?: any
  }>
}) => {
  return (
    <div className='overflow-y-auto border border-gray-200 flex flex-col-reverse gap-1 tracking-normal'>
      {[...messages].reverse().map((msg, index) => (
        <div
          key={index}
          className={cn(
            'p-1.5 text-sm',
            msg.from === 'system' ? 'text-yellow-700' : '',
            index ? 'border-b border-gray-200' : ''
          )}
        >
          <div className='flex gap-2 justify-between items-center text-xs'>
            {msg.content}
            <div className='text-xs text-gray-600 flex-1 text-right select-none'>
              {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
          </div>
          {msg.data && (
            <div className='mt-1 p-2 bg-white'>
              <Inspector
                data={msg.data}
                table={false}
                expandLevel={2}
                nodeRenderer={NodeRenderer}
                shouldShowPlaceholder={false}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
