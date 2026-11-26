import { createRequire as __engineRequire } from 'node:module'; const require = __engineRequire(import.meta.url);
import {
  AjvJsonSchemaValidator,
  CallToolResultSchema,
  CompleteResultSchema,
  CreateMessageRequestSchema,
  CreateMessageResultSchema,
  CreateMessageResultWithToolsSchema,
  CreateTaskResultSchema,
  ElicitRequestSchema,
  ElicitResultSchema,
  EmptyResultSchema,
  ErrorCode,
  GetPromptResultSchema,
  InitializeResultSchema,
  LATEST_PROTOCOL_VERSION,
  ListChangedOptionsBaseSchema,
  ListPromptsResultSchema,
  ListResourceTemplatesResultSchema,
  ListResourcesResultSchema,
  ListToolsResultSchema,
  McpError,
  PromptListChangedNotificationSchema,
  Protocol,
  ReadBuffer,
  ReadResourceResultSchema,
  ResourceListChangedNotificationSchema,
  SUPPORTED_PROTOCOL_VERSIONS,
  ToolListChangedNotificationSchema,
  assertClientRequestTaskCapability,
  assertToolsCallTaskCapability,
  getLiteralValue,
  getObjectShape,
  mergeCapabilities,
  safeParse,
  serializeMessage
} from "./chunk-TLUWQWB4.mjs";
import {
  DEMO_NOW,
  createDemoBrand,
  packAssetIds
} from "./chunk-GG6T6WX5.mjs";
import "./chunk-P266KQFD.mjs";
import "./chunk-PBBSGXWH.mjs";
import "./chunk-UFA2RPL2.mjs";
import {
  packDigest,
  verifyPack
} from "./chunk-4QCLP6RD.mjs";
import "./chunk-6K2U6D7O.mjs";
import "./chunk-RFT54P4C.mjs";
import "./chunk-D3U2JFTZ.mjs";
import {
  NAMED_FACT_TOOL_IDS
} from "./chunk-Z4VEC43P.mjs";
import "./chunk-ZYAYDNGS.mjs";
import {
  approveRevision,
  proposeRevision
} from "./chunk-5OMKZSIF.mjs";
import "./chunk-3KXXRRZE.mjs";
import "./chunk-MHQ2KNS6.mjs";
import "./chunk-AQ6QTRSP.mjs";
import "./chunk-HHMADR62.mjs";
import {
  AGENT_TOKEN_ENV,
  InterviewEngine,
  allQuestions,
  ensureApprovalSecret,
  issueAgentToken,
  openWorkspace,
  readFacts,
  revokeAgentToken
} from "./chunk-HOCT4QOE.mjs";
import "./chunk-CONY5BIZ.mjs";
import "./chunk-QXBDJJNV.mjs";
import "./chunk-NUYFBVWM.mjs";
import {
  __commonJS,
  __require,
  __toESM
} from "./chunk-QDMMEM6P.mjs";

// node_modules/isexe/windows.js
var require_windows = __commonJS({
  "node_modules/isexe/windows.js"(exports, module) {
    "use strict";
    module.exports = isexe;
    isexe.sync = sync;
    var fs3 = __require("fs");
    function checkPathExt(path3, options) {
      var pathext = options.pathExt !== void 0 ? options.pathExt : process.env.PATHEXT;
      if (!pathext) {
        return true;
      }
      pathext = pathext.split(";");
      if (pathext.indexOf("") !== -1) {
        return true;
      }
      for (var i = 0; i < pathext.length; i++) {
        var p = pathext[i].toLowerCase();
        if (p && path3.substr(-p.length).toLowerCase() === p) {
          return true;
        }
      }
      return false;
    }
    function checkStat(stat, path3, options) {
      if (!stat.isSymbolicLink() && !stat.isFile()) {
        return false;
      }
      return checkPathExt(path3, options);
    }
    function isexe(path3, options, cb) {
      fs3.stat(path3, function(er, stat) {
        cb(er, er ? false : checkStat(stat, path3, options));
      });
    }
    function sync(path3, options) {
      return checkStat(fs3.statSync(path3), path3, options);
    }
  }
});

// node_modules/isexe/mode.js
var require_mode = __commonJS({
  "node_modules/isexe/mode.js"(exports, module) {
    "use strict";
    module.exports = isexe;
    isexe.sync = sync;
    var fs3 = __require("fs");
    function isexe(path3, options, cb) {
      fs3.stat(path3, function(er, stat) {
        cb(er, er ? false : checkStat(stat, options));
      });
    }
    function sync(path3, options) {
      return checkStat(fs3.statSync(path3), options);
    }
    function checkStat(stat, options) {
      return stat.isFile() && checkMode(stat, options);
    }
    function checkMode(stat, options) {
      var mod = stat.mode;
      var uid = stat.uid;
      var gid = stat.gid;
      var myUid = options.uid !== void 0 ? options.uid : process.getuid && process.getuid();
      var myGid = options.gid !== void 0 ? options.gid : process.getgid && process.getgid();
      var u = parseInt("100", 8);
      var g = parseInt("010", 8);
      var o = parseInt("001", 8);
      var ug = u | g;
      var ret = mod & o || mod & g && gid === myGid || mod & u && uid === myUid || mod & ug && myUid === 0;
      return ret;
    }
  }
});

// node_modules/isexe/index.js
var require_isexe = __commonJS({
  "node_modules/isexe/index.js"(exports, module) {
    "use strict";
    var fs3 = __require("fs");
    var core;
    if (process.platform === "win32" || global.TESTING_WINDOWS) {
      core = require_windows();
    } else {
      core = require_mode();
    }
    module.exports = isexe;
    isexe.sync = sync;
    function isexe(path3, options, cb) {
      if (typeof options === "function") {
        cb = options;
        options = {};
      }
      if (!cb) {
        if (typeof Promise !== "function") {
          throw new TypeError("callback not provided");
        }
        return new Promise(function(resolve, reject) {
          isexe(path3, options || {}, function(er, is) {
            if (er) {
              reject(er);
            } else {
              resolve(is);
            }
          });
        });
      }
      core(path3, options || {}, function(er, is) {
        if (er) {
          if (er.code === "EACCES" || options && options.ignoreErrors) {
            er = null;
            is = false;
          }
        }
        cb(er, is);
      });
    }
    function sync(path3, options) {
      try {
        return core.sync(path3, options || {});
      } catch (er) {
        if (options && options.ignoreErrors || er.code === "EACCES") {
          return false;
        } else {
          throw er;
        }
      }
    }
  }
});

// node_modules/which/which.js
var require_which = __commonJS({
  "node_modules/which/which.js"(exports, module) {
    "use strict";
    var isWindows = process.platform === "win32" || process.env.OSTYPE === "cygwin" || process.env.OSTYPE === "msys";
    var path3 = __require("path");
    var COLON = isWindows ? ";" : ":";
    var isexe = require_isexe();
    var getNotFoundError = (cmd) => Object.assign(new Error(`not found: ${cmd}`), { code: "ENOENT" });
    var getPathInfo = (cmd, opt) => {
      const colon = opt.colon || COLON;
      const pathEnv = cmd.match(/\//) || isWindows && cmd.match(/\\/) ? [""] : [
        // windows always checks the cwd first
        ...isWindows ? [process.cwd()] : [],
        ...(opt.path || process.env.PATH || /* istanbul ignore next: very unusual */
        "").split(colon)
      ];
      const pathExtExe = isWindows ? opt.pathExt || process.env.PATHEXT || ".EXE;.CMD;.BAT;.COM" : "";
      const pathExt = isWindows ? pathExtExe.split(colon) : [""];
      if (isWindows) {
        if (cmd.indexOf(".") !== -1 && pathExt[0] !== "")
          pathExt.unshift("");
      }
      return {
        pathEnv,
        pathExt,
        pathExtExe
      };
    };
    var which = (cmd, opt, cb) => {
      if (typeof opt === "function") {
        cb = opt;
        opt = {};
      }
      if (!opt)
        opt = {};
      const { pathEnv, pathExt, pathExtExe } = getPathInfo(cmd, opt);
      const found = [];
      const step = (i) => new Promise((resolve, reject) => {
        if (i === pathEnv.length)
          return opt.all && found.length ? resolve(found) : reject(getNotFoundError(cmd));
        const ppRaw = pathEnv[i];
        const pathPart = /^".*"$/.test(ppRaw) ? ppRaw.slice(1, -1) : ppRaw;
        const pCmd = path3.join(pathPart, cmd);
        const p = !pathPart && /^\.[\\\/]/.test(cmd) ? cmd.slice(0, 2) + pCmd : pCmd;
        resolve(subStep(p, i, 0));
      });
      const subStep = (p, i, ii) => new Promise((resolve, reject) => {
        if (ii === pathExt.length)
          return resolve(step(i + 1));
        const ext = pathExt[ii];
        isexe(p + ext, { pathExt: pathExtExe }, (er, is) => {
          if (!er && is) {
            if (opt.all)
              found.push(p + ext);
            else
              return resolve(p + ext);
          }
          return resolve(subStep(p, i, ii + 1));
        });
      });
      return cb ? step(0).then((res) => cb(null, res), cb) : step(0);
    };
    var whichSync = (cmd, opt) => {
      opt = opt || {};
      const { pathEnv, pathExt, pathExtExe } = getPathInfo(cmd, opt);
      const found = [];
      for (let i = 0; i < pathEnv.length; i++) {
        const ppRaw = pathEnv[i];
        const pathPart = /^".*"$/.test(ppRaw) ? ppRaw.slice(1, -1) : ppRaw;
        const pCmd = path3.join(pathPart, cmd);
        const p = !pathPart && /^\.[\\\/]/.test(cmd) ? cmd.slice(0, 2) + pCmd : pCmd;
        for (let j = 0; j < pathExt.length; j++) {
          const cur = p + pathExt[j];
          try {
            const is = isexe.sync(cur, { pathExt: pathExtExe });
            if (is) {
              if (opt.all)
                found.push(cur);
              else
                return cur;
            }
          } catch (ex) {
          }
        }
      }
      if (opt.all && found.length)
        return found;
      if (opt.nothrow)
        return null;
      throw getNotFoundError(cmd);
    };
    module.exports = which;
    which.sync = whichSync;
  }
});

// node_modules/path-key/index.js
var require_path_key = __commonJS({
  "node_modules/path-key/index.js"(exports, module) {
    "use strict";
    var pathKey = (options = {}) => {
      const environment = options.env || process.env;
      const platform = options.platform || process.platform;
      if (platform !== "win32") {
        return "PATH";
      }
      return Object.keys(environment).reverse().find((key) => key.toUpperCase() === "PATH") || "Path";
    };
    module.exports = pathKey;
    module.exports.default = pathKey;
  }
});

// node_modules/cross-spawn/lib/util/resolveCommand.js
var require_resolveCommand = __commonJS({
  "node_modules/cross-spawn/lib/util/resolveCommand.js"(exports, module) {
    "use strict";
    var path3 = __require("path");
    var which = require_which();
    var getPathKey = require_path_key();
    function resolveCommandAttempt(parsed, withoutPathExt) {
      const env = parsed.options.env || process.env;
      const cwd = process.cwd();
      const hasCustomCwd = parsed.options.cwd != null;
      const shouldSwitchCwd = hasCustomCwd && process.chdir !== void 0 && !process.chdir.disabled;
      if (shouldSwitchCwd) {
        try {
          process.chdir(parsed.options.cwd);
        } catch (err) {
        }
      }
      let resolved;
      try {
        resolved = which.sync(parsed.command, {
          path: env[getPathKey({ env })],
          pathExt: withoutPathExt ? path3.delimiter : void 0
        });
      } catch (e) {
      } finally {
        if (shouldSwitchCwd) {
          process.chdir(cwd);
        }
      }
      if (resolved) {
        resolved = path3.resolve(hasCustomCwd ? parsed.options.cwd : "", resolved);
      }
      return resolved;
    }
    function resolveCommand(parsed) {
      return resolveCommandAttempt(parsed) || resolveCommandAttempt(parsed, true);
    }
    module.exports = resolveCommand;
  }
});

