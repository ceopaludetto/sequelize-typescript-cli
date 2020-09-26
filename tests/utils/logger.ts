import { Logger } from "../../src/utils/logger";

class MockedLogger implements Logger {
  public info = jest.fn();
  public success = jest.fn();
  public verbose = jest.fn();
  public error = jest.fn();
  public log = jest.fn();
}

export default new MockedLogger();
