import Boom from '@hapi/boom';

import { User } from '../models/User';
import UserRepo from '../repositories/users';

export async function findUserByID(userId: string): Promise<User> {
    const user = await UserRepo.findById(userId);
    if (!user) {
        throw Boom.notFound('User with this id does not exist');
    }

    return user;
}

export async function findUserByEmail(email: string): Promise<User> {
    const user = await UserRepo.findByEmail(email);
    if (!user) {
        throw Boom.notFound('User with this email does not exist');
    }

    return user;
}
