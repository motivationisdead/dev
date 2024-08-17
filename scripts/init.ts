import { mkdir, readdir } from 'node:fs/promises'
import { createInterface } from 'node:readline'

const questions = async (): Promise<Record<string, string>> =>
  await new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout })

    rl.question('GitHub Username: ', (user) => {
      rl.question('GitHub Repository: ', (repo) => {
        resolve({ user, repo })
        rl.close()
      })
    })
  })

const inputs: Record<string, string> = {
  year: new Date().getFullYear().toString(),
  ...(await questions()),
}
const templateFiles = await readdir('templates', {
  recursive: true,
  withFileTypes: true,
}).then((dirent) =>
  dirent.filter((d) => d.isFile()).map((d) => `${d.parentPath}/${d.name}`),
)

await mkdir(`packages/${inputs.repo}`)
process.chdir(`packages/${inputs.repo}`)

for (const file of templateFiles) {
  await Bun.write(
    file.replace('templates', '.'),
    (await Bun.file(`../../${file}`).text()).replace(
      /\(\([a-z]+\)\)/g,
      (placeholder) => inputs[placeholder.slice(2, -2)],
    ),
  )
}
