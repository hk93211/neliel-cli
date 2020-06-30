const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer')
const validateNpmPackageName = require('validate-npm-package-name')

async function create (projectName, options) {
  if (options.proxy) {
    process.env.HTTP_PROXY = options.proxy
  }

  const cwd = options.cwd || process.cwd()
  const inCurrent = projectName === '.'
  const name = inCurrent ? path.relative('../', cwd) : projectName
  const targetDir = path.resolve(cwd, projectName || '.')

  // check projectName if it's a valid npm package name.
  const result = validateNpmPackageName(name)
  if (!result.validForNewPackages) {
    console.error(chalk.red(`Invalid project name: ${name}`))
    result.errors && result.errors.forEach(err => {
      console.error(chalk.red(`Error: ${err}`))
    })
    result.warnings && result.warnings.forEach(warn => {
      console.error(chalk.red.dim(`Warning: ${warn}`))
    })
    exit(1)
  }

  //
  if (fs.existsSync(targetDir) && !options.merge) {
    if (options.force) {
      await fs.remove(targetDir)
    } else {
      // await clearConsole()
      if (inCurrent) {
        const { ok } = await inquirer.prompt([
          {
            name: 'ok',
            type: 'confirm',
            message: `Generate project in current directory?`
          }
        ])
        if (!ok) {
          return
        }
      } else {
        const { action } = await inquirer.prompt([
          {
            name: 'action',
            type: 'list',
            message: `Target directory ${chalk.cyan(targetDir)} already exists. Pick an action:`,
            choises: [
              { name: 'Overwrite', value: 'overwrite' },
              { name: 'Merge', value: 'merge'},
              { name: 'Cancel', value: false },
            ]
          }
        ])
        if (!action) {
          return
        } else if (action === 'overwrite') {
          console.log(`\nRemoving ${chalk.cyan(targetDir)}...`)
          await fs.remove(targetDir)
        }
      }
    }
  }

  const creator = new Creator(name, targetDir, getPromptModules())
  await creator.create(options)
}

module.exports = create
