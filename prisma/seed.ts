import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 添加示例论文
  for (const paper of [
    {
      id: 'paper_1',
      title: 'Attention Is All You Need',
      authors: JSON.stringify(['Ashish Vaswani', 'Noam Shazeer', 'Niki Parmar']),
      abstract: '我们提出了一种新的简单网络架构 Transformer，完全基于注意力机制，摒弃了循环和卷积。实验表明，该模型在质量上更优越，同时更易于并行化，训练时间显著减少。',
      url: 'https://arxiv.org/abs/1706.03762',
      pdfUrl: 'https://arxiv.org/pdf/1706.03762.pdf',
      publishedAt: new Date('2017-06-12'),
      source: 'arXiv',
      category: 'NLP',
      tags: JSON.stringify(['Transformer', 'Attention', 'NLP']),
    },
    {
      id: 'paper_2',
      title: 'GPT-4 Technical Report',
      authors: JSON.stringify(['OpenAI']),
      abstract: '我们报告了 GPT-4 的开发情况，这是一个大规模多模态模型，能够接受图像和文本输入并生成文本输出。',
      url: 'https://arxiv.org/abs/2303.08774',
      pdfUrl: 'https://arxiv.org/pdf/2303.08774.pdf',
      publishedAt: new Date('2023-03-23'),
      source: 'arXiv',
      category: 'ML',
      tags: JSON.stringify(['GPT-4', 'LLM', 'Multimodal']),
    },
    {
      id: 'paper_3',
      title: 'Deep Residual Learning for Image Recognition',
      authors: JSON.stringify(['Kaiming He', 'Xiangyu Zhang', 'Shaoqing Ren', 'Jian Sun']),
      abstract: '我们提出了一种残差学习框架，使得训练比以前深得多的网络成为可能。',
      url: 'https://arxiv.org/abs/1512.03385',
      pdfUrl: 'https://arxiv.org/pdf/1512.03385.pdf',
      publishedAt: new Date('2015-12-10'),
      source: 'arXiv',
      category: 'CV',
      tags: JSON.stringify(['ResNet', 'Computer Vision', 'Deep Learning']),
    },
  ]) {
    await prisma.paper.upsert({
      where: { id: paper.id },
      update: {},
      create: paper,
    })
  }

  // 添加示例公司动态
  for (const company of [
    {
      id: 'company_1',
      name: 'OpenAI',
      title: 'OpenAI 发布 GPT-4 Turbo 模型',
      content: 'OpenAI 在 DevDay 上发布了 GPT-4 Turbo 模型，支持 128k 上下文窗口，知识截止日期更新到 2023 年 4 月。新模型在性能和成本上都有显著改进。',
      summary: 'OpenAI 发布新版 GPT-4 Turbo，上下文窗口大幅提升',
      url: 'https://openai.com/blog',
      publishedAt: new Date('2023-11-06'),
      category: 'PRODUCT',
      tags: JSON.stringify(['GPT-4', 'OpenAI', 'LLM']),
    },
    {
      id: 'company_2',
      name: 'Anthropic',
      title: 'Anthropic 完成 7.5 亿美元融资',
      content: 'AI 安全公司 Anthropic 宣布完成 7.5 亿美元融资，由 Spark Capital 领投。本轮融资将用于开发更安全的 AI 系统和扩大团队规模。',
      summary: 'Anthropic 完成新一轮融资，估值大幅提升',
      url: 'https://www.anthropic.com',
      publishedAt: new Date('2024-01-15'),
      category: 'FUNDING',
      tags: JSON.stringify(['Anthropic', 'Claude', 'Funding']),
    },
  ]) {
    await prisma.company.upsert({
      where: { id: company.id },
      update: {},
      create: company,
    })
  }

  // 添加示例新闻
  for (const news of [
    {
      id: 'news_1',
      title: '欧盟通过《人工智能法案》，成为全球首部 AI 综合法规',
      content: '欧盟议会正式通过了《人工智能法案》，这是全球首部全面监管人工智能的法规。法案将 AI 系统分为不同风险等级，对高风险应用实施严格监管。',
      summary: '欧盟通过全球首部 AI 综合法规，规范人工智能应用',
      source: '新华社',
      publishedAt: new Date('2024-03-13'),
      category: 'POLICY',
      tags: JSON.stringify(['EU', 'AI Regulation', 'Policy']),
    },
    {
      id: 'news_2',
      title: 'Google DeepMind 发布 Gemini 1.5 Pro',
      content: 'Google DeepMind 发布了 Gemini 1.5 Pro 模型，支持 100 万 token 的上下文窗口。该模型在处理长文档和视频理解方面表现出色。',
      summary: 'Google 发布 Gemini 1.5 Pro，上下文窗口达百万级',
      source: 'TechCrunch',
      publishedAt: new Date('2024-02-15'),
      category: 'TECH',
      tags: JSON.stringify(['Google', 'Gemini', 'DeepMind']),
    },
  ]) {
    await prisma.news.upsert({
      where: { id: news.id },
      update: {},
      create: news,
    })
  }

  console.log('Seed data created successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
