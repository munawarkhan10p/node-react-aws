import { Repository, getConnection } from 'typeorm';

import { User } from '../models/User';

class UserRepo {
    private repo: Repository<User>;

    constructor() {
        this.repo = getConnection().getRepository(User);
    }

    async getAll(offset: number, limit: number): Promise<[User[], number]> {
        return this.repo.createQueryBuilder('user')
            .take(limit)
            .skip(offset)
            .getManyAndCount();
    }

    async findById(userId: string): Promise<User> {
        const user = await this.repo.findOne({
            where: [
                { id: userId },
            ],
        });

        return user;
    }

    async findByEmail(email: string): Promise<User> {
        const user = await this.repo.findOne({
            where: [
                { email },
            ],
        });

        return user;
    }

    async create(email: string): Promise<User> {
        const user = this.repo.create({ email });

        return this.repo.save(user);
    }

    async update(userId: string, user: Partial<Pick<User, 'firstName' | 'lastName' | 'hashedPassword'>>): Promise<User> {
        return this.repo.save({
            id: userId,
            ...user,
        });
    }

    async remove(userId: string): Promise<void> {
        await this.repo.delete(userId);
    }
}

export default new UserRepo();
