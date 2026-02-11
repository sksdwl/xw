// 定时任务管理器
import { syncAll, initialSync } from './sync'

let isRunning = false
let lastRunTime: Date | null = null
let lastResult: any = null
let cronTask: any = null

// 执行同步任务
async function runSyncTask() {
  if (isRunning) {
    console.log('[Scheduler] 上一次任务仍在运行，跳过本次执行')
    return
  }
  
  isRunning = true
  console.log('[Scheduler] 开始执行同步任务', new Date().toISOString())
  
  try {
    // 定时任务只抓取最新数据（不传参数表示只抓最新）
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
  // 如果已经在运行，不再重复启动
  if (cronTask) {
    console.log('[Scheduler] 定时任务已在运行')
    return { success: true, message: '定时任务已在运行' }
  }
  
  try {
    // 动态导入 node-cron
    const cron = require('node-cron')
    
    // 每10分钟执行一次: */10 * * * *
    cronTask = cron.schedule('*/10 * * * *', runSyncTask, {
      scheduled: true,
    })
    
    console.log('[Scheduler] 定时任务已启动，每10分钟执行一次')
    return { success: true, message: '定时任务已启动，每10分钟执行一次' }
  } catch (error) {
    console.error('[Scheduler] 启动定时任务失败:', error)
    return { success: false, message: '启动失败: ' + String(error) }
  }
}

// 停止定时任务
export function stopScheduler() {
  if (cronTask) {
    cronTask.stop()
    cronTask = null
    console.log('[Scheduler] 定时任务已停止')
    return { success: true, message: '定时任务已停止' }
  }
  return { success: false, message: '没有运行的定时任务' }
}

// 立即执行一次（抓取最新数据）
export async function runNow() {
  await runSyncTask()
  return lastResult
}

// 执行首次同步（抓取过去1个月的数据）
export async function runInitialSync() {
  if (isRunning) {
    return { success: false, message: '已有任务在运行' }
  }
  
  isRunning = true
  console.log('[Scheduler] 开始首次同步（抓取过去1个月数据）')
  
  try {
    lastResult = await initialSync()
    lastRunTime = new Date()
    console.log('[Scheduler] 首次同步完成')
    return { success: true, data: lastResult }
  } catch (error) {
    console.error('[Scheduler] 首次同步失败:', error)
    return { success: false, message: String(error) }
  } finally {
    isRunning = false
  }
}

// 获取定时任务状态
export function getSchedulerStatus() {
  return {
    isRunning: !!cronTask,
    isTaskRunning: isRunning,
    schedule: '*/10 * * * *',
    description: '每10分钟自动抓取最新AI论文、公司动态和行业新闻（保留已有数据，最新显示在前）',
    lastRunTime: lastRunTime?.toISOString(),
    lastResult,
  }
}

// 导出同步函数
export { syncAll, initialSync }
