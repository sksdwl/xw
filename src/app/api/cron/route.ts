import { NextRequest, NextResponse } from 'next/server'
import { syncAll } from '@/lib/crawler/sync'

// 这个路由可以被外部定时服务（如 Vercel Cron）调用
// 也可以手动触发

export async function GET(req: NextRequest) {
  try {
    // 检查密钥（防止未授权访问）
    const authHeader = req.headers.get('authorization')
    const apiKey = req.nextUrl.searchParams.get('key')
    
    // 简单验证，生产环境应该使用更强的验证
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && 
        apiKey !== process.env.CRON_SECRET) {
      return NextResponse.json(
        { code: 1, message: '未授权' },
        { status: 401 }
      )
    }

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

export async function POST(req: NextRequest) {
  return GET(req)
}
