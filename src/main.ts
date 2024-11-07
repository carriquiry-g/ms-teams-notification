import * as core from '@actions/core'
import {Octokit} from '@octokit/rest'
import axios from 'axios'
import moment from 'moment-timezone'
import {createMessageCard} from './message-card'
import {CardConfig, NotificationStyle} from './types'

function log(obj: any) {
  console.dir(obj, {
    depth: Infinity,
    colors: true
  })
}

async function run(): Promise<void> {
  try {
    const githubToken = core.getInput('github-token', {required: true})
    const msTeamsWebhookUri: string = core.getInput('ms-teams-webhook-uri', {
      required: true
    })

    const notificationSummary =
      core.getInput('notification-summary') || 'GitHub Action Notification'
    const notificationStyle =
      (core.getInput('notification-style') as NotificationStyle) || 'accent'
    const timezone = core.getInput('timezone') || 'UTC'
    const verboseLogging = core.getInput('verbose-logging') == 'true'
    const timestamp = moment()
      .tz(timezone)
      .format('dddd, MMMM Do YYYY, h:mm:ss a z')

    const [owner, repo] = (process.env.GITHUB_REPOSITORY ?? '').split('/')
    const sha = process.env.GITHUB_SHA ?? ''
    const workflowName = process.env.GITHUB_WORKFLOW ?? 'CI'
    const runId = process.env.GITHUB_RUN_ID ?? ''
    const runNum = process.env.GITHUB_RUN_NUMBER ?? ''
    const params = {owner, repo, ref: sha}
    const repoName = params.owner + '/' + params.repo
    const repoUrl = `https://github.com/${repoName}`

    const octokit = new Octokit({auth: `token ${githubToken}`})
    const commit = await octokit.repos.getCommit(params)
    const author = commit.data.author

    console.log('author')
    log(author)

    const cardConfig: CardConfig = {
      notificationSummary,
      notificationStyle,
      timestamp,
      workflow: {
        name: workflowName,
        runNumber: runNum,
        runId,
        repo: {
          name: repoName,
          url: repoUrl
        },
        commit: {
          sha,
          data: commit.data
        },
        author: {
          name: author?.name,
          avatarUrl: author?.avatar_url,
          login: author?.login,
          htmlUrl: author?.html_url,
          url: author?.url
        }
      }
    }

    const messageCard = await createMessageCard(cardConfig)

    if (verboseLogging) {
      console.warn('** Logging message card generated **')
      log(messageCard)
    }

    const messagePayload = {
      type: 'message',
      attachments: [
        {
          contentType: 'application/vnd.microsoft.card.adaptive',
          content: messageCard
        }
      ]
    }

    axios
      .post(msTeamsWebhookUri, messagePayload)
      .then(function (response) {
        if (verboseLogging) {
          console.warn('** Webhook response **')
          log({
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
            method: response.request.method,
            url: response.request.url,
            data: response.data
          })
        }
        core.debug(response.data)
      })
      .catch(function (error) {
        console.error('** Webhook request error **')
        core.debug(error)
      })
  } catch (error: any) {
    console.error('** Action error **')
    log(error)
    core.setFailed(error.message)
  }
}

run()
