export const message = {
  error: {
    USER_NOT_FOUND: "User not found.",
    EMAIL_NOT_VERIFIED: "Your account is not verified. Please verify it.",
    PASSWORD_NOT_MATCH: "UserId or password is wrong.",
    TOKEN_NOT_SUPPLIED: "Auth token not supplied.",
    WRONG_TOKEN_SUPPLIED: "Wrong auth token is supplied.",
    ROLE_EXIST: "Role already exists.",
    ROLE_NOT_FOUND: "Role not found.",
    INVALID_UUID: "Invalid UUID supplied.",
    USER_EXIST: "User already exist.",
    NO_PAYLOAD_SUPPLIED: "Blank payload supplied.",
    INVALID_PASSWORD_FORMAT: "Password format invalid.",
    INVALID_CONFIRM_PASSWORD_FORMAT: "Confirm Password format invalid.",
    INVALID_EMAIL_FORMAT: "EmailId format invalid.",
    PASSWORD_CONFIRM_PASSWORD_SAME:
      "Password and Confirm password must be same.",

    //#region Permission validation error message
    PERMISSION_SET_NOT_EMPTY: "permissionSet cannot be an empty field.",
    PERMISSION_SET_REQUIRED: "Please fill permissionSet.",
    PERMISSION_SET_ONLY_OBJECT: "permissionSet must be a type of Object.",
    ROLE_PERMISSION_MAPPING_IS_EXIST: "Permission mapping already exist.",
    ROLE_PERMISSION_ID_NOT_FOUND: "Record not found.",
    ROLE_PERMISSION_ID_NOT_EMPTY: "rolePermissionId cannot be an empty field",
    ROLE_PERMISSION_ID_REQUIRED: "Please fill rolePermissionId.",
    //#endregion

    //#region Role validation message
    ROLE_ID_NOT_EMPTY: "roleId cannot be an empty field",
    ROLE_ID_REQUIRED: "Please fill roleId.",
    ROLE_NAME_NOT_EMPTY: "roleName cannot be an empty field.",
    ROLE_NAME_REQUIRED: "Please fill roleName.",
    ROLE_NAME_MAX_CHAR: "roleName maximum 50 characters long.",
    ROLE_DESCRIPTION_NOT_EMPTY: "description cannot be an empty field.",
    ROLE_DESCRIPTION_REQUIRED: "Please fill description.",
    ROLE_DESCRIPTION_MAX_CHAR: "description maximum 150 characters long.",
    ROLE_STATUS_NOT_EMPTY: "roleStatus cannot be an empty field.",
    ROLE_STATUS_REQUIRED: "Please fill roleStatus.",
    //#endregion

    //#region user validation message
    USER_FIRST_NAME_NOT_EMPTY: "firstName cannot be an empty field.",
    USER_FIRST_NAME_REQUIRED: "Please fill firstName.",
    USER_FIRST_NAME_MAX_CHAR: "firstName maximum 50 characters long.",

    USER_LAST_NAME_NOT_EMPTY: "lastName cannot be an empty field.",
    USER_LAST_NAME_REQUIRED: "Please fill lastName.",
    USER_LAST_NAME_MAX_CHAR: "lastName maximum 50 characters long.",

    USER_MOBILE_NUMBER_NOT_EMPTY: "mobileNumber cannot be an empty field.",
    USER_MOBILE_NUMBER_REQUIRED: "Please fill mobileNumber.",
    USER_MOBILE_NUMBER_MIN_CHAR: "mobileNumber should have 10 characters long.",
    USER_MOBILE_NUMBER_ONLY_DIGIT: "mobileNumber should be a type of digit.",

    USER_ID_NOT_EMPTY: "userId cannot be an empty field.",
    USER_ID_REQUIRED: "Please fill userId.",
    USER_ID_MAX_CHAR: "userId should have 20 characters long.",

    USER_EMAIL_NOT_EMPTY: "emailId cannot be an empty field.",
    USER_EMAIL_REQUIRED: "Please fill emailId.",
    USER_EMAIL_MAX_CHAR: "emailId should have 50 characters long.",

    USER_PASSWORD_NOT_EMPTY: "password cannot be an empty field.",
    USER_PASSWORD_REQUIRED: "Please fill password.",
    USER_PASSWORD_MIN_CHAR: "password should have 8 characters long.",

    USER_OLD_PASSWORD_NOT_EMPTY: "oldPassword cannot be an empty field.",
    USER_OLD_PASSWORD_REQUIRED: "Please fill oldPassword.",
    USER_OLD_PASSWORD_MIN_CHAR: "oldPassword should have 8 characters long.",

    USER_CONFIRM_PASSWORD_NOT_EMPTY:
      "confirmPassword cannot be an empty field.",
    USER_CONFIRM_PASSWORD_REQUIRED: "Please fill confirmPassword.",
    USER_CONFIRM_PASSWORD_MIN_CHAR:
      "confirmPassword should have 8 characters long.",

    USER_ROLE_NOT_EMPTY: "userRole cannot be an empty field.",
    USER_ROLE_REQUIRED: "Please fill userRole.",

    USER_STATUS_NOT_EMPTY: "status cannot be an empty field.",
    USER_STATUS_REQUIRED: "Please fill status.",
    USER_STATUS_ALLOW_ONLY_BOOLEAN: "status should be a type of boolean.",

    USER_OLD_NEW_PASSWORD_CAN_NOT_SAME:
      "User old password and new password can not be same.",
    USER_OLD_PASSWORD_NOT_MATCH: "Old password is wrong.",
    //#endregion

    //#region bumper validation message
    BUMPER_NAME_NOT_EMPTY: "bumperName cannot be an empty field. ",
    BUMPER_NAME_required: "Please fill bumperName. ",
    BUMPER_NAME_MAX_CHAR: "bumperName maximum 50 characters long.",

    ADVERTISER_ID_NOT_EMPTY: "advertiserId cannot be an empty field. ",
    ADVERTISER_ID_required: "Please fill advertiserId. ",

    BRAND_ID_NOT_EMPTY: "brandId cannot be an empty field. ",
    BRAND_ID_required: "Please fill brandId. ",

    CATEGORY_ID_NOT_EMPTY: "categoryId cannot be an empty field. ",
    CATEGORY_ID_required: "Please fill categoryId. ",

    PRODUCT_ID_NOT_EMPTY: "productId cannot be an empty field. ",
    PRODUCT_ID_required: "Please fill productId. ",

    VIDEO_UPLOAD_NOT_EMPTY: "Upload video cannot be an empty field. ",
    VIDEO_UPLOAD_required: "Please upload video. ",

    IS_ACTIVE_NOT_EMPTY: "isActive cannot be an empty field. ",
    IS_ACTIVE_required: "Please fill isActive. ",

    BUMPER_IDS_NOT_EMPTY: "bumperIds cannot be an empty field. ",
    BUMPER_IDS_required: "Please fill bumperIds. ",
    BUMPER_IDS_MUST_BE_ARRAY: "bumperIds should be an array.",
    //#endregion

    USER_INACTIVE: "You are inactive user.So can't login.",
    USER_TYPE_NOT_EMPTY: "userType cannot be an empty field.",
    USER_TYPE_REQUIRED: "Please fill userType",

    BUMPER_EXIST: "Bumper already exist. Bumper name should be unique.",
  },

  success: {
    USR_ADD: "User added successfully",
    USR_GET: "User loaded successfully",
    USR_UPDATE: "User updated successfully",
    USR_DELETE: "User deleted successfully.",
    USR_REG:
      "We have sent an email. Please verified your account for complete registration.",
    USR_LOGIN: "User logged in successfully.",
    USR_FORGOT_PASSWORD_UPDATE: "Forgot password updated successfully.",
    USER_STATUS_UPDATE: "User status successfully updated.",
    ROLE_ADD: "Role added successfully.",
    ROLE_UPDATE: "Role edited successfully.",
    ROLE_LIST: "Roles fetch successfully.",
    ROLE_DELETE: "Roles deleted successfully.",
    ROLE_FETCH: "Role fetched successfully.",
    ROLE_PERMISSION_MAPPING_ADD: "Permission mapping added successfully.",
    ROLE_PERMISSION_MAPPING_UPDATE: "Permission mapping updated successfully.",
    ROLE_PERMISSION_MAPPING_DELETE: "Permission mapping deleted successfully.",
    ROLE_PERMISSION_MAPPING_LIST: "Permission mapping list fetch successfully.",
    ROLE_PERMISSION_MAPPING_DETAIL:
      "Permission mapping detail fetch successfully.",
    FORGOT_OR_CHANGE_PASSWORD_UPDATE: "Password update successfully.",
    FORGOT_PASSWORD_LINK_SENT:
      "Forgot password link sent successfully. Please check your email.",
    CHANGE_PASSWORD_UPDATE: "Change password updated successfully.",
    BUMPER_ADD: "Bumper added successfully.",
    BUMPER_DELETE: "Bumper deleted successfully.",
    ROLE_ASSIGN_TO_USER: "Role assign to user successfully.",
  },
};
