import { EOL } from "os";

export class TemplateString {
  private content: string[] = [];

  public push(value: string = "") {
    this.content.push(value + EOL);
  }

  public get value() {
    return this.content.join("");
  }
}
