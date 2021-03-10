/* eslint-disable @typescript-eslint/ban-types */
class ResponseBase {
  status: number;
  success: boolean;
  message: string;
  payload: object;
}

export default ResponseBase;
