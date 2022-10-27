import Organization from '../entities/Organization'
import User from '../entities/User'
import { UserRole } from '../types/user'
import { organizationRepository, userRepository } from './repositories'

const ensureClientPublic = async () => {
  try {
    const publicClient = await userRepository.findOneByOrFail({
      identifier: process.env.CLIENT_PUBLIC_ID,
      role: UserRole.CLIENT_PUBLIC,
    })
    console.log('public client found', publicClient.identifier)
  } catch (error) {
    const hospital = new Organization({
      type: 'hospital',
      name: process.env.CLIENT_PUBLIC_NAME,
      email: 'contact@snumc.ac.kr',
      phoneNumber: '010-2345-8950',
      address: '서울 종로구 대학로 101',
      isVerified: true,
      affiliation: '서울',
    })
    await organizationRepository.save(hospital)

    const publicClient = new User({
      identifier: process.env.CLIENT_PUBLIC_ID,
      name: process.env.CLIENT_PUBLIC_NAME,
      password: process.env.CLIENT_PUBLIC_PASSWORD,
      role: UserRole.CLIENT_PUBLIC,
      organization: hospital,
    })

    await userRepository.save(publicClient)
    console.log('public client created', publicClient.identifier)
  }
}

export default ensureClientPublic
