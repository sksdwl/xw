import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/jwt'

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { code: 1, message: '未登录' },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)

    if (!payload) {
      return NextResponse.json(
        { code: 1, message: '登录已过期' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    })

    if (!user) {
      return NextResponse.json(
        { code: 1, message: '用户不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      code: 0,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
    })
  } catch (error) {
    console.error('获取用户信息错误:', error)
    return NextResponse.json(
      { code: 1, message: '服务器错误' },
      { status: 500 }
    )
  }
}
