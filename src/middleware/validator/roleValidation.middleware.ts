import Joi, * as Validator from "joi"
import RequestWithUser from '../../interfaces/requestWithUser.interface';
import { NextFunction, Response } from 'express';

export async function addRoleValidation(request: RequestWithUser, response: Response, next: NextFunction) {
    const rule = Joi.object({
        roleName : Joi.string().required().max(50).messages({
            'string.empty': `roleName cannot be an empty field.`,
            'any.required': `Please fill roleName.`,
            'string.max': `roleName maximum 50 characters long.`
        }),

        description : Joi.string().required().max(150).messages({
            'string.empty': `description cannot be an empty field.`,
            'any.required': `Please fill description.`,
            'string.max': `description maximum 150 characters long.`
        }),
    })

    const value = await rule.validate(request.body);

    const checkingBasicValidation = await basicValidation(value, request.body);
    if(checkingBasicValidation.status === true){
        return response.status(400).json({
            message: checkingBasicValidation.message,
            data: {}
        });
    }
    next();
}

export async function editRoleValidation(request: RequestWithUser, response: Response, next: NextFunction) {
    const rule = Joi.object({
        roleId : Joi.string().required().messages({
            'string.empty': `roleId cannot be an empty field.`,
            'any.required': `Please fill roleId.`
        }),
        roleName : Joi.string().required().max(50).messages({
            'string.empty': `roleName cannot be an empty field.`,
            'any.required': `Please fill roleName.`,
            'string.max': `roleName maximum 50 characters long.`
        }),
        description : Joi.string().required().max(150).messages({
            'string.empty': `description cannot be an empty field.`,
            'any.required': `Please fill description.`,
            'string.max': `description maximum 150 characters long.`
        }),

        status : Joi.boolean().required().messages({
            'boolean.empty': `status cannot be an empty field.`,
            'any.required': `Please fill status.`
        }),
    })

    const value = await rule.validate(request.body);

    const checkingBasicValidation = await basicValidation(value, request.body);
    if(checkingBasicValidation.status === true){
        return response.status(400).json({
            message: checkingBasicValidation.message,
            data: {}
        });
    }
    next();
}

async function basicValidation(value, payload) {
    if(Object.keys(payload).length === 0){
        return{
            status : true,
            message : "Blank payload supplied."
        }
    }

    if(value.error){
        const errorMessage = JSON.parse(JSON.stringify(value.error, null, 2))

        return{
            status : true,
            message : errorMessage.details[0].message
        }
    }

    return{
        status : false
    }
}