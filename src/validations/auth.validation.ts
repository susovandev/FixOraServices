import joi from 'joi';

export const userLoginSchema = joi.object({
  phone: joi
    .string()
    .pattern(/^\d{10}$/)
    .required()
    .messages({
      'string.base': 'Phone number must be a string',
      'string.empty': 'Phone number is required',
      'string.pattern.base': 'Phone number must be 10 digits',
    }),
});
