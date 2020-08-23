import Boom from '@hapi/boom';
import express from 'express';

import { verifyAuthToken } from '../services/authToken';
import { findUserByID } from '../services/users';

export async function authorize(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
    let token: string | null = null;
    const authheader = (req.headers.authorization || '').split(' ');
    if (authheader.length === 2 && authheader[0].toLowerCase() === 'bearer') {
        token = authheader[1];
    }
    if (!token) {
        return next(Boom.unauthorized('Token required'));
    }

    try {
        const claims = verifyAuthToken(token);

        const user = await findUserByID(claims.userId);

        req.user = user;

        return next();
    } catch (err) {
        req.log.error({ err });

        return next(Boom.unauthorized('This token is unauthorized'));
    }
}
