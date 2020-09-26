import { EOL } from "os";

import {
  configurationTemplate,
  migrationTemplate,
} from "../src/utils/template";

describe("Templates", () => {
  it("should create configuration template", () => {
    const template = configurationTemplate();

    expect(template.includes(EOL)).toBe(true);
    expect(typeof template).toBe("string");
    expect(template.includes("module.exports")).toBe(true);
  });

  it("should create migrationTemplate", () => {
    const template = migrationTemplate();

    expect(template.includes(EOL)).toBe(true);
    expect(typeof template).toBe("string");
    expect(template.includes("export default {")).toBe(true);
  });

  it("should add banners if provided", () => {
    const template = migrationTemplate(false, "import batata");

    expect(template.includes("import batata")).toBe(true);

    const multiple = migrationTemplate(false, [
      "import potato",
      "import apple",
    ]);

    expect(multiple.includes("import potato")).toBe(true);
    expect(multiple.includes("import apple")).toBe(true);
  });

  it("should import as type", () => {
    const template = migrationTemplate(true);

    expect(template.includes("import type knex")).toBe(true);

    const noType = migrationTemplate(false);

    expect(noType.includes("import knex")).toBe(true);
  });
});
