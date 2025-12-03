const winston = require("winston")
require("winston-daily-rotate-file")

const path = require("path")

const transport = new winston.transports.DailyRotateFile({
  filename: path.join("_logs", "%DATE%.log"),
  datePattern: "DDMMYYYY",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "7d",
})

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.errors({ stack: true }),
    winston.format.timestamp({ format: "DD-MM-YYYY HH:mm:ss" }),
    winston.format.prettyPrint()
  ),
  transports: [
    transport,
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: "HH:mm:ss" }),
        winston.format.printf(({ timestamp, level, message }) => {
          return `${timestamp} [${level}]: ${message}`
        })
      ),
    }),
  ],
})

module.exports = logger
