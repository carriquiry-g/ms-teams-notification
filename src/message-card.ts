import {CardConfig} from './types'

export function createMessageCard(cardConfig: CardConfig): any {
  const workflow = cardConfig.workflow
  const author = workflow.author
  const repo = workflow.repo
  const commit = workflow.commit

  console.dir(workflow)

  let avatar_url =
    'https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg'
  if (author.avatarUrl) {
    if (author.avatarUrl) {
      avatar_url = author.avatarUrl
    }
  }

  let author_url = ''
  if (cardConfig.workflow.author) {
    if (author.login && author.htmlUrl) {
      author_url = `[@${author.login}](${author.htmlUrl})`
    }
  }

  const messageCard = {
    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
    type: 'AdaptiveCard',
    version: '1.5',
    body: [
      {
        type: 'ColumnSet',
        columns: [
          {
            type: 'Column',
            width: '1px',
            style: cardConfig.notificationStyle,
            bleed: true
          },
          {
            type: 'Column',
            width: 'auto',
            items: [
              {
                type: 'TextBlock',
                text: cardConfig.notificationSummary,
                weight: 'Bolder',
                size: 'Medium'
              },
              {
                type: 'ColumnSet',
                columns: [
                  {
                    type: 'Column',
                    width: 'auto',
                    items: [
                      {
                        type: 'Image',
                        url: avatar_url,
                        size: 'Medium',
                        style: 'Person'
                      }
                    ]
                  },
                  {
                    type: 'Column',
                    width: 'stretch',
                    items: [
                      {
                        type: 'TextBlock',
                        text: `**${workflow.name} #${workflow.runNumber} (commit ${commit.sha.substring(0, 7)})** on [${repo.name}](${repo.url})`,
                        wrap: true
                      },
                      {
                        type: 'TextBlock',
                        text: `by [${author.name}] (${author_url}) on ${cardConfig.timestamp}`,
                        isSubtle: true,
                        wrap: true
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ],
    actions: [
      {
        type: 'Action.OpenUrl',
        title: 'View Workflow Run',
        url: `${repo.url}/actions/runs/${workflow.runId}`
      },
      {
        type: 'Action.OpenUrl',
        title: 'View Commit Changes',
        url: `${commit.data.html_url}`
      }
    ]
  }

  return messageCard
}
