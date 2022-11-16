import express, { Request, Response } from 'express'
import { noticeRepository } from '../db/repositories'
import Notice, { NoticeType } from '../entities/Notice'
import admin from '../middlewares/admin'
import auth from '../middlewares/auth'
import user from '../middlewares/user'

const router = express.Router()

const getAllNotice = async (_req: Request, res: Response) => {
  try {
    const notices = await noticeRepository.find()

    res.json({ notices })
  } catch (err) {
    console.log(err)
    res.status(500)
  }
}

const getNotice = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const id = Number(req.params.id)
    const notice = await noticeRepository.findOneByOrFail({ id })

    res.json({ notice })
  } catch (err) {
    console.log(err)
    res.status(500)
  }
}

const createNotice = async (
  req: Request<any, any, { content: string; title: string; type: NoticeType }>,
  res: Response,
) => {
  try {
    const { content, title, type } = req.body
    if (!content || !title || !type) return res.status(400).json('no require state')
    const notice = new Notice({
      content,
      title,
      type,
    })
    await noticeRepository.save(notice)

    return res.json({ notice })
  } catch (err) {
    console.log(err)
    return res.status(500)
  }
}

const deleteNotice = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const id = Number(req.params.id)
    const result = await noticeRepository.delete({ id })

    res.json({ result })
  } catch (err) {
    console.log(err)
    res.status(500)
  }
}

const updateNotice = async (
  req: Request<any, any, { title?: string; content?: string; type?: NoticeType; id: number }>,
  res: Response,
) => {
  try {
    const { title, content, type, id } = req.body
    if (!id) res.status(400).json('no id value...')
    const notice = await noticeRepository.findOneByOrFail({ id })
    if (!notice) return res.status(400).json('no exist notice id')
    if (title) notice.title = title
    if (content) notice.content = content
    if (type) notice.type = type

    await noticeRepository.save(notice)

    return res.json({ notice })
  } catch (err) {
    console.log(err)
    return res.status(500)
  }
}

router.get('/', user, auth, admin, getAllNotice)
router.get('/:id', user, auth, admin, getNotice)
router.post('/', user, auth, admin, createNotice)
router.delete('/:id', user, auth, admin, deleteNotice)
router.put('/', user, auth, admin, updateNotice)

export default router
