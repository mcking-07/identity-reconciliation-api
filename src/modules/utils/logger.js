const { createLogger, transports, format } = require('winston');
const { colorize, combine, timestamp, label, printf } = format;

const formatter = printf((info) => `[${info.timestamp}] [${info.label}] [${info.level}]: ${info.message} ${info.meta ? JSON.stringify(info.meta) : ''}`);

const loggerFor = (module, { info = true, error = true } = { info: true, error: true }) => {
  const path = module.filename.split('/').slice(-3).join('/');

  return createLogger({
    format: combine(colorize({ level: true }), label({ label: path }), timestamp({ format: 'YYYY-MM-DDTHH:mm:ss' }), formatter),
    transports: [
      new transports.Console({ level: 'info', format: combine(label({ label: path }), timestamp(), formatter), silent: !info }),
      new transports.Console({ level: 'error', format: combine(label({ label: path }), timestamp(), formatter), silent: !error }),
    ]
  });
};

module.exports = loggerFor;
