import { body, param, query, validationResult } from 'express-validator';
import { AppError } from './error.middleware.js';

/**
 * Custom validation middleware
 * @param {Array|Object} validations - Array of validation chains
 * @returns {Function} Express middleware
 */
export const validate = (validations) => {
    const validationArray = Array.isArray(validations) ? validations : [validations];

    return async (req, res, next) => {
        try {
            await Promise.all(validationArray.map(validation => validation.run(req)));

            const errors = validationResult(req);
            if (errors.isEmpty()) {
                return next();
            }

            const extractedErrors = errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }));

            // Use structured error response
            return next(new AppError({
                message: 'Validation failed',
                statusCode: 400,
                errors: extractedErrors,
                errorCode: 'VALIDATION_ERROR'
            }));
        } catch (error) {
            return next(new AppError({
                message: 'Validation system error',
                statusCode: 500,
                errorCode: 'VALIDATION_SYSTEM_ERROR'
            }));
        }
    };
};

// Define regex patterns as strings to avoid any issues
const PASSWORD_REGEX = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/;
const NAME_REGEX = /^[a-zA-Z\s]*$/;

/**
 * Common validation chains
 */
export const commonValidations = {
    pagination: [
        query('page')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Page must be a positive integer')
            .toInt(),
        query('limit')
            .optional()
            .isInt({ min: 1, max: 100 })
            .withMessage('Limit must be between 1 and 100')
            .toInt()
    ],
    
    objectId: (field) => 
        param(field)
            .trim()
            .isMongoId()
            .withMessage(`Invalid ${field} ID format`),

    email: 
        body('email')
            .trim()
            .isEmail()
            .normalizeEmail()
            .withMessage('Please provide a valid email'),

    password: 
        body('password')
            .isLength({ min: 8 })
            .withMessage('Password must be at least 8 characters long')
            .matches(PASSWORD_REGEX)
            .withMessage('Password must contain lowercase, uppercase, number and special character'),

    name:
        body('name')
            .trim()
            .isLength({ min: 2, max: 50 })
            .withMessage('Name must be between 2 and 50 characters')
            .matches(NAME_REGEX)
            .withMessage('Name can only contain letters and spaces')
};

// User validation chains
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
                throw new Error('New password must be different from current password');
            }
            return true;
        })
        .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)
        .withMessage('Password must contain at least one number, one uppercase letter, one lowercase letter, and one special character')
]);