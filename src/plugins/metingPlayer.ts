import APlayer from 'aplayer'
import 'aplayer/dist/APlayer.min.css'

let isInstalled = false

export const installMetingPlayer = () => {
  if (typeof window === 'undefined' || isInstalled) {
    return
  }

  const playerWindow = window as unknown as Window & { APlayer: unknown }
  playerWindow.APlayer = APlayer
  isInstalled = true
  void import('meting/dist/Meting.min.js')
}
