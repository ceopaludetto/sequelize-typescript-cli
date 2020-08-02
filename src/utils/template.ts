import { TemplateString } from "./string";

export function configurationTemplate() {
  let template = new TemplateString();
  template.push("module.exports = {");
  template.push("\tknex: {");
  template.push('\t\tclient: "",');
  template.push("\t\tconnection: {");
  template.push('\t\t\thost: "",');
  template.push("\t\t}");
  template.push("\t},");
  template.push('\tmigrations: "path/to/some/dir",');
  template.push('\tseeds: "path/to/some/dir",');
  template.push("};");

  return template.value;
}

export function migrationTemplate(banners?: string | string[]) {
  let template = new TemplateString();
  template.push('import knex from "knex"');
  template.push();
  if (banners) {
    if (typeof banners === "string") {
      banners = banners.split("\n");
    }

    banners.forEach((b) => {
      template.push(b.replace(/\s/g, " "));
    });
  }
  template.push();
  template.push("export default {");
  template.push("\tasync up(k: ReturnType<typeof knex>) {");
  template.push("\t\t// content");
  template.push("\t},");
  template.push();
  template.push("\tasync down(k: ReturnType<typeof knex>) {");
  template.push("\t\t// content");
  template.push("\t},");
  template.push("}");
  return template.value;
}
