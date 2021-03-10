import Joi from "joi";
import RequestWithUser from "../../interfaces/requestWithUser.interface";
import { NextFunction, Response } from "express";
import { message } from "../../constants/message.constant";

const validEmailFormat = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
const validPasswordFormat = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,50}$/;

export default async function userAddValidation(
  request: RequestWithUser,
  response: Response,
  next: NextFunction
): Promise<void | Response> {
  const rule = Joi.object({
    firstName: Joi.string().required().max(50).messages({
      "string.empty": message.error.USER_FIRST_NAME_NOT_EMPTY,
      "any.required": message.error.USER_FIRST_NAME_REQUIRED,
      "string.max": message.error.USER_FIRST_NAME_MAX_CHAR,
    }),
    lastName: Joi.string().required().max(50).messages({
      "string.empty": message.error.USER_LAST_NAME_NOT_EMPTY,
      "any.required": message.error.USER_LAST_NAME_REQUIRED,
      "string.max": message.error.USER_LAST_NAME_MAX_CHAR,
    }),
    mobileNumber: Joi.number().required().min(10).messages({
      "number.empty": message.error.USER_MOBILE_NUMBER_NOT_EMPTY,
      "any.required": message.error.USER_MOBILE_NUMBER_REQUIRED,
      "number.min": message.error.USER_MOBILE_NUMBER_MIN_CHAR,
      "number.base": message.error.USER_MOBILE_NUMBER_ONLY_DIGIT,
    }),
    userId: Joi.string().required().max(20).messages({
      "string.empty": message.error.USER_ID_NOT_EMPTY,
      "any.required": message.error.USER_ID_REQUIRED,
      "string.max": message.error.USER_ID_MAX_CHAR,
    }),
    emailId: Joi.string().required().max(50).messages({
      "string.empty": message.error.USER_EMAIL_NOT_EMPTY,
      "any.required": message.error.USER_EMAIL_REQUIRED,
      "string.max": message.error.USER_EMAIL_MAX_CHAR,
    }),
    userRole: Joi.string().required().messages({
      "string.empty": message.error.USER_ROLE_NOT_EMPTY,
      "any.required": message.error.USER_ROLE_REQUIRED,
    }),
  });

  const value = await rule.validate(request.body);

  const checkingBasicValidation = await basicValidation(value, request.body);
  if (checkingBasicValidation.status === true) {
    return response.status(400).json({
      success: false,
      message: checkingBasicValidation.message,
      data: {},
    });
  }
  next();
}

export async function userStatusChangedValidation(
  request: RequestWithUser,
  response: Response,
  next: NextFunction
): Promise<void | Response> {
  const rule = Joi.object({
    status: Joi.boolean().required().messages({
      "boolean.empty": message.error.USER_STATUS_NOT_EMPTY,
      "any.required": message.error.USER_STATUS_REQUIRED,
      "boolean.base": message.error.USER_STATUS_ALLOW_ONLY_BOOLEAN,
    }),
    emailId: Joi.string().required().max(50).messages({
      "string.empty": message.error.USER_EMAIL_NOT_EMPTY,
      "any.required": message.error.USER_EMAIL_REQUIRED,
      "string.max": message.error.USER_EMAIL_MAX_CHAR,
    }),
  });

  const value = await rule.validate(request.body);
  const checkingBasicValidation = await basicValidation(value, request.body);
  if (checkingBasicValidation.status === true) {
    return response.status(400).json({
      success: false,
      message: checkingBasicValidation.message,
      data: {},
    });
  }
  next();
}

export async function userUpdateValidation(
  request: RequestWithUser,
  response: Response,
  next: NextFunction
): Promise<void | Response> {
  const rule = Joi.object({
    firstName: Joi.string().required().max(50).messages({
      "string.empty": message.error.USER_FIRST_NAME_NOT_EMPTY,
      "any.required": message.error.USER_FIRST_NAME_REQUIRED,
      "string.max": message.error.USER_FIRST_NAME_MAX_CHAR,
    }),
    lastName: Joi.string().required().max(50).messages({
      "string.empty": message.error.USER_LAST_NAME_NOT_EMPTY,
      "any.required": message.error.USER_LAST_NAME_REQUIRED,
      "string.max": message.error.USER_LAST_NAME_MAX_CHAR,
    }),
    emailId: Joi.string().required().max(50).messages({
      "string.empty": message.error.USER_EMAIL_NOT_EMPTY,
      "any.required": message.error.USER_EMAIL_REQUIRED,
      "string.max": message.error.USER_EMAIL_MAX_CHAR,
    }),
    mobileNumber: Joi.number().required().min(10).messages({
      "number.empty": message.error.USER_MOBILE_NUMBER_NOT_EMPTY,
      "any.required": message.error.USER_MOBILE_NUMBER_REQUIRED,
      "number.min": message.error.USER_MOBILE_NUMBER_MIN_CHAR,
      "number.base": message.error.USER_MOBILE_NUMBER_ONLY_DIGIT,
    }),
    userRole: Joi.string().required().messages({
      "string.empty": message.error.USER_ROLE_NOT_EMPTY,
      "any.required": message.error.USER_ROLE_REQUIRED,
    }),
    status: Joi.boolean().required().messages({
      "boolean.empty": message.error.USER_STATUS_NOT_EMPTY,
      "any.required": message.error.USER_STATUS_REQUIRED,
    }),
  });

  const value = await rule.validate(request.body);
  const checkingBasicValidation = await basicValidation(value, request.body);
  if (checkingBasicValidation.status === true) {
    return response.status(400).json({
      success: false,
      message: checkingBasicValidation.message,
      data: {},
    });
  }
  next();
}

