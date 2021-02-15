import Joi, * as Validator from "joi"
import RequestWithUser from '../../interfaces/requestWithUser.interface';
import { NextFunction, Response } from 'express';

export default async function userAddValidation(request: RequestWithUser, response: Response, next: NextFunction) {
    const validEmailFormat = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
    const validPasswordFormat = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,50}$/;
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
        password : Joi.string().required().min(8).messages({
            'string.empty': `password cannot be an empty field.`,
            'any.required': `Please fill password.`,
            'string.min': `Minimum length 8 characters.`
        }),
        userRole: Joi.string().required().messages({
            'string.empty': `userRole cannot be an empty field.`,
            'any.required': `Please fill userRole.`
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
    }else if(!(request.body.password).match(validPasswordFormat)){
        return response.status(400).json({
            message: "Password format invalid.",
            data: {}
        });
    }else{
        next();
    }
}

export async function userStatusChangedValidation(request: RequestWithUser, response: Response, next: NextFunction) {
    const rule = Joi.object({
        status : Joi.boolean().required().messages({
            'boolean.empty': `status cannot be an empty field.`,
            'any.required': `Please fill status.`,
            'boolean.base' : `status should be a type of boolean.`
        }),
    });

    const value = await rule.validate(request.body);

    if(Object.keys(request.body).length === 0){
        return response.status(400).json({
            message: "Blank payload supplied.",
            data: {}
        });
    }else if(value.error){
        const errorMessage = JSON.parse(JSON.stringify(value.error, null, 2))
        
        return response.status(400).json({
            message: errorMessage.details[0].message,
            data: {}
        });
    }else{
        next();
    }
}

export async function userUpdateValidation(request: RequestWithUser, response: Response, next: NextFunction) {
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
        userRole: Joi.string().required().messages({
            'string.empty': `userRole cannot be an empty field.`,
            'any.required': `Please fill userRole.`
        }),
        status : Joi.boolean().required().messages({
            'boolean.empty': `status cannot be an empty field.`,
            'any.required': `Please fill status.`
        }),
    })

    const value = await rule.validate(request.body);

    if(value.error){
        const errorMessage = JSON.parse(JSON.stringify(value.error, null, 2))
        
        return response.status(400).json({
            message: errorMessage.details[0].message,
            data: {}
        });
    }else{
        next();
    }
}

export async function userRegistrationValidation(request: RequestWithUser, response: Response, next: NextFunction) {
    const validEmailFormat = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
    const validPasswordFormat = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,50}$/;
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
        password : Joi.string().required().min(8).messages({
            'string.empty': `password cannot be an empty field.`,
            'any.required': `Please fill password.`,
            'string.min': `Minimum length 8 characters.`
        }),
        confirmPassword : Joi.string().required().min(8).messages({
            'string.empty': `confirmPassword cannot be an empty field.`,
            'any.required': `Please fill confirmPassword.`,
            'string.min': `Minimum length 8 characters.`
        })
    })

    const value = await rule.validate(request.body);

    if(Object.keys(request.body).length === 0){
        return response.status(400).json({
            message: "Blank payload supplied.",
            data: {}
        });
    }else if(value.error){
        const errorMessage = JSON.parse(JSON.stringify(value.error, null, 2))
        
        return response.status(400).json({
            message: errorMessage.details[0].message,
            data: {}
        });
    }else if(!(request.body.emailId).toLowerCase().match(validEmailFormat)){
        return response.status(400).json({
            message: "Email format invalid.",
            data: {}
        });
    }else if(request.body.confirmPassword !== request.body.password){
        return response.status(400).json({
            message: "Password and Confirm password must be same.",
            data: {}
        });
    }else if(!(request.body.confirmPassword).match(validPasswordFormat)){
        return response.status(400).json({
            message: "Password format invalid.",
            data: {}
        });
    }else{
        next();
    }
}

export async function userLoginValidation(request: RequestWithUser, response: Response, next: NextFunction) {
    const validEmailFormat = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
    const validPasswordFormat = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,50}$/;
    const rule = Joi.object({
        userId : Joi.string().required().max(50).messages({
            'string.empty': `userId cannot be an empty field.`,
            'any.required': `Please fill userId.`,
            'string.max': `userId maximum 50 characters long.`
        }),
        password : Joi.string().required().min(8).messages({
            'string.empty': `password cannot be an empty field.`,
            'any.required': `Please fill password.`,
            'string.min': `Minimum length 8 characters.`
        })
    })

    const value = await rule.validate(request.body);

    if(Object.keys(request.body).length === 0){
        return response.status(400).json({
            message: "Blank payload supplied.",
            data: {}
        });
    }else if(value.error){
        const errorMessage = JSON.parse(JSON.stringify(value.error, null, 2))
        
        return response.status(400).json({
            message: errorMessage.details[0].message,
            data: {}
        });
    }else if(!(request.body.password).match(validPasswordFormat)){
        return response.status(400).json({
            message: "Password format invalid.",
            data: {}
        });
    }else if(!(request.body.userId).toLowerCase().match(validEmailFormat)){
        return response.status(400).json({
            message: "UserId format invalid.",
            data: {}
        });
    }else{
        next();
    }
}