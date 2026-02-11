import { initialSync } from '../src/lib/crawler/sync'

console.log('开始首次同步（抓取过去1个月的数据）...')

initialSync()
  .then(result => {
    console.log('\n========== 首次同步完成 ==========')
    console.log('论文:', result.papers)
    console.log('新闻:', result.news)
    console.log('公司动态:', result.companies)
    console.log('==================================\n')
    process.exit(0)
  })
  .catch(err => {
    console.error('首次同步失败:', err)
    process.exit(1)
  })
