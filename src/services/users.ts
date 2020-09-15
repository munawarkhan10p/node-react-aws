import Boom from '@hapi/boom';
import bcrypt from 'bcrypt';
import { User } from '../models/User';
import UserRepo from '../repositories/users';


export async function getAllUsers(offset: number, limit: number): Promise<[User[], number]> {
    return UserRepo.getAll(offset, limit);
}

export async function findUserByID(userId: string): Promise<User> {
    const user = await UserRepo.findById(userId);
    if (!user) {
        throw Boom.notFound('User with this id does not exist');
        console.log('sdfdsfdsfdsfds dsfdsf');
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

export async function createUser(email: string): Promise<User> {
    const user = await findUserByEmail(email).catch(() => null);
    if (user) {
        throw Boom.conflict('User with this email already exist');
    }

    return UserRepo.create(email);
}

export async function updateUser(userId: string, user: Partial<Pick<User, 'firstName' | 'lastName' | 'hashedPassword'>>): Promise<User> {
    return UserRepo.update(userId, user);
}

export async function updateUserPassword(userId: string, password: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 8);

    return updateUser(userId, { hashedPassword });
}
