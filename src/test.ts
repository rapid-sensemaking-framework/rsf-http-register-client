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
import startServer from 'rsf-http-register'
import { URLS } from 'rsf-http-register/dist/constants'
import { ParticipantRegisterConfig } from 'rsf-types'

const HOST = 'localhost'
const PORT1 = '4000'
const PORT2 = '4001'

describe('createParticipantRegister', () => {
  context('when the server is available', async () => {
    // for rsf-http-register
    process.env['PORT'] = PORT1
    let stopServer: () => void
    stopServer = await startServer()
    const mockEnv = {
      REGISTER_HTTP_PROTOCOL: 'http',
      REGISTER_WS_PROTOCOL: 'ws',
      REGISTER_HOST: HOST,
      REGISTER_PORT: PORT1
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
      const registerPath = URLS.REGISTER(ID)
      const registerAddress = getRegisterAddress(
        process.env,
        ENV_VARIABLE_NAMES.REGISTER_HTTP_PROTOCOL
      )
      const registerFullUrl = `${registerAddress}${registerPath}`
      // check the endpoint for the new registration,
      // which should still say it hasn't yet begun
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
          stopServer()
          resolve()
        })
      })
    })
  })
  context('when the server is not available', () => {
    const mockEnv = {
      REGISTER_HTTP_PROTOCOL: 'http',
      REGISTER_WS_PROTOCOL: 'ws',
      REGISTER_HOST: HOST,
      REGISTER_PORT: PORT1
    }
    Object.keys(mockEnv).forEach(key => {
      process.env[key] = mockEnv[key]
    })
    it('should reject with a timeout error after 1500 milliseconds', async () => {
      const ID = '1234'
      const participantRegisterConfig: ParticipantRegisterConfig = {
        id: ID,
        maxParticipants: 3,
        maxTime: 3000,
        description: 'my description'
      }
      try {
        await createParticipantRegister(participantRegisterConfig)
      } catch (e) {
        expect(e.toString()).to.equal(
          'Error: Exceeded 1500 millisecond timeout. Server seems unavailable...'
        )
      }
    })
  })
})

describe('getContactablesFromRegistration', () => {
  context('when the server is available', async () => {
    // for rsf-http-register
    process.env['PORT'] = PORT2
    let stopServer: () => void
    stopServer = await startServer()
    after(() => {
      stopServer()
    })
    const mockEnv = {
      REGISTER_HTTP_PROTOCOL: 'http',
      REGISTER_WS_PROTOCOL: 'ws',
      REGISTER_HOST: HOST,
      REGISTER_PORT: PORT2
    }
    Object.keys(mockEnv).forEach(key => {
      process.env[key] = mockEnv[key]
    })
    context('the registration is first created', async () => {
      const ID = '1234'
      const participantRegisterConfig: ParticipantRegisterConfig = {
        id: ID,
        maxParticipants: 3,
        maxTime: 1500,
        description: 'my description'
      }
      await createParticipantRegister(participantRegisterConfig)
      it('should connect, await all the participants, then disconnect', async () => {
        const res = await getContactablesFromRegistration(ID)
        expect(res).to.be.equal([])
      })
    })
    context('the registration is not first created', async () => {
      const ID = '0987'
      it('should return an error indicating the registration with that ID does not exist', async () => {
        try {
          await getContactablesFromRegistration(ID)
        } catch (e) {
          expect(e.toString()).to.be.equal(
            'Error: No registration set up with id: 0987'
          )
        }
      })
    })
  })
  context('when the server is not available', () => {
    const mockEnv = {
      REGISTER_HTTP_PROTOCOL: 'http',
      REGISTER_WS_PROTOCOL: 'ws',
      REGISTER_HOST: HOST,
      REGISTER_PORT: PORT2
    }
    Object.keys(mockEnv).forEach(key => {
      process.env[key] = mockEnv[key]
    })
    it('should reject with a timeout error after 1500 milliseconds', async () => {
      const ID = '1234'
      const participantRegisterConfig: ParticipantRegisterConfig = {
        id: ID,
        maxParticipants: 3,
        maxTime: 3000,
        description: 'my description'
      }
      try {
        await createParticipantRegister(participantRegisterConfig)
      } catch (e) {
        expect(e.toString()).to.equal(
          'Error: Exceeded 1500 millisecond timeout. Server seems unavailable...'
        )
      }
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
