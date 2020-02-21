import {
  createParticipantRegister,
  getContactablesFromRegistration,
  getRegister,
  getRegisterAddress,
  ENV_VARIABLE_NAMES
} from './index'
import { expect } from 'chai'
// if you used the '@types/mocha' method to install mocha type definitions, uncomment the following line
import 'mocha'
import request from 'request'
import start from 'rsf-http-register'
import { URLS } from 'rsf-http-register/dist/constants'
import { ParticipantRegisterConfig } from 'rsf-types'

const HOST = 'localhost'
const PORT = '4000'

describe('createParticipantRegister', () => {
  let stopServer: () => void
  before(function() {
    // runs before all tests in this block
    process.env['PORT'] = PORT
  })
  beforeEach(async () => {
    // runs before each test in this block
    stopServer = await start()
    console.log('started server')
  })
  afterEach(function() {
    // runs after each test in this block
    stopServer()
    console.log('stopped server')
  })
  after(function() {
    // runs after all tests in this block
    process.env['PORT'] = ''
  })
  context('when the server is available', () => {
    const mockEnv = {
      REGISTER_HTTP_PROTOCOL: 'http',
      REGISTER_WS_PROTOCOL: 'ws',
      REGISTER_HOST: HOST,
      REGISTER_PORT: PORT
    }
    Object.keys(mockEnv).forEach(key => {
      process.env[key] = mockEnv[key]
    })
    it('should connect, open a registration, then disconnect', async () => {
      const ID = '1234'
      const participantRegisterConfig: ParticipantRegisterConfig = {
        id: ID,
        maxParticipants: 3,
        maxTime: 3000,
        description: 'my description'
      }
      await createParticipantRegister(participantRegisterConfig)
      // check at the endpoint
      const registerPath = URLS.REGISTER(ID)
      const registerAddress = getRegisterAddress(
        process.env,
        ENV_VARIABLE_NAMES.REGISTER_HTTP_PROTOCOL
      )
      const registerFullUrl = `${registerAddress}${registerPath}`
      return new Promise((resolve, reject) => {
        request.get(registerFullUrl, function(err, res) {
          if (err) {
            reject(err)
            return
          }
          expect(res.statusCode).to.equal(200)
          expect(res.body).to.contain(
            'Registration for this process has not yet begun.'
          )
          resolve()
        })
      })
    })
  })
})

describe('getContactablesFromRegistration', () => {
  let stopServer: () => void
  before(function() {
    // runs before all tests in this block
    process.env['PORT'] = PORT
  })
  beforeEach(async () => {
    // runs before each test in this block
    stopServer = await start()
    console.log('started server')
  })
  afterEach(function() {
    // runs after each test in this block
    stopServer()
    console.log('stopped server')
  })
  after(function() {
    // runs after all tests in this block
    process.env['PORT'] = ''
  })
  context('', () => {
    it('should...', () => {
      const mockEnv = {
        REGISTER_HTTP_PROTOCOL: 'http',
        REGISTER_WS_PROTOCOL: 'ws',
        REGISTER_HOST: HOST,
        REGISTER_PORT: PORT
      }
      Object.keys(mockEnv).forEach(key => {
        process.env[key] = mockEnv[key]
      })
      console.log('test')
    })
  })
})

describe('getRegister', () => {
  context('when REGISTER_HOST is not set', () => {
    it('should throw an error', () => {
      const mockEnv = {
        REGISTER_HTTP_PROTOCOL: 'http',
        REGISTER_WS_PROTOCOL: 'ws',
        REGISTER_HOST: '',
        REGISTER_PORT: ''
      }
      try {
        getRegister(mockEnv)
      } catch (e) {
        expect(e.toString()).to.equal(
          'Error: REGISTER_HOST environment variable is not set'
        )
      }
    })
  })
  context('when REGISTER_PORT is not set', () => {
    it('should return the full domain name or ip address', () => {
      const mockEnv = {
        REGISTER_HTTP_PROTOCOL: 'http',
        REGISTER_WS_PROTOCOL: 'ws',
        REGISTER_HOST: '123.456.7.89',
        REGISTER_PORT: ''
      }
      const result = getRegister(mockEnv)
      expect(result).to.equal('123.456.7.89')
    })
  })
  context('when REGISTER_PORT is set', () => {
    it('should return the full domain name or ip address, plus the port', () => {
      const mockEnv = {
        REGISTER_HTTP_PROTOCOL: 'http',
        REGISTER_WS_PROTOCOL: 'ws',
        REGISTER_HOST: '123.456.7.89',
        REGISTER_PORT: '8888'
      }
      const result = getRegister(mockEnv)
      expect(result).to.equal('123.456.7.89:8888')
    })
  })
})

describe('getRegisterAddress', () => {
  context('when an invalid protocolKey is used', () => {
    it('should throw an error saying so', () => {
      const mockEnv = {
        REGISTER_HTTP_PROTOCOL: 'http',
        REGISTER_WS_PROTOCOL: 'ws',
        REGISTER_HOST: '123.456.7.89',
        REGISTER_PORT: ''
      }
      try {
        getRegisterAddress(mockEnv, 'RANDOM')
      } catch (e) {
        expect(e.toString()).to.equal(
          'Error: protocolKey should be one of REGISTER_HTTP_PROTOCOL or REGISTER_WS_PROTOCOL'
        )
      }
    })
  })

  context(
    'when the environment variable for the protocol of interest is not set',
    () => {
      it('should throw an error saying so', () => {
        const mockEnv = {
          REGISTER_HTTP_PROTOCOL: 'http',
          REGISTER_WS_PROTOCOL: '',
          REGISTER_HOST: '123.456.7.89',
          REGISTER_PORT: ''
        }
        try {
          getRegisterAddress(mockEnv, 'REGISTER_WS_PROTOCOL')
        } catch (e) {
          expect(e.toString()).to.equal(
            'Error: REGISTER_WS_PROTOCOL environment variable is not set'
          )
        }
      })
    }
  )
})
