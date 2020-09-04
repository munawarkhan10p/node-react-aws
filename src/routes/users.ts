import Joi from '@hapi/joi';
import express, { Router } from 'express';

import config from '../config';
import { authorize } from '../middlewares/authorize';
import ResetPasswordQueue from '../queues/ResetPasswordQueue';
import { getAllUsers, createUser } from '../services/users';
import { wrapAsync } from '../utils/asyncHandler';
import { EmailTemplate } from '../utils/emailTemplater';
import mailer from '../utils/mailer';

const router = Router();

/**
 * @swagger
 * /users:
 *   get:
 *     tags:
 *       - User
 *     summary: Get User list
 *     security:
 *       - JWT: []
 *     parameters:
 *       - $ref: '#/components/parameters/offset'
 *       - $ref: '#/components/parameters/limit'
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 total:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *             example:
 *               total: 2
 *               data:
 *                 - id: c43a3b0d-e794-4a9c-9c12-e35c6b62de4c
 *                   email: admin@dtech.com
 *                   firstName: John
 *                   lastName: Doe
 *                   role: ADMIN
 *                 - id: 2efa52e2-e9fd-4bd0-88bc-0132b2e837d9
 *                   email: admin2@dtech.com
 *                   firstName: John
 *                   lastName: Doe
 *                   role: ADMIN
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/users', wrapAsync(authorize), wrapAsync(async (req: express.Request, res: express.Response) => {
    const { limit, offset } = await Joi
        .object({
            offset: Joi.number().integer().default(0).failover(0).label('Offset'),
            limit: Joi.number().integer().default(10).failover(10).label('Limit'),
        })
        .validateAsync({
            offset: req.query.offset,
            limit: req.query.limit,
        });

    const [users, total] = await getAllUsers(limit, offset);

    res.send({
        total,
        data: users.map((user) => ({
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
        })),
    });
}));

/**
 * @swagger
 * /users:
 *   post:
 *     tags:
 *       - User
 *     summary: Invite Super Admin User
 *     security:
 *       - JWT: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *            schema:
 *              type: object
 *              properties:
 *                email:
 *                  description: User e-mail
 *                  type: string
 *                  minimum: 3
 *                  maximum: 255
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserInvitation'
 *             example:
 *               id: c43a3b0d-e794-4a9c-9c12-e35c6b62de4c
 *               email: user@client.com
 *               role: CLIENT
 *               invitationAccepted: true
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       409:
 *         $ref: '#/components/responses/ConflictError'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.post('/users', wrapAsync(async (req: express.Request, res: express.Response) => {
    const { email } = await Joi
        .object({
            email: Joi.string().trim().lowercase().email().required().label('Email'),
        })
        .validateAsync(req.body);

    const user = await createUser(email);

    res.send({
        id: user.id,
        email: user.email,
        role: user.role,
    });
}));

/**
 * @swagger
 * /users/reset-password:
 *   post:
 *     tags:
 *       - User
 *     summary: Reset user password
 *     security:
 *       - JWT: []
 *     parameters:
 *       - $ref: '#/components/parameters/resetPasswordToken'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               password:
 *                  description: Password
 *                  type: string
 *                  minimum: 3
 *                  maximum: 50
 *     produces:
 *       - application/json
 *     responses:
 *       204:
 *         $ref: '#/components/responses/NoContentResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.post('/users/reset-password', wrapAsync(authorize), wrapAsync(async (req: express.Request, res: express.Response) => {
    const { password } = await Joi
        .object({
            password: Joi.string().min(3).max(50).required().label('Password'),
        })
        .validateAsync({
            ...req.body,
        });

    ResetPasswordQueue.publish({
        id: req.user.id,
        hashPassword: password,
        email: req.user.email,

    });

    const user = req.user;

    mailer.sendMail(config.transactionalEmailSource, {
        address: 'munawar.khan@hobsons.com',
        templateData: {
            user,
        },
    }, EmailTemplate.RESET_PASSWORD, {

    });

    res.send(204);
}));

export default router;
