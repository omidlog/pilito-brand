import { spawn, type ChildProcess } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

/**
 * A minimal headless-Chrome driver over the DevTools protocol, with no npm dependency (Node's global
 * WebSocket and fetch). It drives a real browser engine: layout, CSS, the Studio script, focus, the
 * clipboard fallback and Content-Security-Policy enforcement all run as they would for the owner.
 *
 * Chrome is located from CHROME_PATH or the usual install paths. When none exists, `findChrome()`
 * returns null and the browser tests skip with a message (set STUDIO_E2E_REQUIRED=1 to fail instead).
 * The browser only ever loads the loopback Studio started by the test; no network is used.
 */
export function findChrome(): string | null {
  const candidates = [
    process.env.CHROME_PATH,
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ].filter((item): item is string => Boolean(item))
  return candidates.find((file) => fs.existsSync(file)) ?? null
}

interface Pending {
  resolve: (value: Record<string, unknown>) => void
  reject: (error: Error) => void
}

export interface BrowserProblem {
  kind: 'console' | 'exception' | 'log'
  text: string
}

export class Page {
  private nextId = 1
  private pending = new Map<number, Pending>()
  private listeners = new Map<string, Array<(params: Record<string, unknown>) => void>>()
  /** Console errors, uncaught exceptions and browser log errors (CSP violations are reported here). */
  readonly problems: BrowserProblem[] = []

  constructor(private readonly socket: WebSocket) {
    socket.addEventListener('message', (event) => {
      const message = JSON.parse(String(event.data)) as { id?: number; method?: string; params?: Record<string, unknown>; result?: Record<string, unknown>; error?: { message: string } }
      if (message.id !== undefined) {
        const waiter = this.pending.get(message.id)
        this.pending.delete(message.id)
        if (message.error) waiter?.reject(new Error(message.error.message))
        else waiter?.resolve(message.result ?? {})
        return
      }
      for (const listener of this.listeners.get(message.method ?? '') ?? []) listener(message.params ?? {})
    })
    this.on('Runtime.consoleAPICalled', (params) => {
      if (params.type === 'error' || params.type === 'assert') this.problems.push({ kind: 'console', text: JSON.stringify(params.args) })
    })
    this.on('Runtime.exceptionThrown', (params) => this.problems.push({ kind: 'exception', text: JSON.stringify(params.exceptionDetails) }))
    this.on('Log.entryAdded', (params) => {
      const entry = params.entry as { level: string; text: string; url?: string }
      // A missing favicon on an error page is not a defect worth failing on; everything else is.
      if (entry.level === 'error' && !/favicon/.test(entry.url ?? '')) this.problems.push({ kind: 'log', text: `${entry.text} ${entry.url ?? ''}` })
    })
  }