export async function userRegistrationValidation(
  request: RequestWithUser,
  response: Response,
  next: NextFunction
): Promise<void | Response> {
  const rule = Joi.object({
    firstName: Joi.string().required().max(50).messages({
      "string.empty": message.error.USER_FIRST_NAME_NOT_EMPTY,
      "any.required": message.error.USER_FIRST_NAME_REQUIRED,
      "string.max": message.error.USER_FIRST_NAME_MAX_CHAR,
    }),
    lastName: Joi.string().required().max(50).messages({
      "string.empty": message.error.USER_LAST_NAME_NOT_EMPTY,
      "any.required": message.error.USER_LAST_NAME_REQUIRED,
      "string.max": message.error.USER_LAST_NAME_MAX_CHAR,
    }),
    mobileNumber: Joi.number().required().min(10).messages({
      "number.empty": message.error.USER_MOBILE_NUMBER_NOT_EMPTY,
      "any.required": message.error.USER_MOBILE_NUMBER_REQUIRED,
      "number.min": message.error.USER_MOBILE_NUMBER_MIN_CHAR,
      "number.base": message.error.USER_MOBILE_NUMBER_ONLY_DIGIT,
    }),
    userId: Joi.string().required().max(20).messages({
      "string.empty": message.error.USER_ID_NOT_EMPTY,
      "any.required": message.error.USER_ID_REQUIRED,
      "string.max": message.error.USER_ID_MAX_CHAR,
    }),
    emailId: Joi.string().required().max(50).messages({
      "string.empty": message.error.USER_EMAIL_NOT_EMPTY,
      "any.required": message.error.USER_EMAIL_REQUIRED,
      "string.max": message.error.USER_EMAIL_MAX_CHAR,
    }),
    password: Joi.string().required().min(8).messages({
      "string.empty": message.error.USER_PASSWORD_NOT_EMPTY,
      "any.required": message.error.USER_PASSWORD_REQUIRED,
      "string.min": message.error.USER_PASSWORD_MIN_CHAR,
    }),
    confirmPassword: Joi.string().required().min(8).messages({
      "string.empty": message.error.USER_CONFIRM_PASSWORD_NOT_EMPTY,
      "any.required": message.error.USER_CONFIRM_PASSWORD_REQUIRED,
      "string.min": message.error.USER_CONFIRM_PASSWORD_MIN_CHAR,
    }),
  });

  const value = await rule.validate(request.body);
  const checkingBasicValidation = await basicValidation(value, request.body);
  if (checkingBasicValidation.status === true) {
    return response.status(400).json({
      success: false,
      message: checkingBasicValidation.message,
      data: {},
    });
  }
  next();
}

export async function userLoginValidation(
  request: RequestWithUser,
  response: Response,
  next: NextFunction
): Promise<void | Response> {
  const rule = Joi.object({
    emailId: Joi.string().required().max(50).messages({
      "string.empty": message.error.USER_EMAIL_NOT_EMPTY,
      "any.required": message.error.USER_EMAIL_REQUIRED,
      "string.max": message.error.USER_EMAIL_MAX_CHAR,
    }),
    password: Joi.string().required().min(8).messages({
      "string.empty": message.error.USER_PASSWORD_NOT_EMPTY,
      "any.required": message.error.USER_PASSWORD_REQUIRED,
      "string.min": message.error.USER_PASSWORD_MIN_CHAR,
    }),
  });
  const value = await rule.validate(request.body);

  const checkingBasicValidation = await basicValidation(value, request.body);
  if (checkingBasicValidation.status === true) {
    return response.status(400).json({
      success: false,
      message: checkingBasicValidation.message,
      data: {},
    });
  }
  next();
}

export async function userForgotPasswordValidation(
  request: RequestWithUser,
  response: Response,
  next: NextFunction
): Promise<void | Response> {
  const rule = Joi.object({
    emailId: Joi.string().required().max(50).messages({
      "string.empty": message.error.USER_EMAIL_NOT_EMPTY,
      "any.required": message.error.USER_EMAIL_REQUIRED,
      "string.max": message.error.USER_EMAIL_MAX_CHAR,
    }),
  });
  const value = await rule.validate(request.body);

  const checkingBasicValidation = await basicValidation(value, request.body);
  if (checkingBasicValidation.status === true) {
    return response.status(400).json({
      success: false,
      message: checkingBasicValidation.message,
      data: {},
    });
  }
  next();
}

