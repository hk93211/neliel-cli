#!/usr/bin/env node

// Check node version before requiring/doing anything else
// The user may be on a very old node version

const chalk = require('chalk')
const semver = require('semver')

const requiredNodeVersion = require('../package.json').engines.node
const { createFs, exist } = require('../lib')

function checkNodeVersion (wanted, id) {
  if (!semver.satisfies(process.version, wanted, { includePrerelease: true })) {
    console.log(chalk.red(
      'You are using Node ' + process.version + ', but this version of ' + id +
      ' requires Node ' + wanted + '.\nPlease upgrade your Node version.'
    ))
    process.exit(1)
  }
}

checkNodeVersion(requiredNodeVersion, '@neliel/cli')

if (semver.satisfies(process.version, '9.x')) {
  console.log(chalk.red(
    `You are using Node ${process.version}.\n` +
    `Node.js 9.x has already reached end-of-life and will not be supported in future major releases.\n` +
    `It's strongly recommended to use an active LTS version instead.`
  ))
}

const fs = require('fs')
const path = require('path')
const program = require('commander')
const minimist = require('minimist')
/**
 * minimist 将 process.argv 装换成对象的形式
 *
 * 例:
 * neliel create app -p presetName -d
 * minimist(process.argv.slice(3)) => { _: [ 'app' ], p: 'presetName', d: true }
 */

// version
program
  .version(require('../package.json'), '-V, --version');

// create
program
  .command('create <name>')
  .description('create a new project powered by neliel-cli')
  .option('-p --preset <presetName>', 'Skip prompt and use saved or remote preset')
  .option('-d --default', 'Skip prompts and use default preset')
  .action((name, cmd) => {
    const options = cleanArgs(cmd)
    console.log(process.argv)
    console.log(minimist(process.argv.slice(3)))

    if (minimist(process.argv.slice(3))._.length > 1) {
      console.log(chalk.yellow(
        '\n Info: You provided more than one argument. The first one will be used as the app\'s name, the rest are ignored.'
      ))
    }

    if (process.argv.includes('-g') || process.argv.includes('--git')) {
      options.forceGit = true
    }

    require('../lib/create')(name, options)
  })

// clone
program
  .command('clone <source> [destination]')
  .description('clone a repository into a newly created directory')
  .action((source, destination, opts) => {
    console.log(source, destination, opts);
    console.log('clone command called');
  });

// test
program
  .command('test <appName> [options]')
  .description('create a project with the name <appName>')
  .option('-d, --default', 'Use default setting')
  .action(async (appName, options) => {
    console.log('program action')
    if (fs.existsSync(appName)) { // 存在同名文件夹时, 先提示用户是否需要覆盖
      const { action } = await exist(appName, options)
      if (action === 'overwrite') {
        await fs.rmdirSync('sss')
      }
    }

    createFs(appName, options).then(res => {
      console.log(111, res)
    })
  });

program.parse(process.argv)

function camelize (str) {
  return str.replace(/-(\w)/g, (_, c) => c ? c.toUpperCase() : '')
}

function cleanArgs (cmd) {
  const args = {}
  cmd.options.forEach(o => {
    const key = camelize(o.long.replace(/^--/, ''))
    // if an option is not present and Command has a method with the same name
    // it should not be copied
    if (typeof cmd[key] !== 'function' && typeof cmd[key] !== 'undefined') {
      args[key] = cmd[key]
    }
  })
  return args
}
