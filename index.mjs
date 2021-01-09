import core from '@actions/core'
import getDeploymentUrl from './vercel.mjs'

async function run() {
  try {
    const vercelToken = process.env.VERCEL_TOKEN
    const githubRef = process.env.GITHUB_REF
    const githubProject = process.env.GITHUB_REPOSITORY
    const githubBranch = githubRef.replace('refs/heads/', '')
    const githubRepo = githubProject.split('/')[1]
    const teamId = core.getInput('vercel_team_id')
    const projectId = core.getInput('vercel_project_id')

    core.info(`Retrieving deployment preview for ${teamId}/${projectId} ...`)
    const { url, state } = await getDeploymentUrl(
      vercelToken,
      githubRepo,
      githubBranch,
      teamId
    )

    core.setOutput('preview_url', url)
    core.setOutput('deployment_state', state)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
