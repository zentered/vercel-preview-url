import core from '@actions/core'
import getDeploymentUrl from './vercel.mjs'

async function run() {
  try {
    const vercelToken = process.env.VERCEL_TOKEN
    const githubRef = process.env.GITHUB_REF
    const githubProject = process.env.GITHUB_REPOSITORY
    const githubBranch = githubRef.replace('refs/heads/', '')
    const githubRepo = githubProject.split('/')[1]
    const vApp = core.getInput('vercel_app')
    const vFrom = core.getInput('vercel_from')
    const vLimit = core.getInput('vercel_limit')
    const vProjectId = core.getInput('vercel_project_id')
    const vSince = core.getInput('vercel_since')
    const vState = core.getInput('vercel_state')
    const vTarget = core.getInput('vercel_target')
    const vTeamId = core.getInput('vercel_team_id')
    const vTo = core.getInput('vercel_to')
    const vUntil = core.getInput('vercel_until')
    const vUsers = core.getInput('vercel_users')
    
    

    core.info(`Retrieving deployment preview for ${teamId}/${projectId} ...`)
    const { url, state } = await getDeploymentUrl(
      vercelToken,
      githubRepo,
      githubBranch,
      vApp,
      vFrom,
      vLimit,
      vProjectId,
      vSince,
      vState,
      vTarget,
      vTeamId,
      vTo,
      vUntil,
      vUsers
    )

    core.setOutput('preview_url', url)
    core.setOutput('deployment_state', state)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
