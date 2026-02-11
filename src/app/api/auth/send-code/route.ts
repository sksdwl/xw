import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateVerificationCode, sendVerificationEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { code: 1, message: '请输入有效的邮箱地址' },
        { status: 400 }
      )
    }

    // 生成验证码
    const code = generateVerificationCode()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 分钟有效期

    // 保存验证码到数据库
    await prisma.verificationCode.create({
      data: {
        email,
        code,
        expiresAt,
      },
    })

    // 发送邮件
    const sent = await sendVerificationEmail(email, code)

    if (!sent) {
      return NextResponse.json(
        { code: 1, message: '发送验证码失败，请稍后重试' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      code: 0,
      message: '验证码已发送',
    })
  } catch (error) {
    console.error('发送验证码错误:', error)
    return NextResponse.json(
      { code: 1, message: '服务器错误' },
      { status: 500 }
    )
  }
}
