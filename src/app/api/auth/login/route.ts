import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateToken } from '@/lib/jwt'

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json()

    if (!email || !code) {
      return NextResponse.json(
        { code: 1, message: '请输入邮箱和验证码' },
        { status: 400 }
      )
    }

    // 查找有效的验证码
    const verificationCode = await prisma.verificationCode.findFirst({
      where: {
        email,
        code,
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (!verificationCode) {
      return NextResponse.json(
        { code: 1, message: '验证码无效或已过期' },
        { status: 400 }
      )
    }

    // 标记验证码为已使用
    await prisma.verificationCode.update({
      where: { id: verificationCode.id },
      data: { used: true },
    })

    // 查找或创建用户
    let user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: email.split('@')[0],
        },
      })
    }

    // 生成 JWT Token
    const token = generateToken({
      userId: user.id,
      email: user.email,
    })

    // 设置 Cookie
    const response = NextResponse.json({
      code: 0,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
        },
        token,
      },
    })

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 天
      path: '/',
    })

    return response
  } catch (error) {
    console.error('登录错误:', error)
    return NextResponse.json(
      { code: 1, message: '服务器错误' },
      { status: 500 }
    )
  }
}
