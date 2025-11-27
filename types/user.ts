// API请求参数类型定义
export interface UserAccountParams {
  cookie: string;
  timestamp?: number;
  withCredentials?: boolean;
}

export interface UserInfoParams {
  uid: number;
}

export interface UserPlaylistParams {
  uid: number;
}

export interface UserLoginIPParams {
  ip: number;
}

// 用户信息类型定义
export interface UserProfile {
  // 基本信息
  userId?: number;
  nickname?: string;
  avatarUrl?: string;
  backgroundUrl?: string;
  signature?: string;
  gender?: number; // 性别 0:未知 1:男 2:女
  birthday?: number;
  province?: number;
  city?: number;
  country?: string;

  // 统计信息
  followeds?: number; // 粉丝数
  follows?: number; // 关注数
  level?: number;
  listenSongs?: number;
  createTime?: number;

  // 扩展信息
  detailDescription?: string;
  description?: string;
  userType?: number;
  mutual?: boolean;

  // 等级信息
  vipType?: number;
  vipRights?: {
    redVipLevel?: number;
    redVipAnnualCount?: number;
    musicPackageLevel?: number;
  };
}

// 歌曲类型定义
export interface Song {
  id?: number;
  name?: string;
  artists?: Array<{
    id?: number;
    name?: string;
    picUrl?: string;
  }>;
  album?: {
    id?: number;
    name?: string;
    picUrl?: string;
  };
  duration?: number;
  mv?: number;
}

// 歌单类型定义
export interface Playlist {
  id?: number;
  name?: string;
  coverImgUrl?: string;
  description?: string;
  creator?: {
    userId?: number;
    nickname?: string;
    avatarUrl?: string;
  };
  trackCount?: number;
  playCount?: number;
  trackUpdateTime?: number;
  createTime?: number;
  updateTime?: number;
  specialType?: number;
  userId?: number;
  // 歌单中的歌曲列表
  tracks?: Song[];
}

// 用户 API 响应类型
export interface UserInfoResponse {
  profile?: UserProfile;
  account?: {
    id?: number;
    userName?: string;
    vipType?: number;
    createTime?: number;
  };
  bindings?: any[];
  code?: number;
}

// 用户歌单 API 响应类型
export interface UserPlaylistResponse {
  playlist?: Playlist[];
  code?: number;
}