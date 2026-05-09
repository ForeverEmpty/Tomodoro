import { execSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outputPath = resolve(root, 'src/config/release.ts')
const packageJson = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))
const currentPackageVersion = packageJson.version || '0.0.0'
const MAX_UNTAGGED_COMMITS = 30
const MAX_MESSAGE_LENGTH = 160

const runGit = (command, fallback = '') => {
  try {
    return execSync(command, {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
  } catch {
    return fallback
  }
}

const formatDate = (rawDate) => {
  if (!rawDate) {
    return ''
  }

  const date = new Date(rawDate)
  if (Number.isNaN(date.getTime())) {
    return rawDate
  }

  return date.toISOString().slice(0, 10)
}

const cleanSubject = (subject) => {
  const normalizedSubject = subject.replace(/\s+/g, ' ').replace(/^Merge\s.+$/i, '').trim()

  if (normalizedSubject.length <= MAX_MESSAGE_LENGTH) {
    return normalizedSubject
  }

  return `${normalizedSubject.slice(0, MAX_MESSAGE_LENGTH - 1).trim()}...`
}

const getCommits = (range, limit) => {
  const maxCount = limit ? ` -n ${limit}` : ''
  const rawLogs = runGit(
    `git log ${range}${maxCount} --pretty=format:%h%x09%cs%x09%s`,
  )

  return rawLogs
    .split('\n')
    .map((line) => {
      const [hash = '', date = '', ...subjectParts] = line.split('\t')
      const message = cleanSubject(subjectParts.join('\t'))

      return {
        hash,
        date: formatDate(date),
        message,
      }
    })
    .filter((commit) => commit.hash && commit.message)
}

const getTags = () => {
  const rawTags = runGit('git tag --sort=-creatordate --format=%(refname:short)%09%(creatordate:short)')

  return rawTags
    .split('\n')
    .map((line) => {
      const [name = '', date = ''] = line.split('\t')
      return { name, date: formatDate(date) }
    })
    .filter((tag) => tag.name)
}

const shortSha = runGit('git rev-parse --short HEAD', 'dev')
const tags = getTags()
const latestTag = tags[0]?.name ?? ''
const version = shortSha === 'dev' ? `${currentPackageVersion}-dev` : `${currentPackageVersion}+${shortSha}`

const timeline = []

const unreleasedRange = latestTag ? `${latestTag}..HEAD` : 'HEAD'
const unreleasedCommits = getCommits(unreleasedRange, latestTag ? undefined : MAX_UNTAGGED_COMMITS)
if (unreleasedCommits.length > 0 || tags.length === 0) {
  timeline.push({
    version,
    date: unreleasedCommits[0]?.date ?? formatDate(new Date().toISOString()),
    isCurrent: true,
    changes:
      unreleasedCommits.length > 0
        ? unreleasedCommits
        : [
            {
              hash: shortSha,
              date: '',
              message: 'No commit messages found for this release.',
            },
          ],
  })
}

tags.forEach((tag, index) => {
  const nextTag = tags[index + 1]?.name
  const range = nextTag ? `${nextTag}..${tag.name}` : tag.name
  const changes = getCommits(range)

  timeline.push({
    version: tag.name,
    date: tag.date || changes[0]?.date || '',
    isCurrent: timeline.length === 0 && index === 0,
    changes:
      changes.length > 0
        ? changes
        : [
            {
              hash: '',
              date: tag.date,
              message: 'No commit messages found for this release.',
            },
          ],
  })
})

const releaseInfo = {
  version,
  generatedAt: new Date().toISOString(),
  timeline,
}

const content = `export const releaseInfo = ${JSON.stringify(releaseInfo, null, 2)} as const\n`

mkdirSync(dirname(outputPath), { recursive: true })
writeFileSync(outputPath, content, 'utf8')

console.log(`Generated release timeline: ${releaseInfo.version}`)
