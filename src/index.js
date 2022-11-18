/* eslint-disable node/no-unsupported-features/es-syntax */
import * as core from '@actions/core'
import getDeploymentUrl from './vercel.js'

async function run() {
  try {
    const vercelToken = process.env.VERCEL_TOKEN
    const githubRef = process.env.GITHUB_REF
    const githubProject = process.env.GITHUB_REPOSITORY
    const githubBranch = githubRef.replace('refs/heads/', '')
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

    core.info(`Retrieving deployment preview ...`)
    const { url, state } = await getDeploymentUrl(
      vercelToken,
      githubRepo,
      githubBranch,
      vercelOptions
    )

    core.setOutput('preview_url', url)
    core.setOutput('deployment_state', state)
  } catch (error) {
    console.error(error)
    core.setFailed(error.message)
  }
}

run()
