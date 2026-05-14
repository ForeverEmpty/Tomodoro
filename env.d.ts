/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ROUTER_HISTORY?: 'hash' | 'history'
}

declare module 'aplayer' {
  const APlayer: unknown
  export default APlayer
}

declare module 'meting/dist/Meting.min.js'
