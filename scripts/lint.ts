import { $ } from 'bun'
import process from 'node:process'

const args = process.argv.slice(2).toString()
const fmt = args.includes('f')
const listFiles = args.includes('d')
  ? ['diff', 'origin/main', '--diff-filter=dxb', '--name-only']
  : 'ls-files'

if (!(await Bun.file('eslint.config.js').exists())) {
  process.chdir('../..')
}

const files = (await $`git ${listFiles}`.quiet()).text().split('\n')
console.log(`${fmt ? 'formatting:' : 'linting:'} ${files.join(' ')}\n`)

try {
  await $`bun -b x prettier --ignore-path ${fmt ? '-w' : '-c'}\
    ${files.filter((ext) => /\.(?:json|md|ts|yml)$/.test(ext))}`
  await $`bun -b x eslint ${fmt ? '--fix' : ''}\
    ${files.filter((ext) => ext.endsWith('.ts'))}`
} catch {
  process.exit(1)
}
