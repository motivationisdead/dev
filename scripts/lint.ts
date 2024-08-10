import { $ } from 'bun'
import process from 'node:process'

let repo = `packages/${/[a-z-]+$/.exec(process.cwd())?.[0]}`
const args = process.argv.slice(2).toString()
const fmt = args.includes('f')
const listFiles = args.includes('a')
  ? 'ls-files'
  : ['diff', 'origin/main', '--diff-filter=dxb', '--name-only']
const files = (await $`git ${listFiles}`.quiet())
  .text()
  .split('\n')
  .filter((ext) => /\.(?:json|md|ts|yml)$/.test(ext))

console.log(`${fmt ? 'formatting:' : 'linting:'} ${files.join(' ')}\n`)

// Always run from dev root
if (repo === 'packages/dev') {
  repo = '.'
} else {
  process.chdir('../..')
}

// Run linters
try {
  await $`bun -b x prettier --ignore-path ${fmt ? '-w' : '-c'}\
    ${repo}/{${files.join(',')}}`
  await $`bun -b x eslint ${fmt ? '--fix' : ''}\
    ${repo}/{${files.filter((ext) => ext.endsWith('.ts')).join(',')}}`
} catch {
  process.exit(1)
}
