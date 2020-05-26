module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testRegex: '((\\.|/)(test|spec))\\.(ts?)$',
  setupFilesAfterEnv: ['jest-extended'],
};
