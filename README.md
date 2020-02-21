# rsf-http-register-client

[![rapid-sensemaking-framework](https://circleci.com/gh/rapid-sensemaking-framework/rsf-http-register-client.svg?style=svg)](https://circleci.com/gh/rapid-sensemaking-framework/rsf-http-register-client)

connects to a remote rsf-http-register via websockets and spins up new registration pages

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
