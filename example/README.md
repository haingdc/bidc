# BIDC Next.js Demo

This is a minimal Next.js application demonstrating the **BIDC (Bidirectional Channel)** library in a parent/iframe setup.

## Features Demonstrated

- ✅ **Bidirectional Communication**: Messages flow seamlessly between parent page and iframe
- ✅ **Promise Support**: Send and receive data containing promises that resolve asynchronously
- ✅ **Complex Data Types**: Support for Map, Set, BigInt, Date, nested objects, and arrays  
- ✅ **Real-time Updates**: Live connection status and message history
- ✅ **Error Handling**: Graceful handling of connection issues and promise rejections

## Getting Started

1. **Install dependencies:**
   ```bash
   cd example
   npm install
   # or
   pnpm install
   ```

2. **Build the parent BIDC library:**
   ```bash
   cd ..
   pnpm build
   ```

3. **Run the development server:**
   ```bash
   cd example
   npm run dev
   # or
   pnpm dev
   ```

4. **Open the demo:**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

### Parent Page (`pages/index.tsx`)
- Creates an iframe pointing to `/iframe`
- Establishes a bidirectional channel using `createChannel('parent-iframe-demo', iframe.contentWindow)`
- Sends messages with promises that resolve after 2 seconds
- Displays all communication in real-time

### Iframe Page (`pages/iframe.tsx`)  
- Creates a bidirectional channel using `createChannel('parent-iframe-demo')` (no target needed in iframe context)
- Receives messages from parent and handles promise resolution
- Sends complex data including Maps, Sets, BigInt, and nested promises
- Shows promise resolution progress

### Key BIDC Features Showcased

1. **Context Detection**: Library automatically detects iframe context and uses `window.parent` for communication

2. **Promise Serialization**: Promises are serialized and sent as separate chunks when they resolve:
   ```typescript
   // This promise will be sent when it resolves
   delayedResponse: new Promise(resolve => 
     setTimeout(() => resolve(`Delayed response: "${message}"`), 2000)
   )
   ```

3. **Complex Data Support**: All serializable types work seamlessly:
   ```typescript
   data: {
     map: new Map([['key1', 'value1']]),
     set: new Set([1, 2, 3]),
     bigInt: BigInt(12345),
     date: new Date(),
     asyncData: Promise.resolve({ success: true })
   }
   ```

4. **Concurrent Messages**: Multiple messages can be sent simultaneously with unique IDs

## Code Structure

```
example/
├── pages/
│   ├── index.tsx     # Parent page with iframe
│   ├── iframe.tsx    # Iframe content
│   └── _app.tsx      # Next.js app wrapper
├── package.json      # Dependencies and scripts
├── tsconfig.json     # TypeScript configuration
└── next.config.js    # Next.js configuration
```

## Learn More

- [BIDC Library Documentation](../README.md)
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)