export async function userForgotPasswordUpdateValidation(
  request: RequestWithUser,
  response: Response,
  next: NextFunction
): Promise<void | Response> {
  const rule = Joi.object({
    emailId: Joi.string().required().max(50).messages({
      "string.empty": message.error.USER_EMAIL_NOT_EMPTY,
      "any.required": message.error.USER_EMAIL_REQUIRED,
      "string.max": message.error.USER_EMAIL_MAX_CHAR,
    }),
    password: Joi.string().required().min(8).messages({
      "string.empty": message.error.USER_PASSWORD_NOT_EMPTY,
      "any.required": message.error.USER_PASSWORD_REQUIRED,
      "string.min": message.error.USER_PASSWORD_MIN_CHAR,
    }),
    confirmPassword: Joi.string().required().min(8).messages({
      "string.empty": message.error.USER_CONFIRM_PASSWORD_NOT_EMPTY,
      "any.required": message.error.USER_CONFIRM_PASSWORD_REQUIRED,
      "string.min": message.error.USER_CONFIRM_PASSWORD_MIN_CHAR,
    }),
  });
  const value = await rule.validate(request.body);

  const checkingBasicValidation = await basicValidation(value, request.body);
  if (checkingBasicValidation.status === true) {
    return response.status(400).json({
      success: false,
      message: checkingBasicValidation.message,
      data: {},
    });
  }
  next();
}

export async function userChangePasswordValidation(
  request: RequestWithUser,
  response: Response,
  next: NextFunction
): Promise<void | Response> {
  const rule = Joi.object({
    emailId: Joi.string().required().max(50).messages({
      "string.empty": message.error.USER_EMAIL_NOT_EMPTY,
      "any.required": message.error.USER_EMAIL_REQUIRED,
      "string.max": message.error.USER_EMAIL_MAX_CHAR,
    }),
    oldPassword: Joi.string().required().min(8).messages({
      "string.empty": message.error.USER_OLD_PASSWORD_NOT_EMPTY,
      "any.required": message.error.USER_OLD_PASSWORD_REQUIRED,
      "string.min": message.error.USER_OLD_PASSWORD_MIN_CHAR,
    }),
    password: Joi.string().required().min(8).messages({
      "string.empty": message.error.USER_PASSWORD_NOT_EMPTY,
      "any.required": message.error.USER_PASSWORD_REQUIRED,
      "string.min": message.error.USER_PASSWORD_MIN_CHAR,
    }),
    confirmPassword: Joi.string().required().min(8).messages({
      "string.empty": message.error.USER_CONFIRM_PASSWORD_NOT_EMPTY,
      "any.required": message.error.USER_CONFIRM_PASSWORD_REQUIRED,
      "string.min": message.error.USER_CONFIRM_PASSWORD_MIN_CHAR,
    }),
  });
  const value = await rule.validate(request.body);

  const checkingBasicValidation = await basicValidation(value, request.body);
  if (checkingBasicValidation.status === true) {
    return response.status(400).json({
      success: false,
      message: checkingBasicValidation.message,
      data: {},
    });
  }
  next();
}

export async function userListValidation(
  request: RequestWithUser,
  response: Response,
  next: NextFunction
): Promise<void | Response> {
  const rule = Joi.object({
    userType: Joi.string().required().messages({
      "boolean.empty": message.error.USER_TYPE_NOT_EMPTY,
      "any.required": message.error.USER_TYPE_REQUIRED,
    }),
  });

  const value = await rule.validate(request.body);
  const checkingBasicValidation = await basicValidation(value, request.body);
  if (checkingBasicValidation.status === true) {
    return response.status(400).json({
      success: false,
      message: checkingBasicValidation.message,
      data: {},
    });
  }
  next();
}

async function basicValidation(value, payload) {
  if (Object.keys(payload).length === 0) {
    return {
      status: true,
      message: message.error.NO_PAYLOAD_SUPPLIED,
    };
  }

  if (value.error) {
    const errorMessage = JSON.parse(JSON.stringify(value.error, null, 2));

    return {
      status: true,
      message: errorMessage.details[0].message,
    };
  }

  if (payload.password) {
    if (!payload.password.match(validPasswordFormat)) {
      return {
        status: true,
        message: message.error.INVALID_PASSWORD_FORMAT,
      };
    }
  }

  if (payload.confirmPassword) {
    if (!payload.confirmPassword.match(validPasswordFormat)) {
      return {
        status: true,
        message: message.error.INVALID_CONFIRM_PASSWORD_FORMAT,
      };
    }
  }

  if (payload.confirmPassword && payload.password) {
    if (payload.confirmPassword !== payload.password) {
      return {
        status: true,
        message: message.error.PASSWORD_CONFIRM_PASSWORD_SAME,
      };
    }
  }

  if (payload.emailId) {
    if (!payload.emailId.toLowerCase().match(validEmailFormat)) {
      return {
        status: true,
        message: message.error.INVALID_EMAIL_FORMAT,
      };
    }
  }

  return {
    status: false,
  };
}
