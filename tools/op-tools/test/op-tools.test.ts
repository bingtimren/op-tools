import { OpinionedCommand, defaultOptions } from "../src/op-tools-base";
import { statSync, readFileSync, rmSync } from "fs";
import { join } from "path";
import { Command } from "commander";

const mockedLog = jest.spyOn(console, "log");
const mockedError = jest.spyOn(console, "error");

const testTable = [];
for (const useLocalCopy of [true, false]) {
  for (const suffix of [".js", ".json", ".jsonc"]) {
    testTable.push([useLocalCopy, suffix]);
  }
}

afterAll(() => {
  mockedLog.mockRestore();
  mockedError.mockRestore();
  rmSync(".opToolsConfig", { recursive: true, force: true });
});

describe.each(testTable)(
  "(local-copy:%p suffix:%p) op-tools/OpinionedCommand",
  (useLocalCopy: boolean, suffix: string) => {
    let opCmd: OpinionedCommand;

    beforeEach(() => {
      mockedLog.mockReset();
      mockedError.mockReset();
      opCmd =
        suffix !== defaultOptions.configFileSuffix
          ? new OpinionedCommand(__dirname, {
              configFileSuffix: suffix,
            })
          : new OpinionedCommand(__dirname);
      if (useLocalCopy) {
        opCmd.localCopyConfig("localCopyTest" + suffix);
      }
    });
    it(`getConfigFileContent() able to get config file content`, () => {
      expect(opCmd.getConfigFileContent()).toBeInstanceOf(Buffer);
    });
    it(`getter configDir able to get config file dir`, () => {
      const dirPath = opCmd.configDir;
      const stat = statSync(dirPath);
      expect(stat.isDirectory()).toEqual(true);
      const fileStat = statSync(join(dirPath, "default.json"));
      expect(fileStat.isFile()).toEqual(true);
    });
    it(`getter configFilePath able to get config file`, () => {
      expect(statSync(opCmd.configFilePath).isFile()).toEqual(true);
    });
    it(`getter configFilePathInPackage able to get config file`, () => {
      expect(statSync(opCmd.configFilePathInPackage).isFile()).toEqual(true);
    });
    it(`getter configFilePathCopiedLocal able to get config file, if already locally copied`, () => {
      if (useLocalCopy) {
        expect(statSync(opCmd.configFilePathCopiedLocal).isFile()).toEqual(
          true
        );
      } else {
        expect(opCmd.configFilePathCopiedLocal).toBeUndefined();
      }
    });
    it(`getter constructOptions able to get the options`, () => {
      expect(opCmd.constructOptions.configFileSuffix).toEqual(suffix);
    });
    it(`getConfigFileContentParsed() able to get config object`, () => {
      expect((opCmd.getConfigFileContentParsed() as any).one).toEqual(1);
    });
    it(`able to handle "list" command with '-v' parameter`, () => {
      opCmd.parse(["node", "op-tools.js", "-v", "list"]);
      expect(console.log).toHaveBeenCalledWith("default");
      expect(console.log).toHaveBeenCalledWith("alternate");
      expect(
        mockedLog.mock.calls
          .map((messages) => messages.join(" "))
          .join(" ")
          .match(/Pre-configuration file dir\:/).length
      ).toEqual(1);
    });
    it(`able to handle "list" command`, () => {
      opCmd.parse(["node", "op-tools.js", "list"]);
      expect(console.log).toHaveBeenCalledWith("default");
      expect(console.log).toHaveBeenCalledWith("alternate");
    });
    it(`able to handle "print" command`, () => {
      opCmd.parse(["node", "op-tools.js", "print"]);
      expect(
        mockedLog.mock.calls
          .map((messages) => messages.join(" "))
          .join(" ")
          .match(/\"?one\"?\s*\:\s*1\s*,?/).length
      ).toEqual(1);
    });
    it(`able to handle "print" command with -c parameter`, () => {
      opCmd.parse(["node", "op-tools.js", "-c", "alternate", "print"]);
      expect(
        mockedLog.mock.calls
          .map((messages) => messages.join(" "))
          .join(" ")
          .match(/\"?alternateOne\"?\s*\:\s*1\s*,?/).length
      ).toEqual(1);
    });
    it(`able to handle "print" command with -c -v parameter`, () => {
      opCmd.parse(["node", "op-tools.js", "-c", "alternate", "-v", "print"]);
      expect(
        mockedLog.mock.calls
          .map((messages) => messages.join(" "))
          .join(" ")
          .match(/\"?alternateOne\"?\s*\:\s*1\s*,?/).length
      ).toEqual(1);
      expect(
        mockedLog.mock.calls
          .map((messages) => messages.join(" "))
          .join(" ")
          .match(/Pre\-config\: .*alternate.*Pre-config File\:.*alternate/)
          .length
      ).toEqual(1);
    });
    it(`able to access program from getter`, () => {
      expect(opCmd.program).toBeInstanceOf(Command);
    });
    it(`throws if config file of unknown type`, () => {
      const opCmdIllegal = new OpinionedCommand(__dirname, {
        configFileSuffix: ".unknown",
      });
      expect(() => {
        opCmdIllegal.getConfigFileContentParsed();
      }).toThrowError(/unknown file type/);
    });
    it(`throws if copy local is provided with an inconsistent suffix`, () => {
      expect(() => {
        opCmd.localCopyConfig("file.unknown");
      }).toThrowError(/has different suffix/);
    });
    it(`throws if copy local is provided with an invalid dir`, () => {
      expect(() => {
        opCmd.localCopyConfig("file" + suffix, "package.json");
      }).toThrowError(/is not a directory/);
    });
    it(`chalkedExecSync runs a command should return undefined`, () => {
      opCmd.parse(["node", "op-tools.js", "-v", "list"]);
      expect(opCmd.chalkedExecSync("ls")).toEqual(undefined);
      expect(
        mockedLog.mock.calls
          .map((messages) => messages.join(" "))
          .join(" ")
          .match(/Running command: .*ls/).length
      ).toEqual(1);
    });
    it(`chalkedExecSync runs a failing command should return error`, () => {
      opCmd.parse(["node", "op-tools.js", "list"]);
      expect(opCmd.chalkedExecSync("not-a-command-absolutely")).toBeDefined();
      expect(
        mockedError.mock.calls
          .map((messages) => messages.join(" "))
          .join(" ")
          .match(/ERROR: command failed: .*not-a-command/).length
      ).toEqual(1);
    });
  }
);