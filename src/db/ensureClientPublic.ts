import User from '../entities/User'
import { UserRole } from '../types/user'
import { userRepository } from './repositories'

const ensureClientPublic = async () => {
  try {
    const publicClient = await userRepository.findOneByOrFail({
      identifier: process.env.CLIENT_PUBLIC_ID,
      role: UserRole.CLIENT_PUBLIC,
    })
    console.log('public client found', publicClient.identifier)
  } catch (error) {
    const publicClient = new User({
      identifier: process.env.CLIENT_PUBLIC_ID,
      name: process.env.CLIENT_PUBLIC_NAME,
      password: process.env.CLIENT_PUBLIC_PASSWORD,
      role: UserRole.CLIENT_PUBLIC,
    })

    await userRepository.save(publicClient)
    console.log('public client created', publicClient.identifier)
  }
}

export default ensureClientPublic
