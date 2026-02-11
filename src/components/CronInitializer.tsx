'use client'

import { useEffect } from 'react'

export function CronInitializer() {
  useEffect(() => {
    // 在客户端启动定时任务
    const init = async () => {
      try {
        const res = await fetch('/api/cron?key=init', { method: 'GET' })
        if (res.ok) {
          console.log('[Cron] 定时任务服务已就绪')
        }
      } catch {
        // 静默失败，因为 cron 路由可能需要密钥
      }
    }
    
    init()
  }, [])

  return null
}