  send(method: string, params: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    const id = this.nextId++
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject })
      this.socket.send(JSON.stringify({ id, method, params }))
    })
  }

  on(method: string, listener: (params: Record<string, unknown>) => void): void {
    this.listeners.set(method, [...(this.listeners.get(method) ?? []), listener])
  }

  once(method: string, timeoutMs = 15_000): Promise<Record<string, unknown>> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`timed out waiting for ${method}`)), timeoutMs)
      const listener = (params: Record<string, unknown>): void => {
        clearTimeout(timer)
        const list = this.listeners.get(method) ?? []
        this.listeners.set(method, list.filter((item) => item !== listener))
        resolve(params)
      }
      this.on(method, listener)
    })
  }

  async init(): Promise<void> {
    await Promise.all([this.send('Page.enable'), this.send('Runtime.enable'), this.send('Log.enable')])
  }

  async viewport(width: number, height: number, mobile = false): Promise<void> {
    await this.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile })
  }

  /** Navigates and waits for the load event. */
  async goto(url: string): Promise<void> {
    const loaded = this.once('Page.loadEventFired')
    await this.send('Page.navigate', { url })
    await loaded
  }

  /** Runs an action that causes a navigation (a form submit, a link click) and waits for the new page. */
  async navigation(action: () => Promise<unknown>): Promise<void> {
    const loaded = this.once('Page.loadEventFired')
    await action()
    await loaded
  }

  async eval<T>(expression: string): Promise<T> {
    const result = (await this.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true, userGesture: true })) as { result: { value: T }; exceptionDetails?: { text: string; exception?: { description?: string } } }
    if (result.exceptionDetails) throw new Error(`evaluate failed: ${result.exceptionDetails.exception?.description ?? result.exceptionDetails.text}\n${expression}`)
    return result.result.value
  }

  async waitFor(expression: string, timeoutMs = 15_000): Promise<void> {
    const end = Date.now() + timeoutMs
    while (Date.now() < end) {
      if (await this.eval<boolean>(`Boolean(${expression})`).catch(() => false)) return
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
    throw new Error(`timed out waiting for ${expression}`)
  }

  /** Clicks the element's center with a real mouse event, as a person would. */
  async click(selector: string): Promise<void> {
    const box = await this.eval<{ x: number; y: number } | null>(`(() => {
      const el = document.querySelector(${JSON.stringify(selector)})
      if (!el) return null
      el.scrollIntoView({ block: 'center' })
      const r = el.getBoundingClientRect()
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
    })()`)
    if (!box) throw new Error(`no element ${selector}`)
    for (const type of ['mousePressed', 'mouseReleased']) await this.send('Input.dispatchMouseEvent', { type, x: box.x, y: box.y, button: 'left', clickCount: 1 })
  }

  /** Focuses a field, clears it and types text through the keyboard pipeline. */
  async type(selector: string, text: string): Promise<void> {
    await this.eval(`(() => { const el = document.querySelector(${JSON.stringify(selector)}); el.focus(); el.select && el.select() })()`)
    await this.send('Input.insertText', { text })
  }

  async press(key: 'Tab' | 'Enter' | 'Escape', shift = false): Promise<void> {
    const codes = { Tab: 9, Enter: 13, Escape: 27 }
    const base = { key, code: key, windowsVirtualKeyCode: codes[key], modifiers: shift ? 8 : 0 }
    await this.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', ...base, ...(key === 'Enter' ? { text: '\r' } : {}) })
    if (key === 'Enter') await this.send('Input.dispatchKeyEvent', { type: 'char', ...base, text: '\r' })
    await this.send('Input.dispatchKeyEvent', { type: 'keyUp', ...base })
  }

  async screenshot(file: string): Promise<void> {
    const result = (await this.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true })) as { data: string }
    fs.mkdirSync(path.dirname(file), { recursive: true })
    fs.writeFileSync(file, Buffer.from(result.data, 'base64'))
  }

  close(): void {
    this.socket.close()
  }
}

export class Browser {
  private constructor(
    private readonly process: ChildProcess,
    private readonly port: number,
    private readonly profile: string,
  ) {}

  static async launch(executable: string): Promise<Browser> {
    const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-chrome-'))
    const child = spawn(
      executable,
      [
        '--headless=new',
        '--no-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-extensions',
        '--disable-background-networking',
        '--disable-component-update',
        '--disable-sync',
        '--metrics-recording-only',
        '--remote-debugging-port=0',
        `--user-data-dir=${profile}`,
        'about:blank',
      ],
      { stdio: ['ignore', 'ignore', 'pipe'] },
    )
    const port = await new Promise<number>((resolve, reject) => {
      let buffer = ''
      const timer = setTimeout(() => reject(new Error('Chrome did not start')), 20_000)
      child.stderr!.on('data', (chunk: Buffer) => {
        buffer += chunk.toString()
        const match = buffer.match(/DevTools listening on ws:\/\/127\.0\.0\.1:(\d+)\//)
        if (match) {
          clearTimeout(timer)
          resolve(Number(match[1]))
        }
      })
      child.on('exit', () => reject(new Error('Chrome exited during start-up')))
    })
    return new Browser(child, port, profile)
  }

  async newPage(): Promise<Page> {
    const res = await fetch(`http://127.0.0.1:${this.port}/json/new?about:blank`, { method: 'PUT' })
    const target = (await res.json()) as { webSocketDebuggerUrl: string }
    const socket = new WebSocket(target.webSocketDebuggerUrl)
    await new Promise<void>((resolve, reject) => {
      socket.addEventListener('open', () => resolve(), { once: true })
      socket.addEventListener('error', () => reject(new Error('DevTools socket failed')), { once: true })
    })
    const page = new Page(socket)
    await page.init()
    return page
  }

  async close(): Promise<void> {
    const exited = new Promise<void>((resolve) => this.process.once('exit', () => resolve()))
    this.process.kill('SIGTERM')
    await Promise.race([exited, new Promise((resolve) => setTimeout(resolve, 3000))])
    if (this.process.exitCode === null) this.process.kill('SIGKILL')
    fs.rmSync(this.profile, { recursive: true, force: true })
  }
}
