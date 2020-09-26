import chalk from "chalk";

export class Logger {
  public info(msg: string) {
    return console.log(chalk.blue("info"), chalk.reset(msg));
  }

  public success(msg: string) {
    return console.log(chalk.green("success"), chalk.reset(msg));
  }

  public error(msg: string) {
    return console.log(chalk.red("error"), chalk.reset(msg));
  }

  public verbose(msg: string) {
    return console.log(chalk.yellow("verbose"), chalk.reset(msg));
  }

  public log(msg: string) {
    return console.log(msg);
  }
}
