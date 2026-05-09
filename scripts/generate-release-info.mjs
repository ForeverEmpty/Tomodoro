import { execSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outputPath = resolve(root, 'src/config/release.ts')
const packageJson = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))
const fallbackVersion = packageJson.version || '0.0.0'
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

const normalizeVersion = (version) => version.replace(/^v/i, '')

const parseVersion = (version) => {
  const [, major = '0', minor = '0', patch = '0'] =
    normalizeVersion(version).match(/^(\d+)\.(\d+)\.(\d+)/) ?? []

  return {
    major: Number(major),
    minor: Number(minor),
    patch: Number(patch),
  }
}

const formatVersion = ({ major, minor, patch }) => `${major}.${minor}.${patch}`

const compareVersions = (left, right) => {
  const leftVersion = parseVersion(left)
  const rightVersion = parseVersion(right)
  const leftParts = [leftVersion.major, leftVersion.minor, leftVersion.patch]
  const rightParts = [rightVersion.major, rightVersion.minor, rightVersion.patch]

  for (let index = 0; index < leftParts.length; index += 1) {
    if (leftParts[index] > rightParts[index]) return 1
    if (leftParts[index] < rightParts[index]) return -1
  }

  return 0
}

const maxVersion = (left, right) => (compareVersions(left, right) >= 0 ? left : right)

const incrementVersion = (version, level) => {
  if (level === 'major') {
    return { major: version.major + 1, minor: 0, patch: 0 }
  }

  if (level === 'minor') {
    return { major: version.major, minor: version.minor + 1, patch: 0 }
  }

  return { major: version.major, minor: version.minor, patch: version.patch + 1 }
}

const getBumpLevel = (message) => {
  if (/BREAKING CHANGE|BREAKING-CHANGE/.test(message) || /^[a-z]+(?:\(.+\))?!:/.test(message)) {
    return 'major'
  }

  if (/^feat(?:\(.+\))?:/.test(message)) {
    return 'minor'
  }

  if (/^(fix|perf)(?:\(.+\))?:/.test(message)) {
    return 'patch'
  }

  return 'patch'
}

const getHighestBumpLevel = (commits) => {
  if (commits.some((commit) => getBumpLevel(commit.message) === 'major')) {
    return 'major'
  }

  if (commits.some((commit) => getBumpLevel(commit.message) === 'minor')) {
    return 'minor'
  }

  return 'patch'
}

const cleanSubject = (subject) => {
  const normalizedSubject = subject.replace(/\s+/g, ' ').replace(/^Merge\s.+$/i, '').trim()

  if (normalizedSubject.length <= MAX_MESSAGE_LENGTH) {
    return normalizedSubject
  }

  return `${normalizedSubject.slice(0, MAX_MESSAGE_LENGTH - 1).trim()}...`
}

const getCommits = (range = 'HEAD', order = 'desc') => {
  const orderFlag = order === 'asc' ? ' --reverse' : ''
  const rawLogs = runGit(`git log ${range}${orderFlag} --pretty=format:%h%x09%cs%x09%s`)

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

const createFallbackTimeline = (currentDisplayVersion) => {
  const commits = getCommits('HEAD', 'asc')
  let nextVersion = parseVersion('0.0.0')

  const releases = commits.map((commit, index) => {
    const bumpLevel = index === 0 ? 'patch' : getBumpLevel(commit.message)
    nextVersion = incrementVersion(nextVersion, bumpLevel)

    return {
      version: formatVersion(nextVersion),
      date: commit.date,
      isCurrent: index === commits.length - 1,
      changes: [commit],
    }
  })

  const reversedReleases = releases.reverse()
  if (reversedReleases[0]) {
    reversedReleases[0] = {
      ...reversedReleases[0],
      version: currentDisplayVersion,
    }
  }

  return reversedReleases
}

const createTaggedTimeline = (tags, shortSha) => {
  const timeline = []
  const latestTag = tags[0]?.name ?? ''
  const unreleasedCommits = latestTag ? getCommits(`${latestTag}..HEAD`) : []

  if (unreleasedCommits.length > 0) {
    const nextVersion = formatVersion(
      incrementVersion(parseVersion(latestTag), getHighestBumpLevel(unreleasedCommits)),
    )

    timeline.push({
      version: `${nextVersion}+${shortSha}`,
      date: unreleasedCommits[0]?.date ?? formatDate(new Date().toISOString()),
      isCurrent: true,
      changes: unreleasedCommits,
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

  return timeline
}

const shortSha = runGit('git rev-parse --short HEAD', 'dev')
const tags = getTags()
const fallbackTimelinePreview = tags.length === 0 ? createFallbackTimeline(fallbackVersion) : []
const computedFallbackVersion = fallbackTimelinePreview[0]?.version ?? fallbackVersion
const currentFallbackVersion = maxVersion(computedFallbackVersion, fallbackVersion)
const fallbackDisplayVersion =
  shortSha === 'dev' ? `${currentFallbackVersion}-dev` : `${currentFallbackVersion}+${shortSha}`
const timeline =
  tags.length > 0 ? createTaggedTimeline(tags, shortSha) : createFallbackTimeline(fallbackDisplayVersion)

const releaseInfo = {
  version: timeline[0]?.version ?? fallbackDisplayVersion,
  generatedAt: new Date().toISOString(),
  timeline:
    timeline.length > 0
      ? timeline
      : [
          {
            version: fallbackDisplayVersion,
            date: formatDate(new Date().toISOString()),
            isCurrent: true,
            changes: [
              {
                hash: shortSha,
                date: '',
                message: 'No commit messages found for this release.',
              },
            ],
          },
        ],
}

const content = `export const releaseInfo = ${JSON.stringify(releaseInfo, null, 2)} as const\n`

mkdirSync(dirname(outputPath), { recursive: true })
writeFileSync(outputPath, content, 'utf8')

console.log(`Generated release timeline: ${releaseInfo.version}`)
