import { execSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outputPath = resolve(root, 'src/config/release.ts')
const packageJson = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))

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

const shortSha = runGit('git rev-parse --short HEAD', 'dev')
const latestTag = runGit('git describe --tags --abbrev=0')
const baseVersion = latestTag || packageJson.version || '0.0.0'
const version = shortSha === 'dev' ? `${baseVersion}-dev` : `${baseVersion}+${shortSha}`
const rawLogs = runGit('git log -n 8 --pretty=format:%s')

const logs = rawLogs
  .split('\n')
  .map((message) => message.trim())
  .filter((message) => message.length > 0 && !message.startsWith('Merge '))

const releaseInfo = {
  version,
  logs: logs.length > 0 ? logs : ['No commit messages found for this release.'],
}

const content = `export const releaseInfo = ${JSON.stringify(releaseInfo, null, 2)} as const\n`

mkdirSync(dirname(outputPath), { recursive: true })
writeFileSync(outputPath, content, 'utf8')

console.log(`Generated release info: ${releaseInfo.version}`)
