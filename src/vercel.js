import * as core from '@actions/core'
import fetch from 'node-fetch'

const apiUrl = 'https://api.vercel.com'
const deploymentsUrl = '/v6/deployments'
const vercelToken = process.env.VERCEL_TOKEN

export default async function getDeploymentUrl(repo, branch, options) {
  let query = new URLSearchParams()
  Object.keys(options).forEach((key) => {
    if (options[key] && options[key] !== '') {
      query.append(key, options[key])
    }
  })

  core.info(`Fetching from: ${apiUrl}${deploymentsUrl}?${query.toString()}`)
  const res = await fetch(`${apiUrl}${deploymentsUrl}?${query.toString()}`, {
    headers: {
      Authorization: `Bearer ${vercelToken}`,
      'Content-Type': 'application/json'
    }
  })
  const data = await res.json()

  if (!data || !data.deployments || data.deployments.length <= 0) {
    core.error(JSON.stringify(data, null, 2))
    throw new Error('no deployments found')
  }

  core.info(`Found ${data.deployments.length} deployments`)
  core.info(`Looking for matching deployments ${repo}/${branch}`)
  const builds = data.deployments.filter((deployment) => {
    return (
      deployment.meta.githubCommitRepo === repo &&
      deployment.meta.githubCommitRef === branch
    )
  })

  core.info(`Found ${builds.length} matching deployments`)
  if (!builds || builds.length <= 0) {
    core.error(JSON.stringify(builds, null, 2))
    throw new Error('no matching deployments found, please check your filters')
  }

  const build = builds[0]
  core.info(`Preview URL: https://${build.url} (${build.state})`)
  return {
    url: build.url,
    state: build.state,
    branchAlias: build.meta.branchAlias
  }
}
