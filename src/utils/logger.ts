/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
import winston from "winston";
import { createLogger, format, transports } from "winston";
const { combine, timestamp, label, prettyPrint, printf } = format;
import "dotenv/config";

const myFormat = printf(({ level, message, label, timestamp }) => {
  return JSON.stringify({
    message: `${message}`,
    level: `${level}`,
    timestamp: `${timestamp}`,
  });
  // return `${timestamp} ${level}: ${message}`;
});

export const createLogFile = () => {
  try {
    const level = "debug";
    const commonLog = winston.createLogger({
      format: combine(timestamp(), myFormat),
      transports: [
        new winston.transports.Console({
          level: level,
        }),
        new winston.transports.File({
          filename: `log/${process.env.NODE_ENV}.txt`,
          maxsize: Number(process.env.LOG_FILE_SIZE_BYTES),
        }),
      ],
    });
    return commonLog;
  } catch (e) {
    console.log("createLogFile", e);
  }
};
