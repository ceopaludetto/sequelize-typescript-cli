import { TemplateString } from "./string";

export function configurationTemplate() {
  let template = new TemplateString();
  template.push("module.exports = {");
  template.push("\tsequelize: {");
  template.push('\t\tdialect: "",');
  template.push("\t},");
  template.push('\tmigrations: "path/to/some/dir",');
  template.push('\tseeds: "path/to/some/dir",');
  template.push("};");

  return template.value;
}

export function migrationTemplate(banners?: string | string[]) {
  let template = new TemplateString();
  template.push('import SequelizeStatic, { QueryInterface } from "sequelize"');
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
  template.push(
    "\tasync up(queryInterface: QueryInterface, Sequelize: typeof SequelizeStatic) {"
  );
  template.push("\t\t// content");
  template.push("\t},");
  template.push();
  template.push(
    "\tasync down(queryInterface: QueryInterface, Sequelize: typeof SequelizeStatic) {"
  );
  template.push("\t\t// content");
  template.push("\t},");
  template.push("}");
  return template.value;
}
