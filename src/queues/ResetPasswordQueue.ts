import Bunyan from 'bunyan';

import config from '../config';
import { findUserByEmail, updateUserPassword } from '../services/users';

import { Queue, UnprocessableMessageError } from './queue';

type ResetUser = {
    id: string ;
    email: string;
    hashPassword: string;
}

class ResetPasswordQueue extends Queue<ResetUser> {
    constructor() {
        super('ResetPassword', config.sqs.resetPassword);

        this.setConsumer(async (message: ResetUser, log: Bunyan) => {
            const { id, email, hashPassword } = message;

            const user = findUserByEmail(email);
            if (!user) {
                throw new UnprocessableMessageError('Unknown user');
            }

            log.info('Updating User Password');

            await updateUserPassword(id, hashPassword);

            log.info('Password updated Sucessfully');
        });
    }
}

export default new ResetPasswordQueue();
