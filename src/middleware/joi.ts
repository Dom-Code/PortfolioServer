import { Request, Response, NextFunction } from 'express';
import Joi, { ObjectSchema } from 'joi';

export const ValidateJoi = (schema: ObjectSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.validateAsync(req.body);
            next();
        } catch (err) {
            console.error(err);
            return res.status(422).json({ err });
        }
    };
};

export const LoginSchema = Joi.object({
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
});

export const RegisterSchema = Joi.object({
    first: Joi.string().pattern(new RegExp('^[A-Za-z]{2,16}$')),
    last: Joi.string().pattern(new RegExp('^[A-Za-z]{2,16}$')),
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
    password: Joi.string().pattern(new RegExp('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$')),
    repeat_password: Joi.ref('password')
});
