import { syncAll } from './src/lib/crawler/sync'

console.log('开始测试抓取...')

syncAll()
  .then(result => {
    console.log('同步结果:', JSON.stringify(result, null, 2))
    process.exit(0)
  })
  .catch(err => {
    console.error('错误:', err)
    process.exit(1)
  })
