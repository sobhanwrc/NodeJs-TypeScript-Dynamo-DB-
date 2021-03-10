import Joi from "joi";
import RequestWithUser from "../../interfaces/requestWithUser.interface";
import { NextFunction, Response } from "express";
import { message } from "../../constants/message.constant";

export async function addPermissionValidation(
  request: RequestWithUser,
  response: Response,
  next: NextFunction
): Promise<void | Response> {
  const rule = Joi.object({
    roleId: Joi.string().required().messages({
      "string.empty": message.error.ROLE_ID_NOT_EMPTY,
      "any.required": message.error.ROLE_ID_REQUIRED,
    }),

    permissionSet: Joi.object().required().messages({
      "object.empty": message.error.PERMISSION_SET_NOT_EMPTY,
      "any.required": message.error.PERMISSION_SET_REQUIRED,
      "object.base": message.error.PERMISSION_SET_ONLY_OBJECT,
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

export async function editPermissionValidation(
  request: RequestWithUser,
  response: Response,
  next: NextFunction
): Promise<void | Response> {
  const rule = Joi.object({
    rolePermissionId: Joi.string().required().messages({
      "string.empty": message.error.ROLE_PERMISSION_ID_NOT_EMPTY,
      "any.required": message.error.ROLE_PERMISSION_ID_REQUIRED,
    }),

    roleId: Joi.string().required().messages({
      "string.empty": message.error.ROLE_ID_NOT_EMPTY,
      "any.required": message.error.ROLE_ID_REQUIRED,
    }),

    permissionSet: Joi.object().required().messages({
      "object.empty": message.error.PERMISSION_SET_NOT_EMPTY,
      "any.required": message.error.PERMISSION_SET_REQUIRED,
      "object.base": message.error.PERMISSION_SET_ONLY_OBJECT,
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
