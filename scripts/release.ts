import { $ } from 'bun'
import devPkg from '../package.json'
import tsc from '../tsconfig.json'

type Package = Partial<typeof devPkg> & {
  dependencies?: Record<string, string>
}

const pkg = (await Bun.file('package.json').json()) as Package
const pkgMain = pkg.main
const repo = process.cwd().split('/').pop()!

const rename = (key: string): string =>
  key.replace('motivationisdead', pkg.author!).replace('dev', repo)

// Bundle JavaScript
await $`rm -rf dist`
await $`bun -b x esbuild ${pkgMain} --bundle --minify --format=esm\
  --outdir=dist --packages=external`
await $`cp {../../.npmrc,LICENSE,README.md} dist`

// Copy values from dev
pkg.author ||= devPkg.author
pkg.license = devPkg.license
pkg.main = devPkg.main
pkg.types = devPkg.types
pkg.keywords ||= devPkg.keywords
pkg.homepage ||= rename(devPkg.homepage)
pkg.bugs ||= rename(devPkg.bugs)
pkg.repository ||= {
  type: devPkg.repository.type,
  url: rename(devPkg.repository.url),
}
;(pkg.scripts as Record<string, string>) = {}

// Set version of workspace dependencies
if (pkg.dependencies) {
  for (const dep in pkg.dependencies) {
    if (pkg.dependencies[dep] === 'workspace:*') {
      const depPkg = Bun.file(`../${dep.split('/')[1]}/package.json`)

      pkg.dependencies[dep] = `^${((await depPkg.json()) as Package).version}`
    }
  }
}

await Bun.write('dist/package.json', `${JSON.stringify(pkg, null, 2)}\n`)

// Generate index.d.ts
await Bun.write('tsconfig.json', JSON.stringify({ ...tsc, include: [pkgMain] }))
await $`bun -b x tsc -p tsconfig.json --outFile dist/index`
await $`rm tsconfig.json`

// Remove unnecessary module declaration and format index.d.ts
const typesFile = 'dist/index.d.ts'

await Bun.write(
  typesFile,
  (await Bun.file(typesFile).text())
    .replace(/declare module "index" {/, '')
    .replace(/}\n$/, ''),
)
await $`cd ../.. && bun -b x prettier -w packages/${repo}/${typesFile}\
  --ignore-path`

// Publish to JSR
const dryRun = process.argv.at(2) === '--dry-run'
const rc = pkg.version!.includes('-')

if (dryRun || process.env.JSR_TOKEN) {
  const jsr: Record<string, string | Record<string, string | string[]>> = {
    name: pkg.name!,
    version: pkg.version!,
    exports: pkgMain!,
    publish: { include: ['LICENSE', 'README.md', 'src'] },
  }

  if (pkg.dependencies) {
    jsr.imports = {}

    for (const [dep, version] of Object.entries(pkg.dependencies)) {
      jsr.imports[dep] = `jsr:${dep}@${version}`
    }
  }

  await Bun.write('jsr.json', `${JSON.stringify(jsr, null, 2)}\n`)
  await $`bun -b x jsr publish\
    ${dryRun ? ['--allow-dirty', '--dry-run'] : '--provenance'}`
  await $`rm jsr.json`
}

// Publish to npm
if (dryRun || process.env.NPM_TOKEN) {
  await $`cd dist && npm publish --tag ${rc ? 'next' : 'latest'}\
    --access public ${dryRun ? '--dry-run' : ''}`
  await $`rm -r dist`
}

// Release on GitHub
if (process.env.GH_TOKEN) {
  const changelog = await Bun.file('CHANGELOG.md').text()

  Bun.write('changelog.tmp', changelog.match(/(?<=##.+\n\n).+?(?=\n##|$)/s)![0])

  await $`gh release create v${pkg.version} -t v${pkg.version} -F changelog.tmp\
    ${rc ? '-p' : ''}`
}
