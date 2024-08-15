import { $ } from 'bun'
import process from 'node:process'

let repo = `packages/${/[a-z-]+$/.exec(process.cwd())?.[0]}`
const args = process.argv.slice(2).toString()
const listFiles =
  args.includes('a') ||
  (await $`git branch --show-current`.quiet()).text().trim() === 'main'
    ? 'ls-files'
    : ['diff', 'origin/main', '--diff-filter=dxb', '--name-only']
const files = (await $`git ${listFiles}`.quiet())
  .text()
  .split('\n')
  .filter((ext) => /\.(?:json|md|ts|yml)$/.test(ext))

if (files.length === 0) {
  process.exit(0)
}

// Always run from dev root
if (await Bun.file('tsconfig.json').exists()) {
  repo = '.'
} else {
  process.chdir('../..')
}

const fmt = args.includes('f')
const fileList = (list: string[]): string =>
  `${repo}/${list.length === 1 ? list : `{${list}}`}`

// Run linters
try {
  await $`bun -b x prettier --config .prettierrc.json --ignore-path\
    ${fmt ? '-w' : '-c'} ${fileList(files)}`

  const tsFiles = files.filter((ext) => ext.endsWith('.ts'))

  if (tsFiles.length !== 0) {
    await $`bun -b x eslint -c eslint.config.ts ${fmt ? '--fix' : ''}\
      ${fileList(tsFiles)}`
  }
} catch {
  process.exit(1)
}
