import Joi, * as Validator from "joi"
import RequestWithUser from '../../interfaces/requestWithUser.interface';
import { NextFunction, Response } from 'express';

export default async function userAddValidation(request: RequestWithUser, response: Response, next: NextFunction) {
    const validEmailFormat = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
    const rule = Joi.object({
        firstName : Joi.string().required().max(50).messages({
            'string.empty': `firstName cannot be an empty field.`,
            'any.required': `Please fill firstName.`,
            'string.max': `firstName maximum 50 characters long.`
        }),
        lastName : Joi.string().required().max(50).messages({
            'string.empty': `lastName cannot be an empty field.`,
            'any.required': `Please fill lastName.`,
            'string.max': `lastName maximum 50 characters long.`
        }),
        mobileNumber : Joi.number().required().min(10).messages({
            'number.empty': `mobileNumber cannot be an empty field.`,
            'any.required': `Please fill mobileNumber.`,
            'number.max': `mobileNumber should have 10 characters long.`,
            'number.min': `mobileNumber should have 10 characters long.`,
            'number.base' : `mobileNumber should be a type of digit.`
        }),
        emailId : Joi.string().required().max(50).messages({
            'string.empty': `emailId cannot be an empty field.`,
            'any.required': `Please fill emailId.`,
            'string.max': `emailId maximum 50 characters long.`
        }),
        role: Joi.string().required().messages({
            'string.empty': `role cannot be an empty field.`,
            'any.required': `Please fill role.`
        }),
        status : Joi.boolean().optional().messages({
            'boolean.empty': `status cannot be an empty field.`,
            'any.required': `Please fill status.`
        }),
    })

    const value = await rule.validate(request.body);

    if(value.error){
        const errorMessage = JSON.parse(JSON.stringify(value.error, null, 2))
        console.log(errorMessage, 'errorMessage');
        
        return response.status(400).json({
            message: errorMessage.details[0].message,
            data: {}
        });
    }else if(!(request.body.emailId).toLowerCase().match(validEmailFormat)){
        return response.status(400).json({
            message: "Email format invalid.",
            data: {}
        });
    }else{
        next();
    }
}