// 服务器启动时自动启动定时任务
import { startScheduler } from './index'

let initialized = false

export function autoStartScheduler() {
  if (initialized) {
    return
  }
  
  // 只在服务器端执行
  if (typeof window !== 'undefined') {
    return
  }
  
  try {
    console.log('[AutoStart] 正在启动定时任务...')
    const result = startScheduler()
    if (result.success) {
      console.log('[AutoStart] 定时任务启动成功')
      initialized = true
    } else {
      console.log('[AutoStart] 定时任务启动失败:', result.message)
    }
  } catch (error) {
    console.error('[AutoStart] 启动失败:', error)
  }
}

// 立即执行（模块加载时）
autoStartScheduler()
