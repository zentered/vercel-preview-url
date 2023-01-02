/* eslint-disable node/no-unsupported-features/es-syntax */
import * as core from '@actions/core'
import getDeploymentUrl from './vercel.js'

const githubBranch =
  process.env.GITHUB_EVENT_NAME === 'pull_request' ||
  process.env.GITHUB_EVENT_NAME === 'pull_request_target'
    ? process.env.GITHUB_HEAD_REF
    : process.env.GITHUB_REF.replace('refs/heads/', '')
const githubProject = process.env.GITHUB_REPOSITORY
const githubRepo = githubProject.split('/')[1]
const vercelOptions = {
  projectId: core.getInput('vercel_project_id'),
  teamId: core.getInput('vercel_team_id'),
  app: core.getInput('vercel_app'),
  from: core.getInput('vercel_from'),
  limit: core.getInput('vercel_limit'),
  since: core.getInput('vercel_since'),
  state: core.getInput('vercel_state'),
  target: core.getInput('vercel_target'),
  to: core.getInput('vercel_to'),
  until: core.getInput('vercel_until'),
  users: core.getInput('vercel_users')
}

core.info(`Retrieving deployment preview for ${githubRepo}/${githubBranch}`)
const { url, state } = await getDeploymentUrl(
  githubRepo,
  githubBranch,
  vercelOptions
)

core.setOutput('preview_url', url)
core.setOutput('deployment_state', state)
