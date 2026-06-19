/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    // Permet d'importer avec extension .js même pour des fichiers .ts (requis par ton setup ESM)
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: {
          // Config TypeScript spécifique aux tests
          module: "ESNext",
          moduleResolution: "node",
          verbatimModuleSyntax: false,
        },
      },
    ],
  },
  testMatch: ["**/tests/**/*.test.ts"],
};