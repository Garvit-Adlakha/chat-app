import { body } from 'express-validator';
import { validate, commonValidations } from '../middlewares/validation.middleware.js';

export const validateSignup = validate([
    commonValidations.name,
    commonValidations.email,
    commonValidations.password
]);

export const validateSignin = validate([
    commonValidations.email,
    body('password')
        .notEmpty()
        .withMessage('Password is required')
]);

export const validatePasswordChange = validate([
    body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),
    body('newPassword')
        .notEmpty()
        .withMessage('New password is required')
        .custom((value, { req }) => {
            if (value === req.body.currentPassword) {
                throw new Error('New password must be different');
            }
            return true;
        })
        .matches(PASSWORD_REGEX)
        .withMessage('Password must meet complexity requirements')
]);