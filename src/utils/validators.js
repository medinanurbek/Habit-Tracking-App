const Joi = require('joi');

const registerValidation = (data) => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(30).required().messages({
      'string.empty': 'Username is required',
      'string.min': 'Username must be at least 3 characters',
      'string.max': 'Username cannot exceed 30 characters',
    }),
    email: Joi.string().email().required().messages({
      'string.empty': 'Email is required',
      'string.email': 'Please provide a valid email',
    }),
    password: Joi.string().min(6).required().messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 6 characters',
    }),
  });

  return schema.validate(data);
};

const loginValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      'string.empty': 'Email is required',
      'string.email': 'Please provide a valid email',
    }),
    password: Joi.string().required().messages({
      'string.empty': 'Password is required',
    }),
  });

  return schema.validate(data);
};

const updateProfileValidation = (data) => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(30).messages({
      'string.min': 'Username must be at least 3 characters',
      'string.max': 'Username cannot exceed 30 characters',
    }),
    email: Joi.string().email().messages({
      'string.email': 'Please provide a valid email',
    }),
    bio: Joi.string().max(200).allow('').messages({
      'string.max': 'Bio cannot exceed 200 characters',
    }),
    avatar: Joi.string().uri().allow('').messages({
      'string.uri': 'Avatar must be a valid URL',
    }),
  });

  return schema.validate(data);
};

module.exports = {
  registerValidation,
  loginValidation,
  updateProfileValidation,
};
