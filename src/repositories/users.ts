import { Repository, getConnection } from 'typeorm';

import { User } from '../models/User';

class UserRepo {
    private repo: Repository<User>;

    constructor() {
        this.repo = getConnection().getRepository(User);
    }

    async findById(userId: string): Promise<User | undefined> {
        const user = await this.repo.findOne({
            where: [
                { id: userId },
            ],
        });

        return user;
    }

    async findByEmail(email: string): Promise<User | undefined> {
        const user = await this.repo.findOne({
            where: [
                { email },
            ],
        });

        return user;
    }
}

export default new UserRepo();
