import { Request, Response, Router } from 'express'
import { invitationRepository, userRepository } from '../db/repositories'
import Invitation from '../entities/Invitation'
import User from '../entities/User'
import BadRequestError from '../errors/BadRequestError'
import handleErrorAndSendResponse from '../errors/handleErrorThenSendResponse'
import auth from '../middlewares/auth'
import user from '../middlewares/user'
import { UserRole } from '../types/user'

const router = Router()

/**
 * Create a driver invitation from Agency web (only for agency)
 *
 * @param req body: name, licenseNumber, adress, phoneNumber, email
 * @param res json: success(boolean), invitation
 */
const createInvitation = async (req: Request, res: Response) => {
  try {
    const user = res.locals.user as User
    if (user.role !== UserRole.AGENCY) throw new BadRequestError('agency manager only')

    const { name, licenseNumber, phoneNumber, email } = req.body
    if (!name || !licenseNumber || !phoneNumber || !email) throw new BadRequestError('every properties are mandatory')

    const invitaion = new Invitation({ name, licenseNumber, phoneNumber, email })
    invitaion.organization = user.organization

    await invitationRepository.save(invitaion)

    return res.json({ success: true, invitaion })
  } catch (err) {
    console.log(err)

    return handleErrorAndSendResponse(err, res)
  }
}

/**
 * Get all invitations from Agency web (only for agency)
 *
 * @param res json: invitation
 * @returns
 */
const getInvitations = async (_req: Request, res: Response) => {
  try {
    const user = res.locals.user as User
    if (user.role !== UserRole.AGENCY) throw new BadRequestError('agency manager only')

    const invitations = await invitationRepository.find({
      relations: { organization: true },
      where: {
        organization: {
          id: user.organization.id,
        },
      },
    })

    return res.json(invitations)
  } catch (err) {
    console.log(err)

    return handleErrorAndSendResponse(err, res)
  }
}

/**
 * Update an invitation from Agency web (only for agency)
 *
 * @param id
 * @param req body: name?, licenseNumber?, address?, phoneNumber?, email?
 * @param res json: success(boolean), invitation
 * @returns
 */
const updateInvitation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { name, licenseNumber, address, phoneNumber, email } = req.body

    const invitation = await invitationRepository.findOneByOrFail({ id: Number(id) })

    if (name) invitation.name = name
    if (licenseNumber) invitation.licenseNumber = licenseNumber
    if (address) invitation.address = address
    if (phoneNumber) invitation.phoneNumber = phoneNumber
    if (email) invitation.email = email

    await invitationRepository.save(invitation)

    return res.json({ success: true, invitation })
  } catch (err) {
    console.log(err)

    return handleErrorAndSendResponse(err, res)
  }
}

/**
 * Delete an invitation from Agency web (only for agency)
 *
 * @param id
 * @param req body: name?, licenseNumber?, address?, phoneNumber?, email?
 * @param res json: success(boolean), deleted(deleted invitation)
 * @returns
 */
const deleteInvitation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    if (!id) throw new BadRequestError('id is mandatory')

    const user = res.locals.user
    if (user.role !== UserRole.AGENCY) throw new BadRequestError('agency manager only')

    const invitation = await invitationRepository.findOne({
      relations: { organization: true },
      where: {
        id: Number(id),
        organization: {
          id: user.organization.id,
        },
      },
    })

    if (!invitation) throw new BadRequestError('cannot find any invitation given id')

    const driver = await userRepository.findOneBy({
      name: invitation.name,
      phoneNumber: invitation.phoneNumber,
      email: invitation.email,
      organization: {
        id: user.organization.id,
      },
    })

    if (driver) await userRepository.softRemove(driver)
    const deleted = await invitationRepository.softRemove(invitation)

    return res.json({ success: true, result: deleted })
  } catch (err) {
    console.log(err)

    return handleErrorAndSendResponse(err, res)
  }
}

/**
 * Get an invitation from Agency web (only for agency)
 *
 * @param id
 * @param req body: name?, licenseNumber?, address?, phoneNumber?, email?
 * @param res json: success(boolean), invitation
 * @returns
 */
const getInvitation = async (req: Request, res: Response) => {
  try {
    // const user = res.locals.user as User
    const { id } = req.params

    const profile = await invitationRepository.findOneByOrFail({ id: Number(id) })

    return res.json(profile)
  } catch (err) {
    console.log(err)

    return handleErrorAndSendResponse(err, res)
  }
}

/**
 * Challenge an invitation from Driver app (driver only)
 *
 * @param req body: code
 * @param res json: an Invitation object with same code
 * @returns
 */
const challengeInvitation = async (req: Request, res: Response) => {
  try {
    // const user = res.locals.user as User
    // if (user.role !== UserRole.DRIVER) throw new ForbiddenError('only driver can accept invitation')

    const { code } = req.body
    if (!code) throw new BadRequestError('code is empty')

    const invitation = await invitationRepository.findOneOrFail({
      where: { code },
      relations: {
        organization: true,
      },
    })
    if (!invitation) throw new BadRequestError('wrong code')

    console.log({ invitation })

    // user.organization = invitation.organization
    // await userRepository.save(user)

    // soft delete invitaion
    // await invitationRepository.softRemove(invitation)

    // return user so that driver app can update user data
    return res.json(invitation)
  } catch (err) {
    console.log(err)

    return handleErrorAndSendResponse(err, res)
  }
}

const handleChallengeInvitation = async (req: Request, res: Response) => {
  try {
    const { code } = req.body
    if (!code) throw new BadRequestError('code is empty')

    const invitation = await invitationRepository.findOneOrFail({
      where: { code },
      relations: {
        organization: true,
      },
    })
    if (!invitation) throw new BadRequestError('wrong code')

    return res.json(invitation)
  } catch (err) {
    console.log(err)

    return handleErrorAndSendResponse(err, res)
  }
}

// /invitations
router.post('/accept', challengeInvitation)
router.post('/challenge', handleChallengeInvitation)
router.post('/', user, auth, createInvitation)
router.get('/', user, auth, getInvitations)
router.get('/:id', user, auth, getInvitation)
router.put('/:id', user, auth, updateInvitation)
router.delete('/:id', user, auth, deleteInvitation)

export default router
