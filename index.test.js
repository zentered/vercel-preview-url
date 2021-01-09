/* eslint-disable node/no-unsupported-features/es-syntax */
import getDeploymentUrl from './vercel.mjs'
import axios from 'axios'

jest.mock('@actions/core', () => {
  return {
    info: jest.fn(),
    debug: jest.fn(),
    error: jest.fn()
  }
})
jest.mock('axios')

test('getDeploymentUrl() should return a Vercel build', async () => {
  const data = {
    data: {
      deployments: [
        {
          name: 'zentered-co',
          url: 'test-123.vercel.app',
          state: 'READY',
          meta: {
            githubCommitRef: 'fix/huge-bug',
            githubCommitRepo: 'zentered'
          }
        }
      ]
    }
  }
  axios.get.mockResolvedValueOnce(data)

  const { url, state } = await getDeploymentUrl(
    '123xyz',
    'zentered',
    'fix/huge-bug',
    'zentered.co'
  )

  expect(url).toEqual('test-123.vercel.app')
  expect(state).toEqual('READY')
})

test('getDeploymentUrl() should fail if there are no deployments', async () => {
  const data = {
    data: {
      deployments: []
    }
  }
  axios.get.mockResolvedValueOnce(data)

  await expect(
    getDeploymentUrl('123xyz', 'zentered', 'fix/huge-bug', 'zentered.co')
  ).rejects.toThrow()
})

test('getDeploymentUrl() should fail if there are no matching builds', async () => {
  const data = {
    data: {
      deployments: [
        {
          name: 'zentered-co',
          url: 'test-123.vercel.app',
          state: 'READY',
          meta: {
            githubCommitRef: 'does-not-exist',
            githubCommitRepo: 'zentered'
          }
        }
      ]
    }
  }
  axios.get.mockResolvedValueOnce(data)

  await expect(
    getDeploymentUrl('123xyz', 'zentered', 'fix/huge-bug', 'zentered.co')
  ).rejects.toThrow()
})
