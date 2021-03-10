import Joi from "joi";
import RequestWithUser from "../../interfaces/requestWithUser.interface";
import { NextFunction, Response } from "express";
import { message } from "../../constants/message.constant";

export async function addRoleValidation(
  request: RequestWithUser,
  response: Response,
  next: NextFunction
): Promise<void | Response> {
  const rule = Joi.object({
    roleName: Joi.string().required().max(50).messages({
      "string.empty": message.error.ROLE_NAME_NOT_EMPTY,
      "any.required": message.error.ROLE_NAME_REQUIRED,
      "string.max": message.error.ROLE_NAME_MAX_CHAR,
    }),

    description: Joi.string().required().max(150).messages({
      "string.empty": message.error.ROLE_DESCRIPTION_NOT_EMPTY,
      "any.required": message.error.ROLE_DESCRIPTION_REQUIRED,
      "string.max": message.error.ROLE_DESCRIPTION_MAX_CHAR,
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

export async function editRoleValidation(
  request: RequestWithUser,
  response: Response,
  next: NextFunction
): Promise<void | Response> {
  const rule = Joi.object({
    roleId: Joi.string().required().messages({
      "string.empty": message.error.ROLE_ID_NOT_EMPTY,
      "any.required": message.error.ROLE_ID_REQUIRED,
    }),
    roleName: Joi.string().required().max(50).messages({
      "string.empty": message.error.ROLE_NAME_NOT_EMPTY,
      "any.required": message.error.ROLE_NAME_REQUIRED,
      "string.max": message.error.ROLE_NAME_MAX_CHAR,
    }),
    description: Joi.string().required().max(150).messages({
      "string.empty": message.error.ROLE_DESCRIPTION_NOT_EMPTY,
      "any.required": message.error.ROLE_DESCRIPTION_REQUIRED,
      "string.max": message.error.ROLE_DESCRIPTION_MAX_CHAR,
    }),

    roleStatus: Joi.boolean().required().messages({
      "boolean.empty": message.error.ROLE_STATUS_NOT_EMPTY,
      "any.required": message.error.ROLE_STATUS_REQUIRED,
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

export async function assignRoleValidation(
  request: RequestWithUser,
  response: Response,
  next: NextFunction
): Promise<void | Response> {
  const rule = Joi.object({
    roleId: Joi.string().required().messages({
      "string.empty": message.error.ROLE_ID_NOT_EMPTY,
      "any.required": message.error.ROLE_ID_REQUIRED,
    }),
    userIds: Joi.array().required().messages({
      "array.empty": message.error.USER_ID_NOT_EMPTY,
      "any.required": message.error.USER_ID_REQUIRED,
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

  return {
    status: false,
  };
}
