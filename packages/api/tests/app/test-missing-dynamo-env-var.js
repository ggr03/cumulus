const test = require('ava');

const { MissingRequiredEnvVar } = require('@cumulus/errors');

test.serial('index throws error if environment variable for Dynamo tables parameter name is missing', async (t) => {
  // eslint-disable-next-line global-require
  const { handler } = require('../../app');
  await t.throwsAsync(
    handler(),
    { instanceOf: MissingRequiredEnvVar }
  );
});
