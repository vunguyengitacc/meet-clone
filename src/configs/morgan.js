import chalk from 'chalk';
import morgan from 'morgan';

export const morganConfig = morgan(function (tokens, req, res) {
  return [
    chalk.blue.bold(tokens.method(req, res)),
    chalk.green.bold(tokens.status(req, res)),
    chalk.yellow.bold(tokens.url(req, res)),
    chalk.green.bold(`${tokens['response-time'](req, res)} ms`),
    chalk.red.bold(tokens.date(req, res)),
  ].join(' ');
});
