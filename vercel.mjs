import core from '@actions/core'
import axios from 'axios'
import querystring from 'querystring'

const apiUrl = 'https://api.vercel.com'
const deploymentsUrl = '/v5/now/deployments'

export default async function getDeploymentUrl(token, repo, branch, teamId) {
  const query = {
    teamId
    // projectId
  }
  const qs = querystring.stringify(query)

  core.info(`Fetching from: ${apiUrl}${deploymentsUrl}?${qs}`)
  const { data } = await axios.get(`${apiUrl}${deploymentsUrl}?${qs}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })

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

  core.info(`Found matching ${builds.length} builds`)
  if (!builds || builds.length <= 0) {
    core.error(JSON.stringify(builds, null, 2))
    throw new Error('no deployments found')
  }

  const build = builds[0]
  core.info(`PreviewUrl: ${build.url} (${build.state})`)
  return {
    url: build.url,
    state: build.state
  }
}
