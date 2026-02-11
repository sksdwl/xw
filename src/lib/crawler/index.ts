// 定时任务管理器
// 注意：由于 Next.js 的开发环境会频繁重新加载，定时任务在开发模式下可能不会持续运行
// 生产环境建议使用 Vercel Cron 或外部定时服务调用 /api/cron

let isRunning = false
let lastRunTime: Date | null = null
let lastResult: any = null

// 执行同步任务
async function runSyncTask() {
  if (isRunning) {
    console.log('[Scheduler] 上一次任务仍在运行，跳过本次执行')
    return
  }
  
  isRunning = true
  console.log('[Scheduler] 开始执行同步任务', new Date().toISOString())
  
  try {
    const { syncAll } = await import('./sync')
    lastResult = await syncAll()
    lastRunTime = new Date()
    console.log('[Scheduler] 同步任务完成', lastRunTime.toISOString())
  } catch (error) {
    console.error('[Scheduler] 同步任务失败:', error)
  } finally {
    isRunning = false
  }
}

// 启动定时任务
export function startScheduler() {
  // 注意：node-cron 在 Next.js 服务端渲染环境中需要特殊处理
  // 这里我们使用一个简单的方式来模拟
  
  // 尝试动态导入 node-cron
  try {
    const cron = require('node-cron')
    
    // 检查是否已有任务在运行
    if (globalThis.__CRON_TASK__) {
      console.log('[Scheduler] 定时任务已在运行')
      return { success: true, message: '定时任务已在运行' }
    }
    
    // 每10分钟执行一次
    const task = cron.schedule('*/10 * * * *', runSyncTask, {
      scheduled: true,
    })
    
    // 保存到全局变量
    globalThis.__CRON_TASK__ = task
    
    console.log('[Scheduler] 定时任务已启动，每10分钟执行一次')
    return { success: true, message: '定时任务已启动' }
  } catch (error) {
    console.error('[Scheduler] 启动定时任务失败:', error)
    return { success: false, message: '启动失败，node-cron 不可用' }
  }
}

// 停止定时任务
export function stopScheduler() {
  try {
    if (globalThis.__CRON_TASK__) {
      globalThis.__CRON_TASK__.stop()
      globalThis.__CRON_TASK__ = null
      console.log('[Scheduler] 定时任务已停止')
      return { success: true, message: '定时任务已停止' }
    }
    return { success: false, message: '没有运行的定时任务' }
  } catch (error) {
    return { success: false, message: '停止失败' }
  }
}

// 立即执行一次
export async function runNow() {
  await runSyncTask()
  return lastResult
}

// 获取定时任务状态
export function getSchedulerStatus() {
  return {
    isRunning: !!globalThis.__CRON_TASK__,
    schedule: '*/10 * * * *',
    description: '每10分钟自动抓取最新AI论文、公司动态和行业新闻',
    lastRunTime: lastRunTime?.toISOString(),
    lastResult,
  }
}

// 导出同步函数
export { syncAll, syncPapers, syncNews, syncCompanies } from './sync'

// 全局类型声明
declare global {
  var __CRON_TASK__: any
}
