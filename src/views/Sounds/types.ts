export interface PlatformCategory {
  id: string
  name: string
  source: string
  count: number
  trackIds?: string[]
  hotboardType?: HotboardType
}

export interface Playlist {
  id: string
  name: string
  count: number
  trackIds: string[]
  hotTracks?: PlaylistHotTrack[]
}

export interface PlaylistHotTrack {
  id: string
  title: string
  artist: string
  auto: string
  cover?: string
  durationText?: string
  metingId?: string
  server?: 'netease' | 'tencent'
  source?: HotboardType
  type?: 'song'
}

export interface MusicListView {
  id: string
  name?: string
  source?: string
}

export type HotboardType = 'netease-music' | 'qq-music'

export interface HotMusicItem {
  index: number
  title: string
  url: string
  cover?: string
  hot_value?: string
  extra?: {
    album?: string
    artist_names?: string
    duration_text?: string
    id?: number | string
    last_rank?: number
    mv_vid?: string
    popularity?: number
    songid?: number | string
    songmid?: string
  }
}

export interface HotboardResponse {
  type: HotboardType
  update_time: string
  list: HotMusicItem[]
}
