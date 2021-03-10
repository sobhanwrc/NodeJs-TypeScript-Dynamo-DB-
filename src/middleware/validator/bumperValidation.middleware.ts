/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Joi from "joi";
import * as express from "express";
import { NextFunction, Response } from "express";
import { message } from "../../constants/message.constant";

export async function addBumpersValidation(
  req: express.Request,
  response: Response,
  next: NextFunction
): Promise<void | Response> {
  const rule = Joi.object({
    bumperName: Joi.string().required().max(50).messages({
      "string.empty": message.error.BUMPER_NAME_NOT_EMPTY,
      "any.required": message.error.BUMPER_NAME_required,
      "string.max": message.error.BUMPER_NAME_MAX_CHAR,
    }),

    advertiserId: Joi.string().required().messages({
      "string.empty": message.error.ADVERTISER_ID_NOT_EMPTY,
      "any.required": message.error.ADVERTISER_ID_required,
    }),

    brandId: Joi.string().required().messages({
      "string.empty": message.error.BRAND_ID_NOT_EMPTY,
      "any.required": message.error.BRAND_ID_required,
    }),

    categoryId: Joi.string().required().messages({
      "string.empty": message.error.CATEGORY_ID_NOT_EMPTY,
      "any.required": message.error.CATEGORY_ID_required,
    }),

    productId: Joi.string().required().messages({
      "string.empty": message.error.PRODUCT_ID_NOT_EMPTY,
      "any.required": message.error.PRODUCT_ID_required,
    }),

    isActive: Joi.boolean().required().messages({
      "boolean.empty": message.error.IS_ACTIVE_NOT_EMPTY,
      "any.required": message.error.IS_ACTIVE_required,
    }),
  });

  const value = await rule.validate(req.body);

  const checkingBasicValidation = await basicValidation(value);
  if (checkingBasicValidation.status === true) {
    return response.status(400).json({
      success: false,
      message: checkingBasicValidation.message,
      data: {},
    });
  }
  next();
}

export async function deleteBumpersValidation(
  req: express.Request,
  response: Response,
  next: NextFunction
): Promise<void | Response> {
  const rule = Joi.object({
    bumperIds: Joi.array().required().max(50).messages({
      "array.empty": message.error.BUMPER_IDS_NOT_EMPTY,
      "any.required": message.error.BUMPER_IDS_required,
      "array.base": message.error.BUMPER_IDS_MUST_BE_ARRAY,
    }),
  });
  const value = await rule.validate(req.body);

  const checkingBasicValidation = await basicValidation(value);
  if (checkingBasicValidation.status === true) {
    return response.status(400).json({
      success: false,
      message: checkingBasicValidation.message,
      data: {},
    });
  }
  next();
}

async function basicValidation(value) {
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
