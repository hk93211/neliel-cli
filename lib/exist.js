const inquirer = require('inquirer')
const chalk = require('chalk')

module.exports = async (name, options) => {
  const question = [
    {
      name: 'action',
      type: 'list',
      message: `目标文件夹 ${chalk.cyan(name)} 已经存在, 请选择: `,
      choices: [
        { name: '覆盖', value: 'overwrite' },
        { name: '取消', value: false }
      ]
    }
  ]

  return await inquirer.prompt(question)
}
