import type { Config } from "jest";

const config: Config = {
  testEnvironment: "node",
  testPathIgnorePatterns: ["/node_modules/"],
  testMatch: ["**/?(*.)+(test).ts"],
  moduleFileExtensions: ["ts", "js", "json"],
  restoreMocks: true,
  resetMocks: true,
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1"
  },
  moduleDirectories: ["node_modules", "<rootDir>/src"],
  transform: {
    "^.+\\.ts?$": "ts-jest"
  }
};

export default config;
