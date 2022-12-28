/* eslint-disable node/no-unsupported-features/es-syntax */
import * as core from '@actions/core'
import fetch from 'node-fetch'

const apiUrl = 'https://api.vercel.com'
const deploymentsUrl = '/v6/deployments'

export default async function getDeploymentUrl(token, repo, branch, options) {
  let query = new URLSearchParams()
  Object.keys(options).forEach((key) => {
    if (options[key] && options[key] !== '') {
      query.append(key, options[key])
    }
  })

  core.info(`Fetching from: ${apiUrl}${deploymentsUrl}?${query.toString()}`)
  const res = await fetch(`${apiUrl}${deploymentsUrl}?${query.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  const data = await res.json()

  if (!data || !data.deployments || data.deployments.length <= 0) {
    core.error(JSON.stringify(data, null, 2))
    throw new Error('no deployments found')
  }

  core.debug(`Found ${data.deployments.length} deployments`)
  core.debug(`Looking for matching deployments ${repo}/${branch}`)
  const builds = data.deployments.filter((deployment) => {
    return (
      deployment.meta.githubCommitRepo === repo &&
      deployment.meta.githubCommitRef === branch
    )
  })

  core.debug(`Found ${builds.length} matching builds`)
  if (!builds || builds.length <= 0) {
    core.error(JSON.stringify(builds, null, 2))
    throw new Error('no deployments found')
  }

  const build = builds[0]
  core.info(`Preview URL: https://${build.url} (${build.state})`)
  return {
    url: build.url,
    state: build.state
  }
}
