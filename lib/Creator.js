const chalk = require('chalk')
const inquirer = require('inquirer')
const EventEmitter = require('events')
const { execSync } = require('child_process')
const writeFileTree = require('./util/writeFileTree')
const { resolvePkg } = require('./util/resolvePkg')
const { log } = require('./util/logger')

const hasTool = tool => () => {
  try {
    execSync(`${tool} --version`, { stdio: 'ignore' })
    return true
  } catch (e) {
    return false
  }
}

const hasYarn = hasTool('yarn')
const hasGit = hasTool('git')

const hasProjectGit = cwd => {
  try {
    execSync('git status', { stdio: 'ignore', cwd })
    return true
  } catch (e) {
    return false
  }
}

const defaultPreset = {
  useConfigFiles: false,
  cssPreprocessor: undefined,
  plugins: {
    // '@vue/cli-plugin-babell': {},
    // '@vue/cli-plugin-eslint': {
    //   config: 'base',
    //   lintOn: ['save']
    // }
  }
}

const defaults = {
  lastChecked: undefined,
  latestVersion: undefined,

  packageManager: undefined,
  useTaobaoRegistry: undefined,
  presets: {
    'default': defaultPreset
  }
}

module.exports = class Creator extends EventEmitter {
  constructor(name, context) {
    super()

    this.name = name
    this.context = context

    this.run = this.run.bind(this)
  }

  async create (cliOptions = {}, preset = null) {
    const { run, name, context } = this

    if (!preset) {
      if (cliOptions.preset) {
        // neliel create app --preset setting
        preset = await this.resolvePreset(cliOptions.preset, cliOptions.clone)
      } else if (cliOptions.default) {
        // neliel create app --default
        preset = defaults.presets.default
      } else if (cliOptions.inlinePreset) {
        // neliel create foo --inlinePreset {...}
        try {
          preset = JSON.parse(cliOptions.inlinePreset)
        } catch (e) {
          error(`CLI inline preset is not valid JSON: ${cliOptions.inlinePreset}`)
          exit(1)
        }
      }
    } else {
      preset = await this.promptAndResolvePreset()
    }

    log()
    log(chalk.blue.bold(`Neliel CLI v${require('../package.json').version}`))
    log(`✨ 正在创建项目 ${chalk.yellow(context)}.`)
    this.emit('creation', { event: 'creating' })

    const { pkgVers, pkgDes } = await inquirer.prompt([
      {
        name: 'pkgVers',
        message: `请输入项目版本号`,
        default: '0.1.0',
      },
      {
        name: 'pkgDes',
        message: `请输入项目简介`,
        default: 'project created by neliel-cli',
      }
    ])

    // generate package.json with plugin dependencies
    const pkg = {
      name,
      version: '0.1.0',
      private: true,
      devDependencies: {},
      ...resolvePkg(context)
    }

    // Object.keys(preset.plugins).forEach(dep => {
    //   if (preset.plugins[dep]._isPreset) {
    //     return
    //   }

    //   pkg.devDependencies[dep] = (
    //     preset.plugins[dep].version ||
    //     ((/^@vue/.test(dep)) ? `~${latestMinor}` : `latest`)
    //   )
    // })

    log(`📄 生成 ${chalk.yellow('package.json')} 等模板文件`)
    // write package.json
    await writeFileTree(context, {
      'package.json': JSON.stringify(pkg, null, 2)
    })

    const shouldInitGit = this.shouldInitGit(cliOptions)
    if (shouldInitGit) {

    }

    const packageManager = hasYarn() ? 'yarn' : null
    await writeFileTree(context, {
      'README.md': generateReadme(pkg, packageManager)
    })
  }

  run () {}

  async promptAndResolvePreset (answers = null) {
    if (!answers) {
      answers = await inquirer.prompt(this.resolveFinalPrompts())
    }
  }

  async resolveFinalPrompts () {
    const prompts = []
    return prompts
  }

  async resolvePreset () {}

  async shouldInitGit (cliOptions) {
    if (!hasGit()) {
      return false
    }

    // --git
    if (cliOptions.forceGit) {
      return true
    }

    // --no-git
    if (cliOptions.git === false || cliOptions.git === 'false') {
      return false
    }

    // default: true unless already in git repo
    return !hasProjectGit(this.context)
  }
}
