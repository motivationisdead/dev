import { $ } from 'bun'
import process from 'node:process'

let [user, repo] = (process.argv.at(2)?.split('/') ?? []) as [string?, string?]

// Set up existing package
if (user) {
  if (!repo) {
    ;[user, repo] = ['motivationisdead', user]
  }
  if (!(await Bun.file(`packages/${repo}/LICENSE`).exists())) {
    try {
      await $`git clone https://github.com/${user}/${repo}.git packages/${repo}`
    } catch {
      process.exit(1)
    }
  }

  process.chdir(`packages/${repo}`)
}
// Initialize new project instead
else {
  await import('./init')
  await $`git init`
}

// Install dependencies
await $`bun i`

// Copy files from dev
await $`cp ../../.gitignore .`
await $`echo /.gitignore >> .gitignore`
await $`ln -fs ../../bunfig.toml .`
await $`echo /bunfig.toml >> .gitignore`
