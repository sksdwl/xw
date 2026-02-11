import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function sendVerificationEmail(email: string, code: string): Promise<boolean> {
  // 如果没有配置邮箱，直接返回成功（开发模式）
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[开发模式] 验证码 ${code} 已发送到 ${email}`)
    return true
  }

  try {
    await transporter.sendMail({
      from: `"${process.env.NEXT_PUBLIC_APP_NAME || 'AI资讯中心'}" <${process.env.SMTP_USER}>`,
      to: email,
      subject: '您的登录验证码',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto;">
          <h2 style="color: #333;">登录验证码</h2>
          <p style="color: #666;">您正在登录 AI 资讯中心，验证码为：</p>
          <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2563eb; border-radius: 8px; margin: 20px 0;">
            ${code}
          </div>
          <p style="color: #999; font-size: 12px;">验证码 10 分钟内有效，请勿泄露给他人。</p>
        </div>
      `,
    })
    return true
  } catch (error) {
    console.error('发送邮件失败:', error)
    return false
  }
}
