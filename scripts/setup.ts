import { $ } from 'bun'
import process from 'node:process'

const repo = process.argv.at(2)
const repoUrl = `https://github.com/motivationisdead/${repo}.git`

if (!repo) {
  console.log('usage: bun setup <repo>')
  process.exit(1)
}

try {
  await $`git clone ${repoUrl} packages/${repo}`
} catch {
  process.exit(1)
}

process.chdir(`packages/${repo}`)

// Install dependencies
await $`bun i`
await $`cp ../../.gitignore .`
await $`echo /.gitignore >> .gitignore`
