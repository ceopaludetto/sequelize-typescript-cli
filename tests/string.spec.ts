import { TemplateString } from "../src/utils/string";

import { EOL } from "os";

describe("String", () => {
  it("should create a template string based on current system EOL", () => {
    const template = new TemplateString();

    template.push("test");

    expect(template.value).toBe(`test${EOL}`);
  });

  it("should break line in every push", () => {
    const template = new TemplateString();

    template.push("test");
    template.push("test");

    expect(template.value).toBe(`test${EOL}test${EOL}`);
  });
});
