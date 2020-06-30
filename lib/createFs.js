const inquirer = require('inquirer')

module.exports = async (appName, opts) => {
  console.log(appName, opts)
  const question = [
    // choose mode to use page | component
    {
      type: 'input',
      name: 'name',
      message: () => `Project name (${appName})`,
    },
    {
      type: 'list',
      name: 'mode',
      message: 'choose which mode to use',
      choices: [
        'page',
        'component'
      ]
    },
  ]

  return await inquirer.prompt(question)
}
