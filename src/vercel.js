import * as core from '@actions/core'
import fetch from 'node-fetch'

const apiUrl = 'https://api.vercel.com'
const deploymentsUrl = '/v7/deployments'
const maxPages = 10
const vercelToken = process.env.VERCEL_TOKEN

export default async function getDeploymentUrl(repo, branch, options) {
  let query = new URLSearchParams()
  Object.keys(options).forEach((key) => {
    if (options[key] && options[key] !== '') {
      query.append(key, options[key])
    }
  })

  query.set('branch', branch)

  let build
  for (let page = 1; page <= maxPages; page++) {
    const url = `${apiUrl}${deploymentsUrl}?${query.toString()}`
    core.info(`Fetching from: ${url}`)
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${vercelToken}`,
        'Content-Type': 'application/json'
      }
    })
    const data = await res.json()

    if (!data || !data.deployments || data.deployments.length <= 0) {
      if (page === 1) {
        core.error(JSON.stringify(data, null, 2))
        throw new Error('no deployments found')
      }
      break
    }

    core.info(`Found ${data.deployments.length} deployments`)
    core.info(`Looking for matching deployments ${repo}/${branch}`)
    build = data.deployments.find((deployment) => {
      return (
        deployment.meta.githubCommitRepo === repo &&
        deployment.meta.githubCommitRef === branch
      )
    })
    if (build) break

    const next = data.pagination && data.pagination.next
    if (!next) break
    query.set('until', next)
  }

  if (!build) {
    throw new Error('no matching deployments found, please check your filters')
  }

  core.info(`Preview URL: https://${build.url} (${build.state})`)
  return {
    url: build.url,
    state: build.state,
    branchAlias: build.meta.branchAlias
  }
}
