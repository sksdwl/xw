import { NextRequest, NextResponse } from 'next/server'
import { syncAll, initialSync } from '@/lib/crawler/sync'

const CRON_SECRET = process.env.CRON_SECRET || 'your-cron-secret-key'

function isAuthorized(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization')
  const apiKey = req.nextUrl.searchParams.get('key')
  
  return authHeader === `Bearer ${CRON_SECRET}` || apiKey === CRON_SECRET
}

// GET - 定时任务触发（每10分钟）
export async function GET(req: NextRequest) {
  try {
    // 验证权限
    if (!isAuthorized(req)) {
      return NextResponse.json(
        { code: 1, message: '未授权' },
        { status: 401 }
      )
    }

    // 普通同步 - 只抓取最新数据（保留已有数据）
    const result = await syncAll()
    
    return NextResponse.json({
      code: 0,
      message: '同步完成',
      data: result,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('定时任务执行失败:', error)
    return NextResponse.json(
      { code: 1, message: '同步失败', error: String(error) },
      { status: 500 }
    )
  }
}

// POST - 支持首次同步（抓取过去1个月）
export async function POST(req: NextRequest) {
  try {
    // 验证权限
    if (!isAuthorized(req)) {
      return NextResponse.json(
        { code: 1, message: '未授权' },
        { status: 401 }
      )
    }

    const body = await req.json().catch(() => ({}))
    
    // 如果是首次同步请求
    if (body.type === 'initial') {
      console.log('[Cron] 执行首次同步（过去1个月数据）')
      const result = await initialSync()
      
      return NextResponse.json({
        code: 0,
        message: '首次同步完成',
        data: result,
        timestamp: new Date().toISOString(),
      })
    }
    
    // 普通同步
    const result = await syncAll()
    
    return NextResponse.json({
      code: 0,
      message: '同步完成',
      data: result,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('API执行失败:', error)
    return NextResponse.json(
      { code: 1, message: '同步失败', error: String(error) },
      { status: 500 }
    )
  }
}
