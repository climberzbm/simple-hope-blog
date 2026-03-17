import { PrismaClient } from '@prisma/client'
import { prisma } from '../lib/prisma'

// AI 自动回复生成
function generateAutoReply(postContent: string, commentContent: string): string {
  // 基于文章和评论生成回复
  const replies = [
    '感谢你的评论！这个问题确实值得深入探讨。',
    '很高兴看到你的想法，我会在后续文章中继续分享相关内容。',
    '你提出了一个很好的观点，感谢分享！',
    '感谢阅读！希望这篇文章对你有所帮助。',
    '你的反馈很有价值，我会持续改进内容。',
    '感谢支持！有问题欢迎继续交流。',
    '这个观点很有意思，感谢你的分享！',
    '感谢评论，期待与你更多交流！',
  ]
  
  // 根据评论长度选择回复风格
  if (commentContent.length > 50) {
    return replies.slice(0, 4)[Math.floor(Math.random() * 4)]
  }
  return replies.slice(4)[Math.floor(Math.random() * 4)]
}

// 检查是否是用户回复用户（非管理员）
async function isUserReplyToUser(commentId: string): Promise<boolean> {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: { user: true }
  })
  
  if (!comment) return false
  
  // 如果有父评论，检查是否是用户回复用户
  if (comment.parentId) {
    const parent = await prisma.comment.findUnique({
      where: { id: comment.parentId },
      include: { user: true }
    })
    
    if (parent && parent.user.role !== 'admin' && comment.user.role !== 'admin') {
      return true
    }
  }
  
  return false
}

// 主函数：检查并回复评论
export async function checkAndReplyComments() {
  console.log('💬 开始检查评论...')

  try {
    // 获取待审核或新评论（已通过的）
    const comments = await prisma.comment.findMany({
      where: {
        status: 'approved',
        createdAt: {
          gte: new Date(Date.now() - 30 * 60 * 1000) // 最近30分钟
        }
      },
      include: {
        user: true,
        post: { include: { author: true } }
      }
    })

    console.log(`找到 ${comments.length} 条新评论`)

    for (const comment of comments) {
      // 跳过用户回复用户
      const isUserReply = await isUserReplyToUser(comment.id)
      if (isUserReply) {
        console.log(`⏭️ 跳过用户回复: ${comment.id}`)
        continue
      }

      // 检查是否已回复
      const existingReply = await prisma.comment.findFirst({
        where: {
          parentId: comment.id,
          user: { role: 'admin' }
        }
      })

      if (existingReply) {
        console.log(`⏭️ 已回复: ${comment.id}`)
        continue
      }

      // 生成自动回复
      const replyContent = generateAutoReply(comment.post.content, comment.content)
      
      // 获取管理员
      const admin = await prisma.user.findFirst({ where: { role: 'admin' } })
      if (!admin) continue

      // 创建回复
      await prisma.comment.create({
        data: {
          content: replyContent,
          status: 'approved',
          postId: comment.postId,
          userId: admin.id,
          parentId: comment.id
        }
      })

      console.log(`✅ 已回复评论: ${comment.id}`)
    }

    console.log('✅ 评论检查完成')
  } catch (error) {
    console.error('❌ 检查评论失败:', error)
    throw error
  }
}

// 执行检查
if (require.main === module) {
  checkAndReplyComments()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}