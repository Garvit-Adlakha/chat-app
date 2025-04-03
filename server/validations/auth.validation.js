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
        .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/) // Fixed regex pattern
        .withMessage('Password must meet complexity requirements')
]);

export const validatePasswordReset = validate([
    commonValidations.email,
    body('token')
        .notEmpty()
        .withMessage('Reset token is required'),
    body('password')
        .notEmpty()
        .withMessage('New password is required')
        .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/) // Fixed regex pattern
        .withMessage('Password must meet complexity requirements')
]);

export const validateForgotPassword = validate([
    commonValidations.email
]);

export const validateGoogleAuth = validate([
    body('token')
        .notEmpty()
        .withMessage('Google token is required')
]);