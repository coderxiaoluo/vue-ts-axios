import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getUserInfo, userPlaylist } from '@/services/modules/user'
import type { UserProfile, Playlist, UserInfoResponse, UserPlaylistResponse } from '@/types/user'
// import { localCache } from '@/utils/localCache'
// const userid = localCache.getCache('account')
// 存储用户相关的
export const useUserStore = defineStore('user', () => {
  // 用户信息
  const userProfile = ref<UserProfile>({})

  // 用户歌单
  const userPlayList = ref<Playlist[]>([])

  const getUserInfoAction = async (id: number): Promise<UserProfile | undefined> => {
    const result = await getUserInfo(id) as UserInfoResponse
    userProfile.value = result.profile || {}
    return userProfile.value
  }

  // 获取用户歌单
  const userPlaylistAction = async (id: number): Promise<Playlist[]> => {
    const result = await userPlaylist(id) as UserPlaylistResponse
    userPlayList.value = result.playlist || []
    return userPlayList.value
  }

  return { userProfile, userPlayList, getUserInfoAction, userPlaylistAction }
})
