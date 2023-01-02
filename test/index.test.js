/* eslint-disable node/no-unpublished-import */
/* eslint-disable node/no-unsupported-features/es-syntax */
import { vi, test, expect } from 'vitest'
import fetch from 'node-fetch'
import getDeploymentUrl from '../src/vercel.js'

vi.mock('node-fetch')

function createFetchResponse(data) {
  return { json: () => new Promise((resolve) => resolve(data)) }
}

test('getDeploymentUrl() should return a Vercel build', async () => {
  const data = {
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
  fetch.mockResolvedValueOnce(createFetchResponse(data))

  const { url, state } = await getDeploymentUrl('zentered', 'fix/huge-bug', {
    teamId: 'zentered.co'
  })
  expect(fetch).toBeCalledTimes(1)
  expect(url).toEqual('test-123.vercel.app')
  expect(state).toEqual('READY')
})

test('getDeploymentUrl() should return vercel builds for a project', async () => {
  const data = {
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
  fetch.mockResolvedValueOnce(createFetchResponse(data))

  await getDeploymentUrl('zentered', 'fix/huge-bug', {
    teamId: 'zentered.co',
    vercel_project_id: 'prj_zentered1'
  })
  expect(fetch).toBeCalledTimes(2)
  expect(fetch).lastCalledWith(
    'https://api.vercel.com/v6/deployments?teamId=zentered.co&vercel_project_id=prj_zentered1',
    {
      headers: {
        Authorization: 'Bearer 123xyz',
        'Content-Type': 'application/json'
      }
    }
  )
})

test('getDeploymentUrl() should fail if there are no deployments', async () => {
  const data = {
    deployments: []
  }
  fetch.mockResolvedValueOnce(createFetchResponse(data))

  await expect(
    getDeploymentUrl('zentered', 'fix/huge-bug', {
      teamId: 'zentered.co'
    })
  ).rejects.toThrow()
})

test('getDeploymentUrl() should fail if there are no matching builds', async () => {
  const data = {
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
  fetch.mockResolvedValueOnce(createFetchResponse(data))

  await expect(
    getDeploymentUrl('zentered', 'fix/huge-bug', {
      teamId: 'zentered.co'
    })
  ).rejects.toThrow()
})
