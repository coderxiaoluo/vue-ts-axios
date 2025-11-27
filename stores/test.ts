import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { UserProfile } from '@/types/user'
import { userLogin } from '@/services/modules/test'
const useTestStore = defineStore('test', () => {
  const userInfo = ref<UserProfile>({})

  // 登录
  function login(username: string, password: string) {
    return userLogin(username, password)
  }

  return { userInfo, login }
})