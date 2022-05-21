import User from '../entities/User'
import { UserRole } from '../types/user'
import { userRepository } from './repositories'

const ensureAdmin = async () => {
  try {
    const admin = await userRepository.findOneByOrFail({ identifier: process.env.ADMIN_ID, role: UserRole.ADMIN })
    console.log('admin found', admin.identifier)
  } catch (error) {
    const admin = new User({
      identifier: process.env.ADMIN_ID,
      name: process.env.ADMIN_ID,
      password: process.env.ADMIN_PASSWORD,
      role: UserRole.ADMIN,
    })

    await userRepository.save(admin)
    console.log('admin created', admin.identifier)
  }
}

export default ensureAdmin
