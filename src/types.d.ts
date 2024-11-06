export type NotificationStyle =
  | 'default'
  | 'accent'
  | 'emphasis'
  | 'warning'
  | 'attention'
  | 'good'
  | 'danger'

interface Author {
  name?: string | null
  avatarUrl?: string
  login?: string
  htmlUrl?: string
  url?: string
}

interface Workflow {
  name: string
  runNumber: string
  runId: string
  repo: Repo
  commit: Commit
  author: Author
}

interface Commit {
  sha: string
  data: any
}

interface Repo {
  name: string
  url: string
}

export interface CardConfig {
  notificationSummary: string
  notificationStyle: NotificationStyle
  timestamp: string
  workflow: Workflow
}
