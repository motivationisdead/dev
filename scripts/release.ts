import devPkg from '../package.json'

// ---- Generate package.json ----
const pkg = (await Bun.file('package.json').json()) as Partial<typeof devPkg>
const repo = process.cwd().split('/').pop()!

const rename = (key: string): string =>
  key.replace('motivationisdead', pkg.author!).replace('dev', repo)

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

delete pkg.scripts

await Bun.write('dist/package.json', `${JSON.stringify(pkg, null, 2)}\n`)
