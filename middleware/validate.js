import { handleValidationError } from '../validation/schemas.js';

export const validate = (schema) => {
  return (req, res, next) => {
    try {
      const validatedData = schema.parse(req.body);
      req.validatedData = validatedData;
      next();
    } catch (error) {
      const validationError = handleValidationError(error);
      return res.status(400).json(validationError);
    }
  };
}; 