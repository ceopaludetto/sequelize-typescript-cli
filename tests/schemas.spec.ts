import { configSchema } from "../src/utils/schemas";

describe("ConfigurationSchema", () => {
  it("should throw if no fields are provided", async () => {
    const validate = configSchema.validate({});

    expect(validate).rejects.toThrow();
  });

  it("should validate if required fields are provided", async () => {
    const configuration = {
      knex: {
        client: "sqlite3",
        connection: {
          filename: "",
        },
      },
      migrations: "/path/to/some/place",
      seeds: "/path/to/another/place",
    };

    const validate = await configSchema.validate(configuration);

    expect(validate).toBeDefined();
  });

  it("should fill default values if no provided", async () => {
    const configuration = {
      knex: {
        client: "sqlite3",
        connection: {
          filename: "",
        },
      },
      migrations: "/path/to/some/place",
      seeds: "/path/to/another/place",
    };

    const validate = await configSchema.validate(configuration);

    expect(validate).toBeDefined();
    expect(validate).toHaveProperty("tableName");
    expect(validate.tableName).toBe("DatabaseStatus");
  });

  it("should validate slashs in timestamp format", async () => {
    const configuration = {
      knex: {
        client: "sqlite3",
        connection: {
          filename: "",
        },
      },
      migrations: "/path/to/some/place",
      seeds: "/path/to/another/place",
    };

    const validate = configSchema.validate({
      ...configuration,
      dateFormat: "dd.MM.yyyy",
    });

    expect(validate).resolves.toBeDefined();

    const validateSlash = configSchema.validate({
      ...configuration,
      dateFormat: "dd/MM/yyyy",
    });

    expect(validateSlash).rejects.toThrow();

    const noValidate = configSchema.validate({
      ...configuration,
      dateFormat: "",
    });

    expect(noValidate).resolves.toBeDefined();
  });
});
