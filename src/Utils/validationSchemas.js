import * as Yup from 'yup';

export const loginSchema = Yup.object().shape({
    email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
    password: Yup.string()
        .required('Password is required'),
});

export const registerSchema = Yup.object().shape({
    name: Yup.string().required('Full Name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .matches(/[0-9]/, 'Password must contain at least one number')
        .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
        .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .matches(/[^\w]/, 'Password must contain at least one symbol')
        .required('Password is required'),
    role: Yup.string().required('Role is required'),
    displayName: Yup.string().required('Display Name is required'),
    description: Yup.string().required('Description is required'),
    category1: Yup.string().required('Primary Industry is required'),
    category2: Yup.string().required('Secondary Industry is required'),

    // Conditional validation based on role
    stage: Yup.string().when('role', {
        is: 'startup',
        then: (schema) => schema.required('Startup Stage is required'),
        otherwise: (schema) => schema.nullable(),
    }),
    earningPotential: Yup.string().when('role', {
        is: 'startup',
        then: (schema) => schema.required('Earning Potential is required'),
        otherwise: (schema) => schema.nullable(),
    }),
    tokenValue: Yup.string().when('role', {
        is: 'investor',
        then: (schema) => schema.required('Investment Range is required'),
        otherwise: (schema) => schema.nullable(),
    }),
});

export const forgotPasswordSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email').required('Email is required'),
});

export const resetPasswordSchema = Yup.object().shape({
    password: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .matches(/[0-9]/, 'Password must contain at least one number')
        .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
        .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .matches(/[^\w]/, 'Password must contain at least one symbol')
        .required('Password is required'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Confirm Password is required'),
});

export const changePasswordSchema = Yup.object().shape({
    currentPassword: Yup.string().required('Current Password is required'),
    newPassword: Yup.string()
        .min(8, 'New Password must be at least 8 characters')
        .matches(/[0-9]/, 'New Password must contain at least one number')
        .matches(/[a-z]/, 'New Password must contain at least one lowercase letter')
        .matches(/[A-Z]/, 'New Password must contain at least one uppercase letter')
        .matches(/[^\w]/, 'New Password must contain at least one symbol')
        .required('New Password is required'),
    confirmNewPassword: Yup.string()
        .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
        .required('Confirm New Password is required'),
});

export const pitchSchema = Yup.object().shape({
    message: Yup.string().required('Pitch description is required').min(20, 'Pitch description must be at least 20 characters'),
    // Video file validation is handled manually in the component as it's a file input
});

export const reportSchema = Yup.object().shape({
    reason: Yup.string().required('Reason is required'),
    description: Yup.string().required('Description is required').min(10, 'Description must be at least 10 characters'),
});

export const startPostSchema = Yup.object().shape({
    content: Yup.string(),
    image: Yup.mixed(),
}).test('content-or-image', 'Please provide content or an image', function (value) {
    const { content, image } = value;
    return (content && content.trim().length > 0) || (image && image !== null);
});

export const postNewsSchema = Yup.object().shape({
    content: Yup.string(),
    image: Yup.mixed(),
}).test('content-or-image', 'Please provide content or an image', function (value) {
    const { content, image } = value;
    return (content && content.trim().length > 0) || (image && image !== null);
});
