import crypto from 'node:crypto'
import path from 'node:path'
import readline from 'node:readline'
import { assertSlug } from '@brand-os/brand-core'
import { hashPassword } from './auth/password.js'
import { base32Encode } from './auth/totp.js'
import { validOwner, validRepoName } from './config.js'
import { GitHubClient } from './github/client.js'
import { Registry } from './registry.js'

/**
 * Owner-run server commands. These run on the Studio host, not in the browser, and are the only way to
 * register an existing brand repository (for example one created before Studio existed).
 *
 *   npm run studio:hash-password               reads the password from stdin or a hidden prompt
 *   npm run studio -- totp-secret              prints a new base32 TOTP secret for your authenticator
 *   npm run studio -- session-secret           prints a new random session secret
 *   npm run studio -- brands                   lists registered brands
 *   npm run studio -- register --slug <s> --repo <owner/name>
 *   npm run studio -- unregister --slug <s>    removes the Studio mapping only (never touches GitHub)
 */
async function secretInput(prompt: string): Promise<string> {
  if (!process.stdin.isTTY) {
    const chunks: Buffer[] = []
    for await (const chunk of process.stdin) chunks.push(Buffer.from(chunk as Buffer))
    return Buffer.concat(chunks).toString('utf8').replace(/\r?\n$/, '')
  }
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true })
  const output = rl as unknown as { _writeToOutput: (text: string) => void }
  let muted = false
  output._writeToOutput = (text: string) => {
    if (!muted) process.stdout.write(text)
  }
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close()
      process.stdout.write('\n')
      resolve(answer)
    })
    muted = true
  })
}

function flag(args: string[], name: string): string | undefined {
  const index = args.indexOf(`--${name}`)
  return index >= 0 ? args[index + 1] : undefined
}

async function main(): Promise<void> {
  const [command, ...args] = process.argv.slice(2)
  if (args.some((arg) => arg.startsWith('--password'))) throw new Error('Passwords are never accepted on the command line. Use stdin or the prompt.')
  const dataDir = path.resolve(process.env.STUDIO_DATA_DIR ?? '.studio-data')
  switch (command) {
    case 'hash-password': {
      const password = await secretInput('Owner password (min 12 characters): ')
      console.log(hashPassword(password))
      return
    }
    case 'totp-secret':
      console.log(base32Encode(crypto.randomBytes(20)))
      return
    case 'session-secret':
      console.log(crypto.randomBytes(32).toString('base64'))
      return
    case 'brands': {
      for (const brand of new Registry(dataDir).list()) console.log(`${brand.slug}\t${brand.repo.owner}/${brand.repo.name}\t${brand.provisioning?.state ?? 'registered'}`)
      return
    }
    case 'register': {
      const slug = flag(args, 'slug') ?? ''
      const [owner = '', name = ''] = (flag(args, 'repo') ?? '').split('/')
      assertSlug(slug)
      if (!validOwner(owner) || !validRepoName(name)) throw new Error('Use --repo owner/name.')
      const registry = new Registry(dataDir)
      if (registry.get(slug) || registry.byRepoName(owner, name)) throw new Error('That slug or repository is already registered.')
      const client = new GitHubClient({ token: process.env.STUDIO_GITHUB_READ_TOKEN?.trim() || null })
      const repo = await client.getRepo(owner, name)
      if (!repo) throw new Error('The repository is not reachable with STUDIO_GITHUB_READ_TOKEN.')
      if (!repo.private) throw new Error('Refusing to register a public repository. Make it private first.')
      registry.upsert({
        slug,
        display_name: flag(args, 'name') ?? slug,
        profile: flag(args, 'profile') === 'personal-brand' ? 'personal-brand' : 'business',
        repo: { owner: repo.owner || owner, name: repo.name || name, id: repo.id, html_url: repo.html_url, default_branch: repo.default_branch },
        source: 'registered',
        created_at: new Date().toISOString(),
        created_by: 'server-cli',
        provisioning: null,
      })
      console.log(`Registered ${slug} -> ${owner}/${name}. Studio checks on first view that brand.slug in the repository is "${slug}".`)
      return
    }
    case 'unregister': {
      const slug = flag(args, 'slug') ?? ''
      console.log(new Registry(dataDir).remove(slug) ? `Removed ${slug} from Studio. The GitHub repository was not touched.` : 'No such brand.')
      return
    }
    default:
      console.log('Commands: hash-password, totp-secret, session-secret, brands, register --slug <slug> --repo <owner/name> [--name <display name>] [--profile business|personal-brand], unregister --slug <slug>')
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Failed.')
  process.exit(1)
})
