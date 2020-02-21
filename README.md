# rsf-http-register-client

[![rapid-sensemaking-framework](https://circleci.com/gh/rapid-sensemaking-framework/rsf-http-register-client.svg?style=svg)](https://circleci.com/gh/rapid-sensemaking-framework/rsf-http-register-client)

connects to a remote rsf-http-register via websockets and spins up new registration pages

## Usage

The environment variables mentioned below will need to be setup.

Note that you have to FIRST call `createParticipantRegister`, THEN you can call `getContactablesFromRegistration`. An error will be thrown otherwise.

```javascript
import {
  createParticipantRegister,
  getContactablesFromRegistration
} from 'rsf-http-register-client'

const example = async () => {
  // generate a random ID which is URL compatible (no spaces)
  const ID = '1234'

  // setup the full configuration details
  const participantRegisterConfig = {
    id: ID,
    maxParticipants: 3, // use '*' to set unlimited
    maxTime: 1500, // seconds
    description: 'description which will show on the registration page'
  }

  // set up an idle (still closed) registration page
  await createParticipantRegister(participantRegisterConfig)
  const liveResult = eachConfig => {
    console.log('Received a new config', eachConfig)
  }
  // the return value will be the full set of registered contactable_configs,
  // but you can also optionally pass the callback for a stream of them
  const configs = await getContactablesFromRegistration(ID, liveResult)
}
```

## Environment Variables

This project depends on the following environment variables:

```bash
// Required: should be 'http' or 'https'
REGISTER_HTTP_PROTOCOL

// Required: should be 'ws' or 'wss'
REGISTER_WS_PROTOCOL

// Required: can be an ip address, or a domain name
REGISTER_HOST

// Optional: should just be a regular networking port number, if needed
REGISTER_PORT
```

For reference, I got help setting up tests in typescript for mocha/chai using this little tutorial: https://journal.artfuldev.com/write-tests-for-typescript-projects-with-mocha-and-chai-in-typescript-86e053bdb2b6

```

```
