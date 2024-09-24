module.exports = {
  transform: {
    "^.+\\.[t|j]sx?$": "babel-jest",
  },
  moduleNameMapper: {
    "^kaibanjs$": "<rootDir>/dist/bundle.cjs",
  },
  testTimeout: 300000, // Sets global timeout to 10 seconds for all tests
  testEnvironment: "node", // Use Node.js environment for executing tests,
  verbose: true, // Make Jest more verbose
  silent: false, // Ensure Jest is not silent (though this is not directly related to console.log output)
  // testMatch: [
  //   "**/tests/e2e/exampl/**/*.js"
  // ], // Run tests only in the specific directory
};
