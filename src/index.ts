import socketClient from 'socket.io-client'
import { EVENTS } from 'rsf-http-register/dist/constants'
import { ContactableConfig, ParticipantRegisterConfig } from 'rsf-types'

const ENV_VARIABLE_NAMES = {
  // should be 'http' or 'https'
  REGISTER_HTTP_PROTOCOL: 'REGISTER_HTTP_PROTOCOL',
  // should be 'ws' or 'wss'
  REGISTER_WS_PROTOCOL: 'REGISTER_WS_PROTOCOL',
  // can be an ip address, or a domain name
  REGISTER_HOST: 'REGISTER_HOST',
  // should just be a regular networking port number, if needed
  REGISTER_PORT: 'REGISTER_PORT'
}

const setupTimeout = (
  reject: (err: Error) => void,
  socket: SocketIOClient.Socket
) => {
  // is 1500 ms too short?
  setTimeout(() => {
    socket.disconnect()
    reject(
      new Error(
        'Exceeded 1500 millisecond timeout. Server seems unavailable...'
      )
    )
  }, 1500)
}

const createParticipantRegister = (
  participantRegisterConfig: ParticipantRegisterConfig
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const registerWsUrl = getRegisterAddress(
      process.env,
      ENV_VARIABLE_NAMES.REGISTER_WS_PROTOCOL
    )
    const socket = socketClient(registerWsUrl)
    socket.on('connect', async () => {
      socket.emit(EVENTS.PARTICIPANT_REGISTER, participantRegisterConfig)
      socket.disconnect()
      resolve()
    })
    setupTimeout(reject, socket)
  })
}

const getContactablesFromRegistration = (
  id: string,
  eachNew: (newParticipant: ContactableConfig) => void = () => {} // set default
): Promise<ContactableConfig[]> => {
  return new Promise((resolve, reject) => {
    const registerWsUrl = getRegisterAddress(
      process.env,
      ENV_VARIABLE_NAMES.REGISTER_WS_PROTOCOL
    )
    const socket = socketClient(registerWsUrl)
    socket.on('connect', async () => {
      // kick it off
      socket.emit(EVENTS.OPEN_REGISTER, id)
    })
    // single one
    socket.on(EVENTS.PARTICIPANT_REGISTER_RESULT, eachNew)
    // all results
    socket.on(
      EVENTS.PARTICIPANT_REGISTER_RESULTS,
      (participants: ContactableConfig[]) => {
        socket.disconnect()
        resolve(participants)
      }
    )
    socket.on(EVENTS.NO_REGISTER_WITH_ID, (id: string) => {
      socket.disconnect()
      reject(
        new Error(
          'No registration set up with id: ' +
            id +
            '. First call createParticipantRegister'
        )
      )
    })
    setupTimeout(reject, socket)
  })
}

// `env` is from process.env, environment variables
const getRegister = (env: object) => {
  const REGISTER_HOST = env[ENV_VARIABLE_NAMES.REGISTER_HOST]
  const REGISTER_PORT = env[ENV_VARIABLE_NAMES.REGISTER_PORT]
  if (!REGISTER_HOST) {
    throw new Error('REGISTER_HOST environment variable is not set')
  }
  return REGISTER_HOST + (REGISTER_PORT ? `:${REGISTER_PORT}` : '')
}

// `env` is from process.env, environment variables
const getRegisterAddress = (env: object, protocolKey: string) => {
  if (
    !(
      protocolKey === ENV_VARIABLE_NAMES.REGISTER_HTTP_PROTOCOL ||
      protocolKey === ENV_VARIABLE_NAMES.REGISTER_WS_PROTOCOL
    )
  ) {
    throw new Error(
      'protocolKey should be one of REGISTER_HTTP_PROTOCOL or REGISTER_WS_PROTOCOL'
    )
  }
  const PROTOCOL = env[protocolKey]
  if (!PROTOCOL) {
    throw new Error(`${protocolKey} environment variable is not set`)
  }
  return `${PROTOCOL}://${getRegister(env)}`
}

export {
  ENV_VARIABLE_NAMES,
  createParticipantRegister,
  getContactablesFromRegistration,
  getRegisterAddress,
  getRegister
}