// node_modules/cross-spawn/lib/util/escape.js
var require_escape = __commonJS({
  "node_modules/cross-spawn/lib/util/escape.js"(exports, module) {
    "use strict";
    var metaCharsRegExp = /([()\][%!^"`<>&|;, *?])/g;
    function escapeCommand(arg) {
      arg = arg.replace(metaCharsRegExp, "^$1");
      return arg;
    }
    function escapeArgument(arg, doubleEscapeMetaChars) {
      arg = `${arg}`;
      arg = arg.replace(/(?=(\\+?)?)\1"/g, '$1$1\\"');
      arg = arg.replace(/(?=(\\+?)?)\1$/, "$1$1");
      arg = `"${arg}"`;
      arg = arg.replace(metaCharsRegExp, "^$1");
      if (doubleEscapeMetaChars) {
        arg = arg.replace(metaCharsRegExp, "^$1");
      }
      return arg;
    }
    module.exports.command = escapeCommand;
    module.exports.argument = escapeArgument;
  }
});

// node_modules/shebang-regex/index.js
var require_shebang_regex = __commonJS({
  "node_modules/shebang-regex/index.js"(exports, module) {
    "use strict";
    module.exports = /^#!(.*)/;
  }
});

// node_modules/shebang-command/index.js
var require_shebang_command = __commonJS({
  "node_modules/shebang-command/index.js"(exports, module) {
    "use strict";
    var shebangRegex = require_shebang_regex();
    module.exports = (string = "") => {
      const match = string.match(shebangRegex);
      if (!match) {
        return null;
      }
      const [path3, argument] = match[0].replace(/#! ?/, "").split(" ");
      const binary = path3.split("/").pop();
      if (binary === "env") {
        return argument;
      }
      return argument ? `${binary} ${argument}` : binary;
    };
  }
});

// node_modules/cross-spawn/lib/util/readShebang.js
var require_readShebang = __commonJS({
  "node_modules/cross-spawn/lib/util/readShebang.js"(exports, module) {
    "use strict";
    var fs3 = __require("fs");
    var shebangCommand = require_shebang_command();
    function readShebang(command) {
      const size = 150;
      const buffer = Buffer.alloc(size);
      let fd;
      try {
        fd = fs3.openSync(command, "r");
        fs3.readSync(fd, buffer, 0, size, 0);
        fs3.closeSync(fd);
      } catch (e) {
      }
      return shebangCommand(buffer.toString());
    }
    module.exports = readShebang;
  }
});

// node_modules/cross-spawn/lib/parse.js
var require_parse = __commonJS({
  "node_modules/cross-spawn/lib/parse.js"(exports, module) {
    "use strict";
    var path3 = __require("path");
    var resolveCommand = require_resolveCommand();
    var escape = require_escape();
    var readShebang = require_readShebang();
    var isWin = process.platform === "win32";
    var isExecutableRegExp = /\.(?:com|exe)$/i;
    var isCmdShimRegExp = /node_modules[\\/].bin[\\/][^\\/]+\.cmd$/i;
    function detectShebang(parsed) {
      parsed.file = resolveCommand(parsed);
      const shebang = parsed.file && readShebang(parsed.file);
      if (shebang) {
        parsed.args.unshift(parsed.file);
        parsed.command = shebang;
        return resolveCommand(parsed);
      }
      return parsed.file;
    }
    function parseNonShell(parsed) {
      if (!isWin) {
        return parsed;
      }
      const commandFile = detectShebang(parsed);
      const needsShell = !isExecutableRegExp.test(commandFile);
      if (parsed.options.forceShell || needsShell) {
        const needsDoubleEscapeMetaChars = isCmdShimRegExp.test(commandFile);
        parsed.command = path3.normalize(parsed.command);
        parsed.command = escape.command(parsed.command);
        parsed.args = parsed.args.map((arg) => escape.argument(arg, needsDoubleEscapeMetaChars));
        const shellCommand = [parsed.command].concat(parsed.args).join(" ");
        parsed.args = ["/d", "/s", "/c", `"${shellCommand}"`];
        parsed.command = process.env.comspec || "cmd.exe";
        parsed.options.windowsVerbatimArguments = true;
      }
      return parsed;
    }
    function parse(command, args, options) {
      if (args && !Array.isArray(args)) {
        options = args;
        args = null;
      }
      args = args ? args.slice(0) : [];
      options = Object.assign({}, options);
      const parsed = {
        command,
        args,
        options,
        file: void 0,
        original: {
          command,
          args
        }
      };
      return options.shell ? parsed : parseNonShell(parsed);
    }
    module.exports = parse;
  }
});

// node_modules/cross-spawn/lib/enoent.js
var require_enoent = __commonJS({
  "node_modules/cross-spawn/lib/enoent.js"(exports, module) {
    "use strict";
    var isWin = process.platform === "win32";
    function notFoundError(original, syscall) {
      return Object.assign(new Error(`${syscall} ${original.command} ENOENT`), {
        code: "ENOENT",
        errno: "ENOENT",
        syscall: `${syscall} ${original.command}`,
        path: original.command,
        spawnargs: original.args
      });
    }
    function hookChildProcess(cp, parsed) {
      if (!isWin) {
        return;
      }
      const originalEmit = cp.emit;
      cp.emit = function(name, arg1) {
        if (name === "exit") {
          const err = verifyENOENT(arg1, parsed);
          if (err) {
            return originalEmit.call(cp, "error", err);
          }
        }
        return originalEmit.apply(cp, arguments);
      };
    }
    function verifyENOENT(status, parsed) {
      if (isWin && status === 1 && !parsed.file) {
        return notFoundError(parsed.original, "spawn");
      }
      return null;
    }
    function verifyENOENTSync(status, parsed) {
      if (isWin && status === 1 && !parsed.file) {
        return notFoundError(parsed.original, "spawnSync");
      }
      return null;
    }
    module.exports = {
      hookChildProcess,
      verifyENOENT,
      verifyENOENTSync,
      notFoundError
    };
  }
});

// node_modules/cross-spawn/index.js
var require_cross_spawn = __commonJS({
  "node_modules/cross-spawn/index.js"(exports, module) {
    "use strict";
    var cp = __require("child_process");
    var parse = require_parse();
    var enoent = require_enoent();
    function spawn3(command, args, options) {
      const parsed = parse(command, args, options);
      const spawned = cp.spawn(parsed.command, parsed.args, parsed.options);
      enoent.hookChildProcess(spawned, parsed);
      return spawned;
    }
    function spawnSync2(command, args, options) {
      const parsed = parse(command, args, options);
      const result = cp.spawnSync(parsed.command, parsed.args, parsed.options);
      result.error = result.error || enoent.verifyENOENTSync(result.status, parsed);
      return result;
    }
    module.exports = spawn3;
    module.exports.spawn = spawn3;
    module.exports.sync = spawnSync2;
    module.exports._parse = parse;
    module.exports._enoent = enoent;
  }
});

// scripts/acceptance.ts
import fs2 from "node:fs";
import path2 from "node:path";
import { parseArgs } from "node:util";

// scripts/acceptance/fixture.ts
var FIXTURE_BUDGET_FACT_CANARY = "ACCEPTANCE-BUDGET-FACT-CANARY 7310 EUR";
var FIXTURE_BUDGET_AMOUNT_CANARY = 7310731;
var FIXTURE_RESTRICTED_NOTE_CANARY = "ACCEPTANCE-RESTRICTED-NOTE-CANARY";
var FIXTURE_MOTION_PRINCIPLES = "SYNTHETIC: short, calm transitions; no flashing";
var FIXTURE_DRAFT_LOGO_CANARY = "ACCEPTANCE-DRAFT-LOGO-CANARY clear space 3x";
function createAcceptanceFixture() {
  const demo = createDemoBrand();
  try {
    const proof = ensureApprovalSecret(demo.root);
    const recorded = demo.engine.changeAnswer("business.marketing.budget", FIXTURE_BUDGET_FACT_CANARY);
    if (recorded.kind !== "recorded") throw new Error(`fixture budget fact was not recorded (${recorded.kind})`);
    const approved = demo.engine.approve("business.marketing.budget", "owner", proof);
    if (approved.kind !== "recorded") throw new Error(`fixture budget fact was not approved (${approved.kind})`);
    const motion = demo.engine.changeAnswer("brand.motion.principles", FIXTURE_MOTION_PRINCIPLES);
    if (motion.kind !== "recorded" || demo.engine.approve("brand.motion.principles", "owner", proof).kind !== "recorded") throw new Error("fixture motion fact was not approved");
    const draft = demo.engine.changeAnswer("brand.logo.clear_space", FIXTURE_DRAFT_LOGO_CANARY);
    if (draft.kind !== "recorded") throw new Error(`fixture draft logo answer was not recorded (${draft.kind})`);
    const ws = openWorkspace(demo.root, { now: () => DEMO_NOW });
    const revision = proposeRevision(ws, { strategy_id: "paid-acceptance", proposal: paidProposal() }).revision;
    approveRevision(ws, { strategy_id: "paid-acceptance", revision: revision.revision, expected_sha256: revision.content_sha256, proof });
    return { ...demo, canaries: [FIXTURE_BUDGET_FACT_CANARY, String(FIXTURE_BUDGET_AMOUNT_CANARY), FIXTURE_RESTRICTED_NOTE_CANARY, FIXTURE_DRAFT_LOGO_CANARY] };
  } catch (error) {
    demo.cleanup();
    throw error;
  }
}
function paidProposal() {
  return {
    title: "Synthetic paid social test",
    type: "paid_media",
    locale: "en",
    scope: { markets: ["en-US"], channel: "paid-social", period: "2027-Q1" },
    valid_from: "2026-11-01",
    valid_until: "2030-12-31",
    review_due_at: "2030-06-30",
    objective: { statement: "Test whether short educational posts drive trial sign-ups (synthetic).", status: "hypothesis" },
    success_metrics: [{ id: "trial_signups", unit: "sign-ups", baseline: null, target: null, measurement_source: "synthetic", status: "needs_baseline" }],
    guardrails: ["No claim that is not an approved fact"],
    constraints: ["Execution needs separate owner authorization"],
    must_do: ["Use approved copy only"],
    must_not_do: ["Spend or publish automatically"],
    non_goals: ["Brand awareness campaigns"],
    alternatives: [
      { id: "a", description: "Short educational posts", assessment: "chosen", rationale: "Matches the approved objective." },
      { id: "b", description: "Discount offers", assessment: "rejected", rationale: "No approved price claim." }
    ],
    selection_rationale: "Educational posts match the approved objective.",
    recommendations: [
      { id: "p1", priority: "high", action: "Test three creative hooks for two weeks", rationale: "Learn before scaling.", agent_kinds: ["ads"], evidence_refs: [], fact_refs: ["business.marketing.objective"] }
    ],
    fact_refs: ["business.marketing.objective", "business.market.geography"],
    evidence_refs: [],
    assumptions: ["Demand exists (unverified)"],
    open_questions: ["Who reviews the creatives?"],
    restricted: { budget: { amount: FIXTURE_BUDGET_AMOUNT_CANARY, currency: "EUR", period: "2027-Q1" }, notes: FIXTURE_RESTRICTED_NOTE_CANARY }
  };
}

// scripts/acceptance/harness.ts
import { spawn as spawn2, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

// node_modules/@modelcontextprotocol/sdk/dist/esm/experimental/tasks/client.js
var ExperimentalClientTasks = class {
  constructor(_client) {
    this._client = _client;
  }
  /**
   * Calls a tool and returns an AsyncGenerator that yields response messages.
   * The generator is guaranteed to end with either a 'result' or 'error' message.
   *
   * This method provides streaming access to tool execution, allowing you to
   * observe intermediate task status updates for long-running tool calls.
   * Automatically validates structured output if the tool has an outputSchema.
   *
   * @example
   * ```typescript
   * const stream = client.experimental.tasks.callToolStream({ name: 'myTool', arguments: {} });
   * for await (const message of stream) {
   *   switch (message.type) {
   *     case 'taskCreated':
   *       console.log('Tool execution started:', message.task.taskId);
   *       break;
   *     case 'taskStatus':
   *       console.log('Tool status:', message.task.status);
   *       break;
   *     case 'result':
   *       console.log('Tool result:', message.result);
   *       break;
   *     case 'error':
   *       console.error('Tool error:', message.error);
   *       break;
   *   }
   * }
   * ```
   *
   * @param params - Tool call parameters (name and arguments)
   * @param resultSchema - Zod schema for validating the result (defaults to CallToolResultSchema)
   * @param options - Optional request options (timeout, signal, task creation params, etc.)
   * @returns AsyncGenerator that yields ResponseMessage objects
   *
   * @experimental
   */
  async *callToolStream(params, resultSchema = CallToolResultSchema, options) {
    const clientInternal = this._client;
    const optionsWithTask = {
      ...options,
      // We check if the tool is known to be a task during auto-configuration, but assume
      // the caller knows what they're doing if they pass this explicitly
      task: options?.task ?? (clientInternal.isToolTask(params.name) ? {} : void 0)
    };
    const stream = clientInternal.requestStream({ method: "tools/call", params }, resultSchema, optionsWithTask);
    const validator = clientInternal.getToolOutputValidator(params.name);
    for await (const message of stream) {
      if (message.type === "result" && validator) {
        const result = message.result;
        if (!result.structuredContent && !result.isError) {
          yield {
            type: "error",
            error: new McpError(ErrorCode.InvalidRequest, `Tool ${params.name} has an output schema but did not return structured content`)
          };
          return;
        }
        if (result.structuredContent) {
          try {
            const validationResult = validator(result.structuredContent);
            if (!validationResult.valid) {
              yield {
                type: "error",
                error: new McpError(ErrorCode.InvalidParams, `Structured content does not match the tool's output schema: ${validationResult.errorMessage}`)
              };
              return;
            }
          } catch (error) {
            if (error instanceof McpError) {
              yield { type: "error", error };
              return;
            }
            yield {
              type: "error",
              error: new McpError(ErrorCode.InvalidParams, `Failed to validate structured content: ${error instanceof Error ? error.message : String(error)}`)
            };
            return;
          }
        }
      }
      yield message;
    }
  }
  /**
   * Gets the current status of a task.
   *
   * @param taskId - The task identifier
   * @param options - Optional request options
   * @returns The task status
   *
   * @experimental
   */
  async getTask(taskId, options) {
    return this._client.getTask({ taskId }, options);
  }
  /**
   * Retrieves the result of a completed task.
   *
   * @param taskId - The task identifier
   * @param resultSchema - Zod schema for validating the result
   * @param options - Optional request options
   * @returns The task result
   *
   * @experimental
   */
  async getTaskResult(taskId, resultSchema, options) {
    return this._client.getTaskResult({ taskId }, resultSchema, options);
  }
  /**
   * Lists tasks with optional pagination.
   *
   * @param cursor - Optional pagination cursor
   * @param options - Optional request options
   * @returns List of tasks with optional next cursor
   *
   * @experimental
   */
  async listTasks(cursor, options) {
    return this._client.listTasks(cursor ? { cursor } : void 0, options);
  }
  /**
   * Cancels a running task.
   *
   * @param taskId - The task identifier
   * @param options - Optional request options
   *
   * @experimental
   */
  async cancelTask(taskId, options) {
    return this._client.cancelTask({ taskId }, options);
  }
  /**
   * Sends a request and returns an AsyncGenerator that yields response messages.
   * The generator is guaranteed to end with either a 'result' or 'error' message.
   *
   * This method provides streaming access to request processing, allowing you to
   * observe intermediate task status updates for task-augmented requests.
   *
   * @param request - The request to send
   * @param resultSchema - Zod schema for validating the result
   * @param options - Optional request options (timeout, signal, task creation params, etc.)
   * @returns AsyncGenerator that yields ResponseMessage objects
   *
   * @experimental
   */
  requestStream(request, resultSchema, options) {
    return this._client.requestStream(request, resultSchema, options);
  }
};

// node_modules/@modelcontextprotocol/sdk/dist/esm/client/index.js
function applyElicitationDefaults(schema, data) {
  if (!schema || data === null || typeof data !== "object")
    return;
  if (schema.type === "object" && schema.properties && typeof schema.properties === "object") {
    const obj = data;
    const props = schema.properties;
    for (const key of Object.keys(props)) {
      const propSchema = props[key];
      if (obj[key] === void 0 && Object.prototype.hasOwnProperty.call(propSchema, "default")) {
        obj[key] = propSchema.default;
      }
      if (obj[key] !== void 0) {
        applyElicitationDefaults(propSchema, obj[key]);
      }
    }
  }
  if (Array.isArray(schema.anyOf)) {
    for (const sub of schema.anyOf) {
      if (typeof sub !== "boolean") {
        applyElicitationDefaults(sub, data);
      }
    }
  }
  if (Array.isArray(schema.oneOf)) {
    for (const sub of schema.oneOf) {
      if (typeof sub !== "boolean") {
        applyElicitationDefaults(sub, data);
      }
    }
  }
}
function getSupportedElicitationModes(capabilities) {
  if (!capabilities) {
    return { supportsFormMode: false, supportsUrlMode: false };
  }
  const hasFormCapability = capabilities.form !== void 0;
  const hasUrlCapability = capabilities.url !== void 0;
  const supportsFormMode = hasFormCapability || !hasFormCapability && !hasUrlCapability;
  const supportsUrlMode = hasUrlCapability;
  return { supportsFormMode, supportsUrlMode };
}
var Client = class extends Protocol {
  /**
   * Initializes this client with the given name and version information.
   */
  constructor(_clientInfo, options) {
    super(options);
    this._clientInfo = _clientInfo;
    this._cachedToolOutputValidators = /* @__PURE__ */ new Map();
    this._cachedKnownTaskTools = /* @__PURE__ */ new Set();
    this._cachedRequiredTaskTools = /* @__PURE__ */ new Set();
    this._listChangedDebounceTimers = /* @__PURE__ */ new Map();
    this._capabilities = options?.capabilities ?? {};
    this._jsonSchemaValidator = options?.jsonSchemaValidator ?? new AjvJsonSchemaValidator();
    if (options?.listChanged) {
      this._pendingListChangedConfig = options.listChanged;
    }
  }
  /**
   * Set up handlers for list changed notifications based on config and server capabilities.
   * This should only be called after initialization when server capabilities are known.
   * Handlers are silently skipped if the server doesn't advertise the corresponding listChanged capability.
   * @internal
   */
  _setupListChangedHandlers(config) {
    if (config.tools && this._serverCapabilities?.tools?.listChanged) {
      this._setupListChangedHandler("tools", ToolListChangedNotificationSchema, config.tools, async () => {
        const result = await this.listTools();
        return result.tools;
      });
    }
    if (config.prompts && this._serverCapabilities?.prompts?.listChanged) {
      this._setupListChangedHandler("prompts", PromptListChangedNotificationSchema, config.prompts, async () => {
        const result = await this.listPrompts();
        return result.prompts;
      });
    }
    if (config.resources && this._serverCapabilities?.resources?.listChanged) {
      this._setupListChangedHandler("resources", ResourceListChangedNotificationSchema, config.resources, async () => {
        const result = await this.listResources();
        return result.resources;
      });
    }
  }
  /**
   * Access experimental features.
   *
   * WARNING: These APIs are experimental and may change without notice.
   *
   * @experimental
   */
  get experimental() {
    if (!this._experimental) {
      this._experimental = {
        tasks: new ExperimentalClientTasks(this)
      };
    }
    return this._experimental;
  }
  /**
   * Registers new capabilities. This can only be called before connecting to a transport.
   *
   * The new capabilities will be merged with any existing capabilities previously given (e.g., at initialization).
   */
  registerCapabilities(capabilities) {
    if (this.transport) {
      throw new Error("Cannot register capabilities after connecting to transport");
    }
    this._capabilities = mergeCapabilities(this._capabilities, capabilities);
  }
  /**
   * Override request handler registration to enforce client-side validation for elicitation.
   */
  setRequestHandler(requestSchema, handler) {
    const shape = getObjectShape(requestSchema);
    const methodSchema = shape?.method;
    if (!methodSchema) {
      throw new Error("Schema is missing a method literal");
    }
    const methodValue = getLiteralValue(methodSchema);
    if (typeof methodValue !== "string") {
      throw new Error("Schema method literal must be a string");
    }
    const method = methodValue;
    if (method === "elicitation/create") {
      const wrappedHandler = async (request, extra) => {
        const validatedRequest = safeParse(ElicitRequestSchema, request);
        if (!validatedRequest.success) {
          const errorMessage = validatedRequest.error instanceof Error ? validatedRequest.error.message : String(validatedRequest.error);
          throw new McpError(ErrorCode.InvalidParams, `Invalid elicitation request: ${errorMessage}`);
        }
        const { params } = validatedRequest.data;
        params.mode = params.mode ?? "form";
        const { supportsFormMode, supportsUrlMode } = getSupportedElicitationModes(this._capabilities.elicitation);
        if (params.mode === "form" && !supportsFormMode) {
          throw new McpError(ErrorCode.InvalidParams, "Client does not support form-mode elicitation requests");
        }
        if (params.mode === "url" && !supportsUrlMode) {
          throw new McpError(ErrorCode.InvalidParams, "Client does not support URL-mode elicitation requests");
        }
        const result = await Promise.resolve(handler(request, extra));
        if (params.task) {
          const taskValidationResult = safeParse(CreateTaskResultSchema, result);
          if (!taskValidationResult.success) {
            const errorMessage = taskValidationResult.error instanceof Error ? taskValidationResult.error.message : String(taskValidationResult.error);
            throw new McpError(ErrorCode.InvalidParams, `Invalid task creation result: ${errorMessage}`);
          }
          return taskValidationResult.data;
        }
        const validationResult = safeParse(ElicitResultSchema, result);
        if (!validationResult.success) {
          const errorMessage = validationResult.error instanceof Error ? validationResult.error.message : String(validationResult.error);
          throw new McpError(ErrorCode.InvalidParams, `Invalid elicitation result: ${errorMessage}`);
        }
        const validatedResult = validationResult.data;
        const requestedSchema = params.mode === "form" ? params.requestedSchema : void 0;
        if (params.mode === "form" && validatedResult.action === "accept" && validatedResult.content && requestedSchema) {
          if (this._capabilities.elicitation?.form?.applyDefaults) {
            try {
              applyElicitationDefaults(requestedSchema, validatedResult.content);
            } catch {
            }
          }
        }
        return validatedResult;
      };
      return super.setRequestHandler(requestSchema, wrappedHandler);
    }
    if (method === "sampling/createMessage") {
      const wrappedHandler = async (request, extra) => {
        const validatedRequest = safeParse(CreateMessageRequestSchema, request);
        if (!validatedRequest.success) {
          const errorMessage = validatedRequest.error instanceof Error ? validatedRequest.error.message : String(validatedRequest.error);
          throw new McpError(ErrorCode.InvalidParams, `Invalid sampling request: ${errorMessage}`);
        }
        const { params } = validatedRequest.data;
        const result = await Promise.resolve(handler(request, extra));
        if (params.task) {
          const taskValidationResult = safeParse(CreateTaskResultSchema, result);
          if (!taskValidationResult.success) {
            const errorMessage = taskValidationResult.error instanceof Error ? taskValidationResult.error.message : String(taskValidationResult.error);
            throw new McpError(ErrorCode.InvalidParams, `Invalid task creation result: ${errorMessage}`);
          }
          return taskValidationResult.data;
        }
        const hasTools = params.tools || params.toolChoice;
        const resultSchema = hasTools ? CreateMessageResultWithToolsSchema : CreateMessageResultSchema;
        const validationResult = safeParse(resultSchema, result);
        if (!validationResult.success) {
          const errorMessage = validationResult.error instanceof Error ? validationResult.error.message : String(validationResult.error);
          throw new McpError(ErrorCode.InvalidParams, `Invalid sampling result: ${errorMessage}`);
        }
        return validationResult.data;
      };
      return super.setRequestHandler(requestSchema, wrappedHandler);
    }
    return super.setRequestHandler(requestSchema, handler);
  }
  assertCapability(capability, method) {
    if (!this._serverCapabilities?.[capability]) {
      throw new Error(`Server does not support ${capability} (required for ${method})`);
    }
  }
  async connect(transport, options) {
    await super.connect(transport);
    if (transport.sessionId !== void 0) {
      return;
    }
    try {
      const result = await this.request({
        method: "initialize",
        params: {
          protocolVersion: LATEST_PROTOCOL_VERSION,
          capabilities: this._capabilities,
          clientInfo: this._clientInfo
        }
      }, InitializeResultSchema, options);
      if (result === void 0) {
        throw new Error(`Server sent invalid initialize result: ${result}`);
      }
      if (!SUPPORTED_PROTOCOL_VERSIONS.includes(result.protocolVersion)) {
        throw new Error(`Server's protocol version is not supported: ${result.protocolVersion}`);
      }
      this._serverCapabilities = result.capabilities;
      this._serverVersion = result.serverInfo;
      if (transport.setProtocolVersion) {
        transport.setProtocolVersion(result.protocolVersion);
      }
      this._instructions = result.instructions;
      await this.notification({
        method: "notifications/initialized"
      });
      if (this._pendingListChangedConfig) {
        this._setupListChangedHandlers(this._pendingListChangedConfig);
        this._pendingListChangedConfig = void 0;
      }
    } catch (error) {
      void this.close();
      throw error;
    }
  }
  /**
   * After initialization has completed, this will be populated with the server's reported capabilities.
   */
  getServerCapabilities() {
    return this._serverCapabilities;
  }
  /**
   * After initialization has completed, this will be populated with information about the server's name and version.
   */
  getServerVersion() {
    return this._serverVersion;
  }
  /**
   * After initialization has completed, this may be populated with information about the server's instructions.
   */
  getInstructions() {
    return this._instructions;
  }
  assertCapabilityForMethod(method) {
    switch (method) {
      case "logging/setLevel":
        if (!this._serverCapabilities?.logging) {
          throw new Error(`Server does not support logging (required for ${method})`);
        }
        break;
      case "prompts/get":
      case "prompts/list":
        if (!this._serverCapabilities?.prompts) {
          throw new Error(`Server does not support prompts (required for ${method})`);
        }
        break;
      case "resources/list":
      case "resources/templates/list":
      case "resources/read":
      case "resources/subscribe":
      case "resources/unsubscribe":
        if (!this._serverCapabilities?.resources) {
          throw new Error(`Server does not support resources (required for ${method})`);
        }
        if (method === "resources/subscribe" && !this._serverCapabilities.resources.subscribe) {
          throw new Error(`Server does not support resource subscriptions (required for ${method})`);
        }
        break;
      case "tools/call":
      case "tools/list":
        if (!this._serverCapabilities?.tools) {
          throw new Error(`Server does not support tools (required for ${method})`);
        }
        break;
      case "completion/complete":
        if (!this._serverCapabilities?.completions) {
          throw new Error(`Server does not support completions (required for ${method})`);
        }
        break;
      case "initialize":
        break;
      case "ping":
        break;
    }
  }
  assertNotificationCapability(method) {
    switch (method) {
      case "notifications/roots/list_changed":
        if (!this._capabilities.roots?.listChanged) {
          throw new Error(`Client does not support roots list changed notifications (required for ${method})`);
        }
        break;
      case "notifications/initialized":
        break;
      case "notifications/cancelled":
        break;
      case "notifications/progress":
        break;
    }
  }
  assertRequestHandlerCapability(method) {
    if (!this._capabilities) {
      return;
    }
    switch (method) {
      case "sampling/createMessage":
        if (!this._capabilities.sampling) {
          throw new Error(`Client does not support sampling capability (required for ${method})`);
        }
        break;
      case "elicitation/create":
        if (!this._capabilities.elicitation) {
          throw new Error(`Client does not support elicitation capability (required for ${method})`);
        }
        break;
      case "roots/list":
        if (!this._capabilities.roots) {
          throw new Error(`Client does not support roots capability (required for ${method})`);
        }
        break;
      case "tasks/get":
      case "tasks/list":
      case "tasks/result":
      case "tasks/cancel":
        if (!this._capabilities.tasks) {
          throw new Error(`Client does not support tasks capability (required for ${method})`);
        }
        break;
      case "ping":
        break;
    }
  }
  assertTaskCapability(method) {
    assertToolsCallTaskCapability(this._serverCapabilities?.tasks?.requests, method, "Server");
  }
  assertTaskHandlerCapability(method) {
    if (!this._capabilities) {
      return;
    }
    assertClientRequestTaskCapability(this._capabilities.tasks?.requests, method, "Client");
  }
  async ping(options) {
    return this.request({ method: "ping" }, EmptyResultSchema, options);
  }
  async complete(params, options) {
    return this.request({ method: "completion/complete", params }, CompleteResultSchema, options);
  }
  async setLoggingLevel(level, options) {
    return this.request({ method: "logging/setLevel", params: { level } }, EmptyResultSchema, options);
  }
  async getPrompt(params, options) {
    return this.request({ method: "prompts/get", params }, GetPromptResultSchema, options);
  }
  async listPrompts(params, options) {
    return this.request({ method: "prompts/list", params }, ListPromptsResultSchema, options);
  }
  async listResources(params, options) {
    return this.request({ method: "resources/list", params }, ListResourcesResultSchema, options);
  }
  async listResourceTemplates(params, options) {
    return this.request({ method: "resources/templates/list", params }, ListResourceTemplatesResultSchema, options);
  }
  async readResource(params, options) {
    return this.request({ method: "resources/read", params }, ReadResourceResultSchema, options);
  }
  async subscribeResource(params, options) {
    return this.request({ method: "resources/subscribe", params }, EmptyResultSchema, options);
  }
  async unsubscribeResource(params, options) {
    return this.request({ method: "resources/unsubscribe", params }, EmptyResultSchema, options);
  }
  /**
   * Calls a tool and waits for the result. Automatically validates structured output if the tool has an outputSchema.
   *
   * For task-based execution with streaming behavior, use client.experimental.tasks.callToolStream() instead.
   */
  async callTool(params, resultSchema = CallToolResultSchema, options) {
    if (this.isToolTaskRequired(params.name)) {
      throw new McpError(ErrorCode.InvalidRequest, `Tool "${params.name}" requires task-based execution. Use client.experimental.tasks.callToolStream() instead.`);
    }
    const result = await this.request({ method: "tools/call", params }, resultSchema, options);
    const validator = this.getToolOutputValidator(params.name);
    if (validator) {
      if (!result.structuredContent && !result.isError) {
        throw new McpError(ErrorCode.InvalidRequest, `Tool ${params.name} has an output schema but did not return structured content`);
      }
      if (result.structuredContent) {
        try {
          const validationResult = validator(result.structuredContent);
          if (!validationResult.valid) {
            throw new McpError(ErrorCode.InvalidParams, `Structured content does not match the tool's output schema: ${validationResult.errorMessage}`);
          }
        } catch (error) {
          if (error instanceof McpError) {
            throw error;
          }
          throw new McpError(ErrorCode.InvalidParams, `Failed to validate structured content: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    }
    return result;
  }
  isToolTask(toolName) {
    if (!this._serverCapabilities?.tasks?.requests?.tools?.call) {
      return false;
    }
    return this._cachedKnownTaskTools.has(toolName);
  }
  /**
   * Check if a tool requires task-based execution.
   * Unlike isToolTask which includes 'optional' tools, this only checks for 'required'.
   */
  isToolTaskRequired(toolName) {
    return this._cachedRequiredTaskTools.has(toolName);
  }
  /**
   * Cache validators for tool output schemas.
   * Called after listTools() to pre-compile validators for better performance.
   */
  cacheToolMetadata(tools) {
    this._cachedToolOutputValidators.clear();
    this._cachedKnownTaskTools.clear();
    this._cachedRequiredTaskTools.clear();
    for (const tool of tools) {
      if (tool.outputSchema) {
        const toolValidator = this._jsonSchemaValidator.getValidator(tool.outputSchema);
        this._cachedToolOutputValidators.set(tool.name, toolValidator);
      }
      const taskSupport = tool.execution?.taskSupport;
      if (taskSupport === "required" || taskSupport === "optional") {
        this._cachedKnownTaskTools.add(tool.name);
      }
      if (taskSupport === "required") {
        this._cachedRequiredTaskTools.add(tool.name);
      }
    }
  }
  /**
   * Get cached validator for a tool
   */
  getToolOutputValidator(toolName) {
    return this._cachedToolOutputValidators.get(toolName);
  }
  async listTools(params, options) {
    const result = await this.request({ method: "tools/list", params }, ListToolsResultSchema, options);
    this.cacheToolMetadata(result.tools);
    return result;
  }
  /**
   * Set up a single list changed handler.
   * @internal
   */
  _setupListChangedHandler(listType, notificationSchema, options, fetcher) {
    const parseResult = ListChangedOptionsBaseSchema.safeParse(options);
    if (!parseResult.success) {
      throw new Error(`Invalid ${listType} listChanged options: ${parseResult.error.message}`);
    }
    if (typeof options.onChanged !== "function") {
      throw new Error(`Invalid ${listType} listChanged options: onChanged must be a function`);
    }
    const { autoRefresh, debounceMs } = parseResult.data;
    const { onChanged } = options;
    const refresh = async () => {
      if (!autoRefresh) {
        onChanged(null, null);
        return;
      }
      try {
        const items = await fetcher();
        onChanged(null, items);
      } catch (e) {
        const error = e instanceof Error ? e : new Error(String(e));
        onChanged(error, null);
      }
    };
    const handler = () => {
      if (debounceMs) {
        const existingTimer = this._listChangedDebounceTimers.get(listType);
        if (existingTimer) {
          clearTimeout(existingTimer);
        }
        const timer = setTimeout(refresh, debounceMs);
        this._listChangedDebounceTimers.set(listType, timer);
      } else {
        refresh();
      }
    };
    this.setNotificationHandler(notificationSchema, handler);
  }
  async sendRootsListChanged() {
    return this.notification({ method: "notifications/roots/list_changed" });
  }
};

// node_modules/@modelcontextprotocol/sdk/dist/esm/client/stdio.js
var import_cross_spawn = __toESM(require_cross_spawn(), 1);
import process2 from "node:process";
import { PassThrough } from "node:stream";
var DEFAULT_INHERITED_ENV_VARS = process2.platform === "win32" ? [
  "APPDATA",
  "HOMEDRIVE",
  "HOMEPATH",
  "LOCALAPPDATA",
  "PATH",
  "PROCESSOR_ARCHITECTURE",
  "SYSTEMDRIVE",
  "SYSTEMROOT",
  "TEMP",
  "USERNAME",
  "USERPROFILE",
  "PROGRAMFILES"
] : (
  /* list inspired by the default env inheritance of sudo */
  ["HOME", "LOGNAME", "PATH", "SHELL", "TERM", "USER"]
);
function getDefaultEnvironment() {
  const env = {};
  for (const key of DEFAULT_INHERITED_ENV_VARS) {
    const value = process2.env[key];
    if (value === void 0) {
      continue;
    }
    if (value.startsWith("()")) {
      continue;
    }
    env[key] = value;
  }
  return env;
}
var StdioClientTransport = class {
  constructor(server) {
    this._stderrStream = null;
    this._serverParams = server;
    this._readBuffer = new ReadBuffer({ maxBufferSize: server.maxBufferSize });
    if (server.stderr === "pipe" || server.stderr === "overlapped") {
      this._stderrStream = new PassThrough();
    }
  }
  /**
   * Starts the server process and prepares to communicate with it.
   */
  async start() {
    if (this._process) {
      throw new Error("StdioClientTransport already started! If using Client class, note that connect() calls start() automatically.");
    }
    return new Promise((resolve, reject) => {
      this._process = (0, import_cross_spawn.default)(this._serverParams.command, this._serverParams.args ?? [], {
        // merge default env with server env because mcp server needs some env vars
        env: {
          ...getDefaultEnvironment(),
          ...this._serverParams.env
        },
        stdio: ["pipe", "pipe", this._serverParams.stderr ?? "inherit"],
        shell: false,
        windowsHide: process2.platform === "win32",
        cwd: this._serverParams.cwd
      });
      this._process.on("error", (error) => {
        reject(error);
        this.onerror?.(error);
      });
      this._process.on("spawn", () => {
        resolve();
      });
      this._process.on("close", (_code) => {
        this._process = void 0;
        this.onclose?.();
      });
      this._process.stdin?.on("error", (error) => {
        this.onerror?.(error);
      });
      this._process.stdout?.on("data", (chunk) => {
        try {
          this._readBuffer.append(chunk);
          this.processReadBuffer();
        } catch (error) {
          this.onerror?.(error);
          this.close().catch(() => {
          });
        }
      });
      this._process.stdout?.on("error", (error) => {
        this.onerror?.(error);
      });
      if (this._stderrStream && this._process.stderr) {
        this._process.stderr.pipe(this._stderrStream);
      }
    });
  }
  /**
   * The stderr stream of the child process, if `StdioServerParameters.stderr` was set to "pipe" or "overlapped".
   *
   * If stderr piping was requested, a PassThrough stream is returned _immediately_, allowing callers to
   * attach listeners before the start method is invoked. This prevents loss of any early
   * error output emitted by the child process.
   */
  get stderr() {
    if (this._stderrStream) {
      return this._stderrStream;
    }
    return this._process?.stderr ?? null;
  }
  /**
   * The child process pid spawned by this transport.
   *
   * This is only available after the transport has been started.
   */
  get pid() {
    return this._process?.pid ?? null;
  }
  processReadBuffer() {
    while (true) {
      try {
        const message = this._readBuffer.readMessage();
        if (message === null) {
          break;
        }
        this.onmessage?.(message);
      } catch (error) {
        this.onerror?.(error);
      }
    }
  }
  async close() {
    if (this._process) {
      const processToClose = this._process;
      this._process = void 0;
      const closePromise = new Promise((resolve) => {
        processToClose.once("close", () => {
          resolve();
        });
      });
      try {
        processToClose.stdin?.end();
      } catch {
      }
      await Promise.race([closePromise, new Promise((resolve) => setTimeout(resolve, 2e3).unref())]);
      if (processToClose.exitCode === null) {
        try {
          processToClose.kill("SIGTERM");
        } catch {
        }
        await Promise.race([closePromise, new Promise((resolve) => setTimeout(resolve, 2e3).unref())]);
      }
      if (processToClose.exitCode === null) {
        try {
          processToClose.kill("SIGKILL");
        } catch {
        }
      }
    }
    this._readBuffer.clear();
  }
  send(message) {
    return new Promise((resolve) => {
      if (!this._process?.stdin) {
        throw new Error("Not connected");
      }
      const json = serializeMessage(message);
      if (this._process.stdin.write(json)) {
        resolve();
      } else {
        this._process.stdin.once("drain", resolve);
      }
    });
  }
};

// scripts/acceptance/model.ts
var ACCEPTANCE_SCHEMA = "brand-os/acceptance-report/v1";
var NOT_COVERED = [
  "live_claude_session: the scripted agent makes the tool calls a skill-following session would; a real model session (prompts, extra questions it might still ask) is a pilot observation, not a CI result",
  "visual_taste_and_similarity: no person or model looked at the artwork; production readiness reports needs_human_review",
  "semantic_persuasion: not_tested by design",
  "image_or_site_or_ad_renderer: only social_batch has a renderer; other journeys end in a brief",
  "owner_change_requests: recorded by the owner after reviewing outputs, not by the harness"
];
function caseVerdict(checks) {
  if (checks.some((check) => check.verdict === "FAIL")) return "FAIL";
  if (checks.length > 0 && checks.every((check) => check.verdict === "PASS")) return "PASS";
  return "NOT_TESTED";
}

// scripts/acceptance/harness.ts
var REPO = path.resolve(import.meta.dirname, "..", "..");
var LOADER = pathToFileURL(path.join(REPO, "node_modules", "tsx", "dist", "loader.mjs")).href;
var FA_TEN_POSTS_REQUEST = "\u06F1\u06F0 \u067E\u0633\u062A \u0627\u06CC\u0646\u0633\u062A\u0627\u06AF\u0631\u0627\u0645 \u0628\u0631\u0627\u06CC \u0628\u0631\u0646\u062F \u0628\u0633\u0627\u0632";
var PROBE = "acceptance-probe-unlisted";
var CHILD_TIMEOUT_MS = 15e4;
var ARABIC_SCRIPT = /[؀-ۿ]/;
function childEnv(extra = {}) {
  const env = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (typeof value === "string" && key !== AGENT_TOKEN_ENV && key !== "BRAND_OS_APPROVAL_PROOF") env[key] = value;
  }
  return { ...env, BRAND_OS_KNOWLEDGE_GH: "off", ...extra };
}
function runScript(script, args, opts) {
  return new Promise((resolve) => {
    const child = spawn2(process.execPath, ["--import", LOADER, path.join(REPO, script), ...args], { cwd: opts.cwd, env: opts.env ?? childEnv(), stdio: ["pipe", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => stdout += chunk.toString("utf8"));
    child.stderr.on("data", (chunk) => stderr += chunk.toString("utf8"));
    const timer = setTimeout(() => child.kill("SIGKILL"), CHILD_TIMEOUT_MS);
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({ code, stdout, stderr });
    });
    child.stdin.end(opts.input ?? "");
  });
}
async function mcpSession(cwd, transcript, token) {
  const client = new Client({ name: "brand-os-acceptance", version: "1.0.0" });
  await client.connect(new StdioClientTransport({ command: process.execPath, args: ["--import", LOADER, path.join(REPO, "scripts", "mcp.ts")], cwd, env: childEnv(token ? { [AGENT_TOKEN_ENV]: token } : {}), stderr: "pipe" }));
  return {
    async call(name, args) {
      const result = await client.callTool({ name, arguments: args });
      const text = result.content.map((part) => part.text ?? "").join("");
      transcript.push(text);
      if (result.isError) return { status: "tool_error", error: text.slice(0, 200) };
      return JSON.parse(text);
    },
    close: () => client.close()
  };
}
var sha256 = (data) => createHash("sha256").update(data).digest("hex");
function treeDigest(dir, skip = () => false) {
  const hash = createHash("sha256");
  if (!fs.existsSync(dir)) return hash.update("absent").digest("hex");
  const walk = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const full = path.join(current, entry.name);
      const rel = path.relative(dir, full).split(path.sep).join("/");
      if (skip(rel)) continue;
      if (entry.isSymbolicLink()) hash.update(`L:${rel}:${fs.readlinkSync(full)}
`);
      else if (entry.isDirectory()) walk(full);
      else if (entry.isFile()) hash.update(`F:${rel}:${sha256(fs.readFileSync(full))}
`);
    }
  };
  walk(dir);
  return hash.digest("hex");
}
var ACCESS_LOG = ".private/access-log.jsonl";
function copyWorkspace(from, to) {
  fs.mkdirSync(to, { recursive: true });
  fs.cpSync(path.join(from, "brand"), path.join(to, "brand"), { recursive: true, verbatimSymlinks: true });
  if (fs.existsSync(path.join(from, ".gitignore"))) fs.copyFileSync(path.join(from, ".gitignore"), path.join(to, ".gitignore"));
}
function realPathOf(target) {
  let existing = target;
  const rest = [];
  while (!fs.existsSync(existing)) {
    const parent = path.dirname(existing);
    if (parent === existing) break;
    rest.unshift(path.basename(existing));
    existing = parent;
  }
  return path.join(fs.realpathSync(existing), ...rest);
}
function prepareOut(out, root) {
  const full = path.resolve(out);
  const real = realPathOf(full);
  const realRoot = fs.realpathSync(root);
  for (const candidate of [full, real]) {
    if (candidate.split(path.sep).includes("brand")) throw new Error("--out must be outside any brand/ folder.");
  }
  if (real === realRoot || real.startsWith(`${realRoot}${path.sep}brand`)) throw new Error("--out must be outside the brand checkout.");
  if (fs.existsSync(full)) {
    if (fs.lstatSync(full).isSymbolicLink() || !fs.statSync(full).isDirectory()) throw new Error("--out must be a directory, not a link or a file.");
    if (fs.readdirSync(full).length > 0) throw new Error("--out must be empty.");
  }
  fs.mkdirSync(full, { recursive: true });
  return full;
}
function harnessCommit() {
  const result = spawnSync("git", ["rev-parse", "HEAD"], { cwd: REPO, encoding: "utf8" });
  return result.status === 0 ? result.stdout.trim() : null;
}
var packOf = (reply) => reply.status === "ok" ? reply.data ?? null : null;
var noPermissions = (permissions) => !!permissions && Object.values(permissions).every((flag) => flag === false);
var short = (sha) => sha ? sha.slice(0, 12) : "none";
function packIntegrity(reply) {
  const envelope = reply;
  const pack = packOf(reply);
  if (!pack) return { verdict: "FAIL", evidence: [`status:${envelope.status ?? "none"}`, `reason:${envelope.reason ?? "none"}`] };
  const verified = verifyPack(pack);
  const authorizes = Array.isArray(envelope.authorizes) && envelope.authorizes.length === 0 && pack.authorizes.length === 0;
  const permissions = noPermissions(pack.permissions);
  return {
    verdict: verified && authorizes && permissions ? "PASS" : "FAIL",
    evidence: [`status:ok`, `readiness:${pack.readiness}`, `staleness:${pack.staleness}`, `digest_verified:${verified}`, `authorizes_empty:${authorizes}`, `permissions_false:${permissions}`, `pack:${short(pack.digests.context_sha256)}`]
  };
}
function traceItems(pack, facts) {
  const sources = new Map(pack.sources.map((source) => [source.id, source.revision]));
  const problems = [];
  let approved = 0;
  let factItems = 0;
  for (const item of Object.values(pack.sections).flat()) {
    if (item.state === "owner_stated" && item.source_id !== null) problems.push(`owner_stated_with_source:${item.key}`);
    if (item.state !== "approved") continue;
    approved += 1;
    if (!item.source_id) {
      problems.push(`approved_without_source:${item.key}`);
      continue;
    }
    if (!sources.has(item.source_id)) problems.push(`source_not_listed:${item.key}`);
    const fact = facts[item.source_id];
    if (fact) {
      factItems += 1;
      if (fact.status !== "approved") problems.push(`fact_not_approved:${item.source_id}`);
      if (fact.revision_hash !== item.source_revision) problems.push(`revision_differs:${item.source_id}`);
    }
  }
  return { verdict: problems.length === 0 ? "PASS" : "FAIL", evidence: [`approved_items:${approved}`, `fact_items_traced:${factItems}`, ...problems.slice(0, 12)] };
}
function gaps(pack) {
  if (!pack) return { question_ids: [], other: 0 };
  const ids = [...new Set(pack.missing.map((entry) => entry.suggested_question_id).filter((id) => typeof id === "string"))].sort();
  return { question_ids: ids, other: pack.missing.filter((entry) => !entry.suggested_question_id).length };
}
function approvedFingerprint(pack) {
  const rows = Object.values(pack.sections).flat().filter((item) => item.state === "approved").map((item) => JSON.stringify([item.key, item.source_id, item.source_revision, item.value])).sort();
  return sha256(rows.join("\n"));
}
function leaks(transcript, secrets) {
  const text = transcript.join("\n");
  return secrets.filter((secret) => secret.length >= 6 && (text.includes(secret) || text.includes(JSON.stringify(secret).slice(1, -1))));
}
var CaseRun = class {
  constructor(id, journey, fixes, profile) {
    this.id = id;
    this.journey = journey;
    this.fixes = fixes;
    this.profile = profile;
  }
  id;
  journey;
  fixes;
  profile;
  checks = [];
  outputs = [];
  transcript = [];
  calls = 0;
  production = "not_tested";
  pack = null;
  started = Date.now();
  add(id, fixes, verdict, evidence) {
    this.checks.push({ id, fixes, verdict, evidence: evidence.slice(0, 24) });
  }
  /** Runs one check; an exception is a FAIL with its error class, never a pass. */
  async check(id, fixes, body) {
    try {
      const result = await body();
      this.add(id, fixes, result.verdict, result.evidence);
    } catch (error) {
      this.add(id, fixes, "FAIL", [`error:${error instanceof Error ? error.name : "unknown"}`, `message:${error instanceof Error ? error.message.replace(/\/[^\s'"]+/g, "<path>").slice(0, 160) : ""}`]);
    }
  }
  record(file, outRoot) {
    const bytes = fs.readFileSync(file);
    this.outputs.push({ file: path.relative(outRoot, file).split(path.sep).join("/"), sha256: sha256(bytes), bytes: bytes.length });
  }
  finish() {
    const g = gaps(this.pack);
    return {
      case_id: this.id,
      journey: this.journey,
      fixes: this.fixes,
      profile: this.profile,
      verdict: caseVerdict(this.checks),
      production: this.production,
      pack_sha256: this.pack?.digests.context_sha256 ?? null,
      metrics: {
        tool_calls: this.calls,
        owner_questions: g.question_ids.length,
        question_ids: g.question_ids,
        other_gaps: g.other,
        artifacts: this.outputs.length,
        seconds: Math.round((Date.now() - this.started) / 100) / 10
      },
      outputs: this.outputs,
      checks: this.checks
    };
  }
};
async function runAcceptance(opts) {
  if (process.env[AGENT_TOKEN_ENV]) throw new Error(`The acceptance harness is an owner-local run. Refusing while ${AGENT_TOKEN_ENV} is set.`);
  const root = path.resolve(opts.root);
  if (!fs.existsSync(path.join(root, "brand", "brand.config.yaml"))) throw new Error("The root has no brand/brand.config.yaml.");
  const out = prepareOut(opts.out, root);
  const progress = opts.progress ?? (() => {
  });
  const started = /* @__PURE__ */ new Date();
  const rootBefore = treeDigest(path.join(root, "brand"));
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "brand-os-acceptance-"));
  try {
    const snap = path.join(tmp, "ws");
    copyWorkspace(root, snap);
    const engine = new InterviewEngine(snap);
    const slug = engine.config().brand.slug;
    const label = "acceptance harness (temporary snapshot)";
    const issue = (profile) => issueAgentToken(snap, { brandId: slug, profile, label }).token;
    const tokens = { content: issue("content-read"), design: issue("design"), marketing: issue("marketing"), ads: issue("strategy-ads-read") };
    const revoked = issueAgentToken(snap, { brandId: slug, profile: "content-read", label });
    revokeAgentToken(snap, revoked.record.id);
    const otherBrand = issueAgentToken(snap, { brandId: `${slug}-other-brand`, profile: "content-read", label }).token;
    const facts = readFacts(snap, "approved", slug);
    const drafts = {};
    for (const [id, fact] of Object.entries(readFacts(snap, "draft", slug))) {
      const value = fact.value === null || fact.value === void 0 ? "" : String(fact.value);
      if (value.length >= 6 && value !== String(facts[id]?.value ?? "")) drafts[id] = value;
    }
    const restricted = [
      ...Object.values(facts).filter((fact) => fact.classification === "restricted" && fact.value !== null && fact.value !== void 0).map((fact) => typeof fact.value === "string" ? fact.value : JSON.stringify(fact.value)),
      ...opts.canaries ?? []
    ].filter((value) => value.length >= 6);
    const approvalSecret = path.join(snap, "brand", ".private");
    const privateValues = fs.existsSync(approvalSecret) ? privateSecrets(approvalSecret) : [];
    const ctx = {
      snap,
      out,
      slug,
      tokens,
      facts,
      bank: new Set(allQuestions().map((question) => question.id)),
      drafts,
      secrets: [...Object.values(tokens), revoked.token, otherBrand, ...privateValues, ...restricted],
      restricted,
      tmp
    };
    progress("acceptance: starting MCP sessions");
    const cases = [];
    progress("acceptance: journey 2 \u2014 single visual");
    cases.push(await singleVisual(ctx));
    progress("acceptance: journey 1 \u2014 ten Instagram posts");
    cases.push(await tenPosts(ctx, revoked.token, otherBrand));
    progress("acceptance: journey 3 \u2014 website brief");
    cases.push(await websiteBrief(ctx));
    progress("acceptance: journey 4 \u2014 paid-ad brief");
    cases.push(await paidBrief(ctx));
    const rootAfter = treeDigest(path.join(root, "brand"));
    const totals = { PASS: 0, FAIL: 0, NOT_TESTED: 0 };
    for (const record of cases) totals[record.verdict] += 1;
    const rootUnchanged = rootBefore === rootAfter;
    const verdict = totals.FAIL > 0 || !rootUnchanged ? "FAIL" : totals.NOT_TESTED > 0 ? "NOT_TESTED" : "PASS";
    return {
      schema: ACCEPTANCE_SCHEMA,
      origin: opts.origin,
      brand_id: slug,
      harness_commit: harnessCommit(),
      started_at: started.toISOString(),
      finished_at: (/* @__PURE__ */ new Date()).toISOString(),
      verdict,
      totals,
      cases,
      workspace: { snapshot: true, root_unchanged: rootUnchanged },
      not_covered: [...NOT_COVERED],
      authorizes: [],
      permissions: { publish: false, schedule: false, spend: false, deploy: false }
    };
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}
function privateSecrets(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isFile() || entry.name === "access-log.jsonl") continue;
    const text = fs.readFileSync(path.join(dir, entry.name), "utf8");
    for (const match of text.matchAll(/[A-Za-z0-9+/_=-]{32,}/g)) out.push(match[0]);
  }
  return out.slice(0, 200);
}
async function singleVisual(ctx) {
  const run = new CaseRun("single_visual", 2, ["FIX-01", "FIX-03", "FIX-05", "FIX-06"], "design");
  const session = await mcpSession(ctx.snap, run.transcript, ctx.tokens.design);
  try {
    const reply = await session.call("task_context", { task_type: "visual_design", locale: "en" });
    run.calls += 1;
    run.pack = packOf(reply);
    await run.check("context.pack", "FIX-03", () => packIntegrity(reply));
    await run.check("context.no_invented_facts", "FIX-02", () => run.pack ? traceItems(run.pack, ctx.facts) : { verdict: "FAIL", evidence: ["no_pack"] });
    const ids = run.pack ? packAssetIds(run.pack) : [];
    const dna = await session.call("visual_dna", { asset_ids: ids.slice(0, 20), mascot: { emotion: PROBE, stage: PROBE, angle: PROBE }, locale: "en" });
    run.calls += 1;
    const refs = dna.references ?? [];
    const approved = refs.filter((ref) => ref.via === "asset" && ref.state === "approved");
    await run.check("reference.approved_verified", "FIX-03", () => {
      if (dna.status !== "ok") return { verdict: "FAIL", evidence: [`visual_dna:${dna.status ?? "none"}`] };
      const states = refs.filter((ref) => ref.via === "asset").map((ref) => `${ref.state}${ref.reason ? `:${ref.reason}` : ""}`);
      if (ids.length === 0) return { verdict: "NOT_TESTED", evidence: ["assets_in_pack:0", "no approved asset to verify"] };
      if (approved.length === 0) return { verdict: "NOT_TESTED", evidence: [`assets_in_pack:${ids.length}`, "approved:0", ...states] };
      const bad = approved.filter((ref) => !/^[0-9a-f]{64}$/.test(ref.asset?.checksum_sha256 ?? "") || !ref.rights || !ref.model_use || ref.delivery !== "metadata_only" || ref.sent_to_model !== false);
      return { verdict: bad.length === 0 && noPermissions(dna.permissions) ? "PASS" : "FAIL", evidence: [`assets_in_pack:${ids.length}`, `approved:${approved.length}`, ...states, ...approved.map((ref) => `model_use:${ref.model_use}`), `bad:${bad.length}`] };
    });
    await run.check("reference.missing_stays_missing", "FIX-03", () => {
      const mascotApproved = refs.filter((ref) => ref.via === "mascot" && ref.state === "approved").length;
      const status = dna.mascot?.status ?? "none";
      if (dna.status !== "ok" || !dna.mascot) return { verdict: "FAIL", evidence: [`visual_dna:${dna.status ?? "none"}`, `mascot:${status}`] };
      return { verdict: status !== "resolved" && mascotApproved === 0 ? "PASS" : "FAIL", evidence: [`mascot:${status}`, `mascot_refs_approved:${mascotApproved}`, "request:unlisted emotion/stage/angle"] };
    });
    const first = approved[0];
    await run.check("reference.no_provider_upload", "FIX-03", async () => {
      if (!first?.asset_id) return { verdict: "NOT_TESTED", evidence: ["no approved asset reference"] };
      const read = await runScript("scripts/visual-dna.ts", ["read", first.asset_id, "--for", "external_provider", "--json"], { cwd: ctx.snap });
      run.calls += 1;
      const parsed = safeJson(read.stdout);
      if (first.model_use === "external_allowed") {
        return { verdict: read.code === 0 && parsed?.upload_authorized === false ? "PASS" : "FAIL", evidence: [`model_use:${first.model_use}`, `exit:${read.code}`, `upload_authorized:${String(parsed?.upload_authorized)}`] };
      }
      return { verdict: read.code !== 0 && parsed?.status === "refused" ? "PASS" : "FAIL", evidence: [`model_use:${first.model_use}`, `exit:${read.code}`, `refused:${parsed?.error?.code ?? "no"}`] };
    });
    await run.check("reference.checksum_drift", "FIX-05", async () => {
      if (!first?.asset_id || !first.asset) return { verdict: "NOT_TESTED", evidence: ["no approved asset reference"] };
      const drift = path.join(ctx.tmp, "drift");
      copyWorkspace(ctx.snap, drift);
      const file = path.join(drift, first.asset.path);
      const bytes = fs.readFileSync(file, "utf8");
      const at = bytes.lastIndexOf("</svg>");
      fs.writeFileSync(file, at >= 0 ? `${bytes.slice(0, at)} ${bytes.slice(at)}` : `${bytes} `);
      const driftSession = await mcpSession(drift, run.transcript, ctx.tokens.design);
      try {
        const again = await driftSession.call("visual_dna", { asset_ids: [first.asset_id] });
        run.calls += 1;
        const ref = again.references?.[0];
        return { verdict: ref?.state === "changed" ? "PASS" : "FAIL", evidence: [`state:${ref?.state ?? "none"}`, `reason:${ref?.reason ?? "none"}`] };
      } finally {
        await driftSession.close();
      }
    });
    await run.check("legacy.logo_motion_ids", "FIX-01", async () => {
      const guest = await mcpSession(ctx.snap, run.transcript);
      const problems = [];
      const evidence = [];
      try {
        for (const tool of ["get_logo_rules", "get_motion_guidelines"]) {
          const reply2 = await session.call(tool, {});
          const guestReply = await guest.call(tool, {});
          run.calls += 2;
          const rows = reply2.data?.facts ?? [];
          const expected = [...NAMED_FACT_TOOL_IDS[tool]];
          if (JSON.stringify(rows.map((row) => row.id)) !== JSON.stringify(expected)) problems.push(`${tool}:ids_differ`);
          for (const id of expected) if (!ctx.bank.has(id)) problems.push(`${tool}:not_in_bank:${id}`);
          let served = 0;
          for (const row of rows) {
            if (row.value === null || row.value === void 0) continue;
            served += 1;
            const fact = ctx.facts[row.id];
            if (!fact || fact.status !== "approved" || fact.revision_hash !== row.revision || String(fact.value) !== String(row.value)) problems.push(`${tool}:served_not_approved:${row.id}`);
          }
          const draftLeaks = expected.filter((id) => ctx.drafts[id] && JSON.stringify(reply2).includes(ctx.drafts[id]));
          for (const id of draftLeaks) problems.push(`${tool}:draft_served:${id}`);
          const guestServed = (guestReply.data?.facts ?? []).filter((row) => row.value !== null && row.value !== void 0);
          for (const row of guestServed) if (ctx.facts[row.id]?.classification !== "public") problems.push(`${tool}:guest_served_non_public:${row.id}`);
          evidence.push(`${tool}:${reply2.status ?? "none"}:ids:${rows.length}:served:${served}:drafts_checked:${expected.filter((id) => ctx.drafts[id]).length}`, `${tool}:guest:${guestReply.status ?? "none"}:served:${guestServed.length}`);
        }
      } finally {
        await guest.close();
      }
      return { verdict: problems.length === 0 ? "PASS" : "FAIL", evidence: [...evidence, ...problems.slice(0, 10)] };
    });
    const prod = productionOf(await session.call("production_readiness", { task_type: "visual_design", locale: "fa" }));
    run.calls += 1;
    await run.check("production.honest_block", "FIX-06", () => honestBrief(prod, "rtl"));
    run.production = prod.production_ready === "ready" ? "produced" : "blocked";
    await run.check("no_secrets", "FIX-02", () => noLeak(run.transcript, ctx.secrets));
  } finally {
    await session.close();
  }
  return run.finish();
}
function productionOf(reply) {
  const envelope = reply;
  if (envelope.data && typeof envelope.data === "object") {
    const data = envelope.data;
    return { ...data, authorizes: Array.isArray(envelope.authorizes) && envelope.authorizes.length === 0 ? data.authorizes : ["envelope_not_empty"] };
  }
  return { status: envelope.status ?? "none" };
}
var checkOf = (reply, id) => reply.checks?.find((entry) => entry.check_id === id);
function honestBrief(prod, direction) {
  const renderer = checkOf(prod, "renderer.available");
  const ok = prod.status === "ok" && prod.production_ready === "not_ready" && renderer?.verdict === "fail" && renderer.evidence.includes("deliverable:brief_only") && prod.review?.visual_taste === "needs_human_review" && Array.isArray(prod.authorizes) && prod.authorizes.length === 0 && noPermissions(prod.permissions) && prod.direction === direction;
  return { verdict: ok ? "PASS" : "FAIL", evidence: [`production:${prod.production_ready ?? prod.status ?? "none"}`, `renderer:${renderer?.verdict ?? "none"}`, ...(renderer?.evidence ?? []).slice(0, 2), `visual_taste:${prod.review?.visual_taste ?? "none"}`, `direction:${prod.direction ?? "none"}`] };
}
function noLeak(transcript, secrets) {
  const found = leaks(transcript, secrets);
  return { verdict: found.length === 0 ? "PASS" : "FAIL", evidence: [`replies_scanned:${transcript.length}`, `secrets_checked:${secrets.length}`, `leaked:${found.length}`] };
}
var safeJson = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};
async function tenPosts(ctx, revokedToken, otherBrandToken) {
  const run = new CaseRun("ten_instagram_posts", 1, ["FIX-02", "FIX-04", "FIX-05", "FIX-06"], "content-read");
  const dir = path.join(ctx.out, "ten-instagram-posts");
  fs.mkdirSync(dir);
  const [session, guest, revokedStart, otherStart] = await Promise.all([
    mcpSession(ctx.snap, run.transcript, ctx.tokens.content),
    mcpSession(ctx.snap, run.transcript),
    runScript("scripts/mcp.ts", [], { cwd: ctx.snap, env: childEnv({ [AGENT_TOKEN_ENV]: revokedToken }) }),
    runScript("scripts/mcp.ts", [], { cwd: ctx.snap, env: childEnv({ [AGENT_TOKEN_ENV]: otherBrandToken }) })
  ]);
  try {
    const reply = await session.call("task_context", { request: FA_TEN_POSTS_REQUEST, locale: "fa" });
    run.calls += 1;
    run.pack = packOf(reply);
    const pack = run.pack;
    await run.check("fresh_session.classified", "FIX-02", () => {
      const task = pack?.task;
      const ok = task?.type === "social_batch" && task.deliverable_count === 10 && task.channel === "instagram";
      return { verdict: ok ? "PASS" : "FAIL", evidence: [`status:${String(reply.status)}`, `task_type:${task?.type ?? "none"}`, `count:${task?.deliverable_count ?? "none"}`, `channel:${task?.channel ?? "none"}`, "request_text_in_reply:" + String(JSON.stringify(reply).includes(FA_TEN_POSTS_REQUEST))] };
    });
    await run.check("context.pack", "FIX-02", () => packIntegrity(reply));
    await run.check("context.no_invented_facts", "FIX-02", () => pack ? traceItems(pack, ctx.facts) : { verdict: "FAIL", evidence: ["no_pack"] });
    await run.check("context.gaps_are_existing_questions", "FIX-02", () => gapCheck(pack, ctx.bank));
    const guestReply = await guest.call("task_context", { task_type: "social_batch", deliverable_count: 10, channel: "instagram" });
    run.calls += 1;
    await run.check("mcp.gated", "FIX-02", () => {
      const ok = guestReply.status === "denied" && guestReply.data === null && refused(revokedStart, /was revoked/) && refused(otherStart, /does not match an issued token|belongs to another brand/);
      return { verdict: ok ? "PASS" : "FAIL", evidence: [`guest:${String(guestReply.status)}`, `revoked_token_server_exit:${revokedStart.code}`, `revoked_reason:${refused(revokedStart, /was revoked/)}`, `other_brand_token_server_exit:${otherStart.code}`, `other_brand_reason:${refused(otherStart, /does not match an issued token|belongs to another brand/)}`] };
    });
    const locales = {};
    for (const locale of ["en", "tr"]) {
      const other = packOf(await session.call("task_context", { task_type: "social_batch", deliverable_count: 10, channel: "instagram", locale }));
      run.calls += 1;
      locales[locale] = other ? approvedFingerprint(other) : "none";
    }
    await run.check("copy.locales_unchanged", "FIX-04", () => {
      if (!pack) return { verdict: "FAIL", evidence: ["no_pack"] };
      const fa = approvedFingerprint(pack);
      const ok = locales.en === fa && locales.tr === fa;
      return { verdict: ok ? "PASS" : "FAIL", evidence: [`fa:${short(fa)}`, `en:${short(locales.en)}`, `tr:${short(locales.tr)}`] };
    });
    if (!pack) {
      run.add("posts.ten_files", "FIX-04", "FAIL", ["no_pack"]);
      return run.finish();
    }
    const packFile = path.join(dir, "pack.json");
    fs.writeFileSync(packFile, `${JSON.stringify(reply, null, 2)}
`, { flag: "wx" });
    run.record(packFile, ctx.out);
    const skipLog = (rel) => rel === ACCESS_LOG;
    const brandBefore = treeDigest(path.join(ctx.snap, "brand"), skipLog);
    const postsDir = path.join(dir, "batch");
    const rendered = await runScript("scripts/runtime.ts", ["social-batch", "--pack", packFile, "--root", ctx.snap, "--out", postsDir, "--json"], { cwd: ctx.tmp });
    run.calls += 1;
    const brandAfter = treeDigest(path.join(ctx.snap, "brand"), skipLog);
    const summary = safeJson(rendered.stdout);
    const manifests = readManifests(postsDir);
    const svgs = fs.existsSync(path.join(postsDir, "posts")) ? fs.readdirSync(path.join(postsDir, "posts")).filter((name) => name.endsWith(".svg")).sort() : [];
    for (const name of svgs) run.record(path.join(postsDir, "posts", name), ctx.out);
    for (const name of ["batch-summary.json", "production-readiness.json"]) if (fs.existsSync(path.join(postsDir, name))) run.record(path.join(postsDir, name), ctx.out);
    const drafted = summary?.status === "drafted";
    await run.check("posts.ten_files", "FIX-04", () => {
      if (rendered.code !== 0) return { verdict: "FAIL", evidence: [`exit:${rendered.code}`, `stderr_code:${errorCode(rendered.stderr)}`] };
      if (!drafted) return { verdict: "NOT_TESTED", evidence: [`status:${summary?.status ?? "none"}`, ...(summary?.blockers ?? []).map((blocker) => `blocked:${blocker.code}`)] };
      const shaOk = manifests.every((manifest) => fs.existsSync(path.join(postsDir, manifest.file)) && sha256(fs.readFileSync(path.join(postsDir, manifest.file))) === manifest.sha256);
      const ok = svgs.length === 10 && manifests.length === 10 && shaOk && new Set(manifests.map((manifest) => manifest.sha256)).size === 10;
      return { verdict: ok ? "PASS" : "FAIL", evidence: [`exit:${rendered.code}`, `svg:${svgs.length}`, `manifests:${manifests.length}`, `sha_match:${shaOk}`, `batch:${short(summary?.batch_sha256)}`] };
    });
    await run.check("posts.blocked_without_padding", "FIX-04", () => {
      if (drafted) return { verdict: "PASS", evidence: ["status:drafted", "blockers:0"] };
      return { verdict: svgs.length === 0 ? "PASS" : "FAIL", evidence: [`status:${summary?.status ?? "none"}`, `svg_written:${svgs.length}`] };
    });
    await run.check("posts.pinned_and_cited", "FIX-04", () => {
      if (!drafted) return { verdict: "NOT_TESTED", evidence: ["no posts"] };
      const revisions = new Map(pack.sources.map((source) => [source.id, source.revision]));
      const approvedText = Object.values(pack.sections).flat().filter((item) => item.state === "approved").map((item) => String(item.value));
      const problems = [];
      let rtl = 0;
      for (const manifest of manifests) {
        if (manifest.context.pack_sha256 !== pack.digests.context_sha256) problems.push(`${manifest.post_id}:pack_pin`);
        if (manifest.sources.length === 0) problems.push(`${manifest.post_id}:no_sources`);
        for (const source of manifest.sources) if (!revisions.has(source.source_id) || revisions.get(source.source_id) !== source.source_revision) problems.push(`${manifest.post_id}:source:${source.source_id}`);
        const svg = fs.readFileSync(path.join(postsDir, manifest.file), "utf8");
        const message = unescapeXml(/<desc id="d">([^<]*)<\/desc>/.exec(svg)?.[1] ?? "");
        if (!message || !approvedText.some((value) => value === message || value.includes(message))) problems.push(`${manifest.post_id}:copy_not_approved_text`);
        if (manifest.direction === "rtl") rtl += 1;
      }
      return { verdict: problems.length === 0 ? "PASS" : "FAIL", evidence: [`posts:${manifests.length}`, `pack:${short(pack.digests.context_sha256)}`, `rtl_posts:${rtl}`, ...problems.slice(0, 10)] };
    });
    await run.check("posts.rtl_for_persian_copy", "FIX-04", () => {
      if (!drafted) return { verdict: "NOT_TESTED", evidence: ["no posts"] };
      const persian = manifests.filter((manifest) => ARABIC_SCRIPT.test(unescapeXml(/<desc id="d">([^<]*)<\/desc>/.exec(fs.readFileSync(path.join(postsDir, manifest.file), "utf8"))?.[1] ?? "")));
      if (persian.length === 0) return { verdict: "NOT_TESTED", evidence: ["no Persian copy in this brand"] };
      const wrong = persian.filter((manifest) => manifest.direction !== "rtl").length;
      return { verdict: wrong === 0 ? "PASS" : "FAIL", evidence: [`persian_posts:${persian.length}`, `not_rtl:${wrong}`] };
    });
    await run.check("posts.no_brand_writes", "FIX-04", () => ({ verdict: brandBefore === brandAfter ? "PASS" : "FAIL", evidence: [`brand_tree_unchanged:${brandBefore === brandAfter}`, "excluded:.private/access-log.jsonl"] }));
    await run.check("posts.no_publication", "FIX-04", () => {
      if (!summary) return { verdict: "FAIL", evidence: ["no summary"] };
      const ok = Array.isArray(summary.authorizes) && summary.authorizes.length === 0 && noPermissions(summary.permissions) && manifests.every((manifest) => manifest.authorizes.length === 0 && noPermissions(manifest.permissions) && manifest.renderer.model === null && manifest.renderer.network === false && manifest.state === "draft");
      return { verdict: ok ? "PASS" : "FAIL", evidence: ["authorizes:[]", "permissions:false", "model:none", "network:none", `state:${manifests[0]?.state ?? "none"}`] };
    });
    const gate = await runScript("scripts/runtime.ts", ["readiness", "--pack", packFile, "--root", ctx.snap, "--batch", postsDir, "--json"], { cwd: ctx.tmp });
    run.calls += 1;
    const gated = safeJson(gate.stdout);
    await run.check("quality.gate_ran_on_bytes", "FIX-06", () => {
      if (!drafted) return { verdict: "NOT_TESTED", evidence: ["no posts"] };
      const svgCheck = gated ? checkOf(gated, "artifact.svg_safety") : void 0;
      const ok = !!gated && gated.stage === "artifact" && !!svgCheck && gated.review?.visual_taste === "needs_human_review" && gated.review.semantic === "not_tested" && gate.code === 0 === (gated.production_ready === "ready");
      return { verdict: ok ? "PASS" : "FAIL", evidence: [`exit:${gate.code}`, `stage:${gated?.stage ?? "none"}`, `production:${gated?.production_ready ?? "none"}`, `svg_safety:${svgCheck?.verdict ?? "none"}`, `visual_taste:${gated?.review?.visual_taste ?? "none"}`] };
    });
    await run.check("quality.svg_safe", "FIX-06", () => {
      if (!drafted) return { verdict: "NOT_TESTED", evidence: ["no posts"] };
      const verdict = gated ? checkOf(gated, "artifact.svg_safety")?.verdict : void 0;
      return { verdict: verdict === "pass" ? "PASS" : "FAIL", evidence: [`artifact.svg_safety:${verdict ?? "none"}`] };
    });
    run.production = drafted && rendered.code === 0 ? "produced" : "blocked";
    await run.check("quality.banned_claim_fails", "FIX-06", async () => {
      const banned = bannedPhrase(pack);
      if (!banned) return { verdict: "NOT_TESTED", evidence: ["no approved banned-claim rule in this pack"] };
      const copy = withPhrase(pack, banned);
      if (!copy) return { verdict: "NOT_TESTED", evidence: ["no approved message to carry the phrase"] };
      const file = path.join(ctx.tmp, "banned-pack.json");
      fs.writeFileSync(file, JSON.stringify(copy));
      const result = await runScript("scripts/runtime.ts", ["readiness", "--pack", file, "--json"], { cwd: ctx.tmp });
      run.calls += 1;
      const parsed = safeJson(result.stdout);
      const claims = parsed ? checkOf(parsed, "copy.claims") : void 0;
      return { verdict: result.code === 3 && claims?.verdict === "fail" && claims.blocks ? "PASS" : "FAIL", evidence: [`exit:${result.code}`, `copy.claims:${claims?.verdict ?? "none"}`, `blocks:${String(claims?.blocks)}`] };
    });
    await run.check("stale.tampered_pack_refused", "FIX-05", async () => {
      const tampered = JSON.parse(JSON.stringify(reply));
      const item = Object.values(tampered.data.sections).flat().find((entry) => entry.state === "approved" && typeof entry.value === "string");
      if (!item) return { verdict: "NOT_TESTED", evidence: ["no approved text item"] };
      item.value = `${String(item.value)} (changed)`;
      const file = path.join(ctx.tmp, "tampered-pack.json");
      fs.writeFileSync(file, JSON.stringify(tampered));
      const target = path.join(ctx.tmp, "tampered-out");
      const result = await runScript("scripts/runtime.ts", ["social-batch", "--pack", file, "--out", target], { cwd: ctx.tmp });
      run.calls += 1;
      const written = fs.existsSync(target) ? fs.readdirSync(target).length : 0;
      return { verdict: result.code !== 0 && written === 0 ? "PASS" : "FAIL", evidence: [`exit:${result.code}`, `code:${errorCode(result.stderr)}`, `files_written:${written}`] };
    });
    await run.check("stale.unsafe_output_refused", "FIX-05", async () => {
      const real = path.join(ctx.tmp, "link-target");
      fs.mkdirSync(real);
      const link = path.join(ctx.tmp, "link-out");
      fs.symlinkSync(real, link);
      const busy = path.join(ctx.tmp, "busy-out");
      fs.mkdirSync(busy);
      fs.writeFileSync(path.join(busy, "keep.txt"), "existing file\n");
      const inBrand = path.join(ctx.snap, "brand", "acceptance-out");
      const results = await Promise.all([link, busy, inBrand].map((target) => runScript("scripts/runtime.ts", ["social-batch", "--pack", packFile, "--out", target], { cwd: ctx.tmp })));
      run.calls += results.length;
      const ok = results.every((result) => result.code !== 0) && fs.readdirSync(real).length === 0 && fs.readdirSync(busy).length === 1 && !fs.existsSync(inBrand);
      return { verdict: ok ? "PASS" : "FAIL", evidence: [`symlink_exit:${results[0]?.code}`, `non_empty_exit:${results[1]?.code}`, `inside_brand_exit:${results[2]?.code}`, `symlink_target_files:${fs.readdirSync(real).length}`] };
    });
    await run.check("stale.changed_brand_refused", "FIX-05", async () => {
      const stale = path.join(ctx.tmp, "stale");
      copyWorkspace(ctx.snap, stale);
      const changed = changeCitedFact(stale, pack, ctx.facts);
      if (!changed) return { verdict: "NOT_TESTED", evidence: ["no cited free-text fact could be changed"] };
      const target = path.join(ctx.tmp, "stale-out");
      const [readiness, render] = await Promise.all([
        runScript("scripts/runtime.ts", ["readiness", "--pack", packFile, "--root", stale, "--json"], { cwd: ctx.tmp }),
        runScript("scripts/runtime.ts", ["social-batch", "--pack", packFile, "--root", stale, "--out", target], { cwd: ctx.tmp })
      ]);
      run.calls += 2;
      const parsed = safeJson(readiness.stdout);
      const posts = fs.existsSync(path.join(target, "posts")) ? fs.readdirSync(path.join(target, "posts")).length : 0;
      const drift = parsed ? checkOf(parsed, "context.source_drift") : void 0;
      const ok = parsed?.production_ready === "not_ready" && drift?.verdict === "fail" && drift.blocks && readiness.code === 3 && render.code !== 0 && errorCode(render.stderr) === "stale_pack" && posts === 0;
      return { verdict: ok ? "PASS" : "FAIL", evidence: [`changed:${changed}`, `readiness:${parsed?.production_ready ?? "none"}`, `source_drift:${drift?.verdict ?? "none"}`, `readiness_exit:${readiness.code}`, `render_exit:${render.code}`, `render_code:${errorCode(render.stderr)}`, `posts_written:${posts}`] };
    });
    await run.check("no_secrets", "FIX-02", () => noLeak(run.transcript, ctx.secrets));
  } finally {
    await Promise.all([session.close(), guest.close()]);
  }
  return run.finish();
}
function readManifests(dir) {
  const posts = path.join(dir, "posts");
  if (!fs.existsSync(posts)) return [];
  return fs.readdirSync(posts).filter((name) => name.endsWith(".manifest.json")).sort().map((name) => JSON.parse(fs.readFileSync(path.join(posts, name), "utf8")));
}
var unescapeXml = (text) => text.replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
function refused(started, reason) {
  return started.code !== 0 && started.code !== null && reason.test(started.stderr);
}
function errorCode(stderr) {
  const match = /^([a-z_]+):/m.exec(stderr);
  return match?.[1] ?? "none";
}
function gapCheck(pack, bank) {
  if (!pack) return { verdict: "FAIL", evidence: ["no_pack"] };
  const g = gaps(pack);
  const unknown = g.question_ids.filter((id) => !bank.has(id));
  return { verdict: unknown.length === 0 ? "PASS" : "FAIL", evidence: [`owner_questions:${g.question_ids.length}`, `other_gaps:${g.other}`, `unknown_question_ids:${unknown.length}`, ...unknown.slice(0, 5)] };
}
function bannedPhrase(pack) {
  const rule = Object.values(pack.sections).flat().find((item) => item.key === "banned_claims" && item.state === "approved" && typeof item.value === "string" && item.source_id !== "business.marketing.availability_claim");
  if (!rule) return null;
  const phrase = String(rule.value).split(/[;\n؛،,]/).map((part) => part.trim()).find((part) => part.length >= 3);
  return phrase ?? null;
}
function withPhrase(pack, phrase) {
  const copy = JSON.parse(JSON.stringify(pack));
  let changed = 0;
  for (const item of copy.sections.identity) {
    if (item.state === "approved" && typeof item.value === "string" && item.key !== "brand_name" && item.key !== "sector") {
      item.value = `${item.value} ${phrase}`;
      changed += 1;
    }
  }
  if (changed === 0) return null;
  copy.digests = { context_sha256: packDigest(copy) };
  return copy;
}
function changeCitedFact(root, pack, facts) {
  const engine = new InterviewEngine(root);
  const proof = ensureApprovalSecret(root);
  const cited = Object.values(pack.sections).flat().filter((item) => item.state === "approved" && item.source_id && typeof facts[item.source_id]?.value === "string").map((item) => item.source_id);
  const preferred = ["brand.strategy.purpose", "brand.verbal.tagline", "brand.strategy.promise", "brand.strategy.differentiation"];
  const order = [.../* @__PURE__ */ new Set([...preferred.filter((id) => cited.includes(id)), ...cited])];
  for (const id of order) {
    try {
      const change = engine.requestChange(id, `${String(facts[id].value)} (revised)`);
      if (engine.approveChange(change.id, proof, change.expected_version).kind === "recorded") return id;
    } catch {
      continue;
    }
  }
  return null;
}
async function websiteBrief(ctx) {
  const run = new CaseRun("website_brief", 3, ["FIX-07"], "marketing");
  const session = await mcpSession(ctx.snap, run.transcript, ctx.tokens.marketing);
  try {
    const replies = {};
    for (const locale of ["fa", "en", "tr"]) {
      replies[locale] = await session.call("task_context", { task_type: "website_design", locale });
      run.calls += 1;
    }
    const fa = replies.fa;
    run.pack = packOf(fa);
    const pack = run.pack;
    await run.check("context.pack", "FIX-07", () => packIntegrity(fa));
    await run.check("context.no_invented_facts", "FIX-07", () => pack ? traceItems(pack, ctx.facts) : { verdict: "FAIL", evidence: ["no_pack"] });
    await run.check("brief.gaps_are_existing_questions", "FIX-07", () => {
      const result = gapCheck(pack, ctx.bank);
      const cta = pack ? Object.values(pack.sections).flat().find((item) => item.key === "cta") : void 0;
      return { ...result, evidence: [...result.evidence, `cta:${cta?.state ?? "absent"}`] };
    });
    await run.check("brief.locales_unchanged", "FIX-07", () => {
      const prints = ["fa", "en", "tr"].map((locale) => {
        const p = packOf(replies[locale]);
        return p ? approvedFingerprint(p) : "none";
      });
      const ok = prints[0] !== "none" && prints.every((print) => print === prints[0]);
      return { verdict: ok ? "PASS" : "FAIL", evidence: prints.map((print, index) => `${["fa", "en", "tr"][index]}:${short(print)}`) };
    });
    const prod = productionOf(await session.call("production_readiness", { task_type: "website_design", locale: "fa" }));
    run.calls += 1;
    await run.check("brief.no_deployment_claim", "FIX-07", () => honestBrief(prod, "rtl"));
    run.production = prod.production_ready === "ready" ? "produced" : "brief_only";
    run.add("brief.sitemap_sections_copy", "FIX-07", "NOT_TESTED", ["no brief renderer in this repository", "the pack is the cited input; the drafted brief needs human review"]);
    await run.check("no_secrets", "FIX-02", () => noLeak(run.transcript, ctx.secrets));
  } finally {
    await session.close();
  }
  return run.finish();
}
async function paidBrief(ctx) {
  const run = new CaseRun("paid_ad_brief", 4, ["FIX-08"], "strategy-ads-read");
  const [ads, design] = await Promise.all([mcpSession(ctx.snap, run.transcript, ctx.tokens.ads), mcpSession(ctx.snap, run.transcript, ctx.tokens.design)]);
  try {
    const reply = await ads.call("task_context", { task_type: "paid_campaign_brief", locale: "en" });
    const wrong = await design.call("task_context", { task_type: "paid_campaign_brief", locale: "en" });
    run.calls += 2;
    run.pack = packOf(reply);
    const pack = run.pack;
    const designPack = packOf(wrong);
    await run.check("context.pack", "FIX-08", () => packIntegrity(reply));
    await run.check("context.no_invented_facts", "FIX-08", () => pack ? traceItems(pack, ctx.facts) : { verdict: "FAIL", evidence: ["no_pack"] });
    const paid = (p) => p ? Object.values(p.sections).flat().find((item) => item.key === "strategy.paid_media") : void 0;
    const paidMissing = (p) => p?.missing.find((entry) => entry.id === "strategy.paid_media");
    await run.check("paid.profile_isolation", "FIX-08", () => {
      const designItem = paid(designPack);
      const ok = designItem?.state === "withheld" && paidMissing(designPack)?.reason === "not_authorized" && paidMissing(pack)?.reason !== "not_authorized";
      return { verdict: ok ? "PASS" : "FAIL", evidence: [`design:${designItem?.state ?? "absent"}:${paidMissing(designPack)?.reason ?? "none"}`, `ads:${paid(pack)?.state ?? "absent"}:${paidMissing(pack)?.reason ?? "served"}`] };
    });
    await run.check("paid.strategy_served", "FIX-08", () => {
      const item = paid(pack);
      if (item?.state === "approved") return { verdict: "PASS", evidence: [`strategy:${item.source_id}`, `revision:${short(item.source_revision)}`] };
      return { verdict: "NOT_TESTED", evidence: [`ads:${item?.state ?? "absent"}:${paidMissing(pack)?.reason ?? "none"}`, "no approved, current paid_media strategy"] };
    });
    const prod = productionOf(await ads.call("production_readiness", { task_type: "paid_campaign_brief", locale: "tr" }));
    run.calls += 1;
    await run.check("paid.no_spend_or_publish", "FIX-08", () => {
      const brief = honestBrief(prod, "ltr");
      const packsOk = [pack, designPack].every((p) => !!p && p.authorizes.length === 0 && noPermissions(p.permissions));
      return { verdict: brief.verdict === "PASS" && packsOk ? "PASS" : "FAIL", evidence: [...brief.evidence, `packs_authorize_nothing:${packsOk}`] };
    });
    run.production = prod.production_ready === "ready" ? "produced" : "brief_only";
    await run.check("paid.no_budget_leak", "FIX-08", () => {
      const served = [pack, designPack].some((p) => p && Object.values(p.sections).flat().some((item) => item.source_id === "business.marketing.budget" && item.state === "approved"));
      const found = leaks(run.transcript, ctx.restricted);
      if (ctx.restricted.length === 0) return { verdict: served ? "FAIL" : "NOT_TESTED", evidence: ["restricted_values_recorded:0", `budget_fact_served:${served}`, "nothing restricted to leak in this brand"] };
      return { verdict: !served && found.length === 0 ? "PASS" : "FAIL", evidence: [`restricted_values_checked:${ctx.restricted.length}`, `leaked:${found.length}`, `budget_fact_served:${served}`, `redacted:${(pack?.redacted ?? []).filter((entry) => entry.includes("restricted")).length}`] };
    });
    await run.check("no_secrets", "FIX-02", () => noLeak(run.transcript, ctx.secrets));
  } finally {
    await Promise.all([ads.close(), design.close()]);
  }
  return run.finish();
}

// scripts/acceptance/report.ts
var ACCEPTANCE_LOCALES = ["en", "fa", "tr"];
var RLM = "\u200F";
var TEXT = {
  en: {
    title: "Acceptance report",
    origin: { synthetic: "synthetic fixture", owner_brand: "owner brand (temporary snapshot)" },
    verdict: { PASS: "PASS", FAIL: "FAIL", NOT_TESTED: "NOT_TESTED" },
    production: { produced: "drafts produced", brief_only: "brief only", blocked: "blocked", not_tested: "not tested" },
    cases: { single_visual: "1 single visual", ten_instagram_posts: "2 ten Instagram posts", website_brief: "3 website brief", paid_ad_brief: "4 paid-ad brief" },
    root: (unchanged) => `Checkout brand/ unchanged: ${unchanged === null ? "unknown" : unchanged ? "yes" : "NO"}`,
    questions: "owner questions",
    calls: "tool calls",
    artifacts: "files",
    notCovered: "Not covered by this harness",
    authorizes: "This report authorizes nothing: no publication, schedule, spend or deployment."
  },
  fa: {
    title: "\u06AF\u0632\u0627\u0631\u0634 \u067E\u0630\u06CC\u0631\u0634",
    origin: { synthetic: "\u0628\u0631\u0646\u062F \u0633\u0627\u062E\u062A\u06AF\u06CC \u0622\u0632\u0645\u0627\u06CC\u0634\u06CC", owner_brand: "\u0628\u0631\u0646\u062F \u0645\u0627\u0644\u06A9 (\u06A9\u067E\u06CC \u0645\u0648\u0642\u062A)" },
    verdict: { PASS: "\u0642\u0628\u0648\u0644 (PASS)", FAIL: "\u0631\u062F (FAIL)", NOT_TESTED: "\u0622\u0632\u0645\u0648\u062F\u0647 \u0646\u0634\u062F (NOT_TESTED)" },
    production: { produced: "\u067E\u06CC\u0634\u200C\u0646\u0648\u06CC\u0633 \u0633\u0627\u062E\u062A\u0647 \u0634\u062F", brief_only: "\u0641\u0642\u0637 brief", blocked: "\u0645\u0633\u062F\u0648\u062F", not_tested: "\u0622\u0632\u0645\u0648\u062F\u0647 \u0646\u0634\u062F" },
    cases: { single_visual: "\u06F1 \u06CC\u06A9 \u062A\u0635\u0648\u06CC\u0631", ten_instagram_posts: "\u06F2 \u062F\u0647 \u067E\u0633\u062A \u0627\u06CC\u0646\u0633\u062A\u0627\u06AF\u0631\u0627\u0645", website_brief: "\u06F3 brief \u0648\u0628\u200C\u0633\u0627\u06CC\u062A", paid_ad_brief: "\u06F4 brief \u062A\u0628\u0644\u06CC\u063A \u067E\u0648\u0644\u06CC" },
    root: (unchanged) => `\u067E\u0648\u0634\u0647\u0654 brand/ \u062F\u0633\u062A \u0646\u062E\u0648\u0631\u062F: ${unchanged === null ? "\u0646\u0627\u0645\u0639\u0644\u0648\u0645" : unchanged ? "\u0628\u0644\u0647" : "\u062E\u06CC\u0631"}`,
    questions: "\u067E\u0631\u0633\u0634 \u0627\u0632 \u0645\u0627\u0644\u06A9",
    calls: "\u0641\u0631\u0627\u062E\u0648\u0627\u0646\u06CC \u0627\u0628\u0632\u0627\u0631",
    artifacts: "\u0641\u0627\u06CC\u0644",
    notCovered: "\u0622\u0646\u0686\u0647 \u0627\u06CC\u0646 \u0627\u0628\u0632\u0627\u0631 \u0646\u0645\u06CC\u200C\u0622\u0632\u0645\u0627\u06CC\u062F",
    authorizes: "\u0627\u06CC\u0646 \u06AF\u0632\u0627\u0631\u0634 \u0647\u06CC\u0686 \u0645\u062C\u0648\u0632\u06CC \u0646\u0645\u06CC\u200C\u062F\u0647\u062F: \u0646\u0647 \u0627\u0646\u062A\u0634\u0627\u0631\u060C \u0646\u0647 \u0632\u0645\u0627\u0646\u200C\u0628\u0646\u062F\u06CC\u060C \u0646\u0647 \u0647\u0632\u06CC\u0646\u0647\u060C \u0646\u0647 \u0627\u0633\u062A\u0642\u0631\u0627\u0631."
  },
  tr: {
    title: "Kabul raporu",
    origin: { synthetic: "sentetik test markas\u0131", owner_brand: "sahibin markas\u0131 (ge\xE7ici kopya)" },
    verdict: { PASS: "GE\xC7T\u0130 (PASS)", FAIL: "KALDI (FAIL)", NOT_TESTED: "TEST ED\u0130LMED\u0130 (NOT_TESTED)" },
    production: { produced: "taslaklar \xFCretildi", brief_only: "yaln\u0131zca brief", blocked: "engellendi", not_tested: "test edilmedi" },
    cases: { single_visual: "1 tek g\xF6rsel", ten_instagram_posts: "2 on Instagram g\xF6nderisi", website_brief: "3 web sitesi brief", paid_ad_brief: "4 \xFCcretli reklam brief" },
    root: (unchanged) => `brand/ klas\xF6r\xFC de\u011Fi\u015Fmedi: ${unchanged === null ? "bilinmiyor" : unchanged ? "evet" : "HAYIR"}`,
    questions: "sahip sorular\u0131",
    calls: "ara\xE7 \xE7a\u011Fr\u0131s\u0131",
    artifacts: "dosya",
    notCovered: "Bu arac\u0131n test etmedikleri",
    authorizes: "Bu rapor hi\xE7bir \u015Feye yetki vermez: yay\u0131n, zamanlama, harcama veya da\u011F\u0131t\u0131m yok."
  }
};
function renderReport(report, locale = "en") {
  const t = TEXT[locale];
  const mark = locale === "fa" ? RLM : "";
  const lines = [];
  lines.push(`${mark}${t.title} \u2014 ${report.brand_id} \u2014 ${t.origin[report.origin]} \u2014 ${t.verdict[report.verdict]}`);
  lines.push(`${mark}PASS ${report.totals.PASS} \xB7 FAIL ${report.totals.FAIL} \xB7 NOT_TESTED ${report.totals.NOT_TESTED}`);
  lines.push(`${mark}${t.root(report.workspace.root_unchanged)}`);
  for (const record of report.cases) {
    lines.push("");
    lines.push(`${mark}${t.cases[record.case_id]} [${record.fixes.join(", ")}] \u2014 ${t.verdict[record.verdict]} \u2014 ${t.production[record.production]}`);
    lines.push(`${mark}  ${record.profile} \xB7 ${t.calls}: ${record.metrics.tool_calls} \xB7 ${t.questions}: ${record.metrics.owner_questions} \xB7 ${t.artifacts}: ${record.metrics.artifacts}`);
    for (const check of record.checks) lines.push(`${mark}  [${check.verdict}] ${check.id} (${check.fixes}) ${check.evidence.join(" ")}`);
  }
  lines.push("");
  lines.push(`${mark}${t.notCovered}:`);
  for (const item of report.not_covered) lines.push(`${mark}  - ${item.split(":")[0]}`);
  lines.push(`${mark}${t.authorizes}`);
  return lines.join("\n");
}

// scripts/acceptance.ts
var HELP = `brand:acceptance (--demo | --root <brand checkout>) --out <empty dir> [--lang en|fa|tr] [--json]

  --demo        Synthetic fixture brand (a temporary directory, removed afterwards).
  --root <dir>  An owner's brand checkout. Read only: the harness works on a temporary
                copy of brand/; a run that changed the checkout fails.
  --out <dir>   New or empty directory outside any brand/ folder. Receives the drafted
                posts and acceptance-report.json (ids, counts, codes and checksums only).
  --lang        Language of the printed summary (default en). The JSON is language-neutral.

Every case is PASS, FAIL or NOT_TESTED with evidence; nothing untested is reported as a pass.
Exit 0 when nothing failed, 4 when a case failed or the checkout changed, 2 on a usage
error, 1 when the run could not start or stopped.
The harness calls no model and no network, and publishes, schedules, spends and deploys nothing.`;
function usage(message) {
  console.error(`${message}

${HELP}`);
  process.exit(2);
}
async function main() {
  let parsed;
  try {
    parsed = parseArgs({
      args: process.argv.slice(2),
      options: { demo: { type: "boolean" }, root: { type: "string" }, out: { type: "string" }, lang: { type: "string" }, json: { type: "boolean" }, help: { type: "boolean" } }
    });
  } catch (error) {
    usage(error instanceof Error ? error.message : String(error));
  }
  const { values } = parsed;
  if (values.help) {
    console.log(HELP);
    return;
  }
  if (!!values.demo === !!values.root) usage("Give exactly one of --demo or --root.");
  if (!values.out) usage("--out is required.");
  const locale = values.lang ?? "en";
  if (!ACCEPTANCE_LOCALES.includes(locale)) usage("--lang is en, fa or tr.");
  const progress = values.json ? () => {
  } : (line) => console.error(line);
  const fixture = values.demo ? createAcceptanceFixture() : null;
  let report;
  try {
    report = await runAcceptance({ root: fixture?.root ?? values.root, out: values.out, origin: fixture ? "synthetic" : "owner_brand", canaries: fixture?.canaries, progress });
  } finally {
    fixture?.cleanup();
  }
  const file = path2.join(path2.resolve(values.out), "acceptance-report.json");
  fs2.writeFileSync(file, `${JSON.stringify(report, null, 2)}
`, { flag: "wx" });
  console.log(values.json ? JSON.stringify(report, null, 2) : renderReport(report, locale));
  process.exitCode = report.verdict === "FAIL" ? 4 : 0;
}
main().catch((error) => {
  console.error(`acceptance_failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
