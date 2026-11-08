import { vi, test, expect, beforeEach } from 'vitest'
import fetch from 'node-fetch'
import getDeploymentUrl from '../src/vercel.js'

vi.mock('node-fetch')

beforeEach(() => {
  fetch.mockReset()
})

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
  expect(fetch).toBeCalledTimes(1)
  expect(fetch).lastCalledWith(
    'https://api.vercel.com/v7/deployments?teamId=zentered.co&vercel_project_id=prj_zentered1&branch=fix%2Fhuge-bug',
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

function deployment(url, ref, repo = 'zentered') {
  return {
    name: 'zentered-co',
    url,
    state: 'READY',
    meta: { githubCommitRef: ref, githubCommitRepo: repo }
  }
}

test('getDeploymentUrl() should follow pagination.next until it finds a match', async () => {
  fetch.mockResolvedValueOnce(
    createFetchResponse({
      deployments: [deployment('other-1.vercel.app', 'main')],
      pagination: { count: 1, next: 1700000000000, prev: null }
    })
  )
  fetch.mockResolvedValueOnce(
    createFetchResponse({
      deployments: [deployment('match-2.vercel.app', 'fix/huge-bug')],
      pagination: { count: 1, next: 1690000000000, prev: 1700000000000 }
    })
  )

  const { url } = await getDeploymentUrl('zentered', 'fix/huge-bug', {
    teamId: 'zentered.co'
  })
  expect(url).toEqual('match-2.vercel.app')
  expect(fetch).toBeCalledTimes(2)
  expect(fetch.mock.calls[1][0]).toEqual(
    'https://api.vercel.com/v7/deployments?teamId=zentered.co&branch=fix%2Fhuge-bug&until=1700000000000'
  )
})

test('getDeploymentUrl() should stop when pagination.next is null', async () => {
  fetch.mockResolvedValueOnce(
    createFetchResponse({
      deployments: [deployment('other-1.vercel.app', 'main')],
      pagination: { count: 1, next: null, prev: null }
    })
  )

  await expect(
    getDeploymentUrl('zentered', 'fix/huge-bug', { teamId: 'zentered.co' })
  ).rejects.toThrow('no matching deployments found')
  expect(fetch).toBeCalledTimes(1)
})

test('getDeploymentUrl() should stop after 10 pages', async () => {
  fetch.mockImplementation(async () =>
    createFetchResponse({
      deployments: [deployment('other-1.vercel.app', 'main')],
      pagination: { count: 1, next: 1700000000000, prev: null }
    })
  )

  await expect(
    getDeploymentUrl('zentered', 'fix/huge-bug', { teamId: 'zentered.co' })
  ).rejects.toThrow('no matching deployments found')
  expect(fetch).toBeCalledTimes(10)
})
