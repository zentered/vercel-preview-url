# Vercel Preview URL

Retrieve the preview URL from the Vercel API, filtered by the repo and branch. The URL can then be used for further end-to-end tests, link checks and other PR integrations/actions.

The main difference to [Capture Vercel Preview URL](https://github.com/marketplace/actions/capture-vercel-preview-url) is that the action runs on `push` and `pull_request`, not on `issue_comment`. This enables 3rd party GitHub integrations to report directly on the Pull Request.

## Table of Contents

- [Usage](#usage)
- [Environment Variables](#environment-variables--secret)
- [Inputs](#inputs)
- [Outputs](#outputs)

## Usage

Create a Vercel API Token: https://vercel.com/account/tokens

Vercel needs a little time to build the preview, you can check the average build time in your deployments and add the seconds plus a little to a `sleep` action, to wait until the deployment is `READY`.

Instead of an arbitrary time, the [Await for Vercel deployment](https://github.com/marketplace/actions/await-for-vercel-deployment) Action can be used.

```yaml
- run: sleep 30
- name: vercel-preview-url
  uses: zentered/vercel-preview-url@v1.0.0
  id: vercel_preview_url
  env:
    VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
  with:
    vercel_team_id: 'opstrace'
    vercel_project_id: 'opstrace.com'
- name: Get URL
  run: echo "https://${{ steps.vercel_preview_url.outputs.preview_url }}"
```

## Environment Variables / Secret

In the repository, go to "Settings", then "Secrets" and add "VERCEL_TOKEN", the value you can retrieve on your [Vercel account](https://vercel.com/account/tokens).

## Inputs

| Name                | Requirement | Description       |
| ------------------- | ----------- | ----------------- |
| `vercel_team_id`    | required    | Vercel team id    |
| `vercel_project_id` | optional    | Vercel project id |

## Outputs

| Name               | Description                                                                                                             |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `preview_url`      | A string with the unique URL of the deployment. If it hasn't finished uploading (is incomplete), the value will be null |
| `deployment_state` | A string with the current deployment state, it could be one of the following QUEUED, BUILDING, READY, or ERROR.         |

## Contributing

See [CONTRIBUTING](CONTRIBUTING.md).

## License

See [LICENSE](LICENSE).
