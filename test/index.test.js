/* eslint-disable node/no-unpublished-import */
/* eslint-disable node/no-unsupported-features/es-syntax */
import { vi, test, expect } from 'vitest'
import getDeploymentUrl from '../src/vercel.js'
import axios from 'axios'

vi.mock('axios')

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
    { teamId: 'zentered.co' }
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
    getDeploymentUrl('123xyz', 'zentered', 'fix/huge-bug', {
      teamId: 'zentered.co'
    })
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
    getDeploymentUrl('123xyz', 'zentered', 'fix/huge-bug', {
      teamId: 'zentered.co'
    })
  ).rejects.toThrow()
})
