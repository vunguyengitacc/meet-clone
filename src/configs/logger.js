import chalk from 'chalk';

export const logger = (type, message) => {
  switch (type) {
    case 'Success':
      return console.log(chalk.green(message));
    case 'Info':
      return console.log(chalk.blue(message));
    case 'Notify':
      return console.log(chalk.green(message));
    case 'Error':
      return console.log(chalk.red(message));
  }
};
