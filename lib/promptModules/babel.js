module.exports = cli => {
  cli.injectFeature({
    name: 'Babel',
    value: 'babel',
    short: 'babel',
    description: 'Transpile modern JavaScript to older versions (for compatibility)',
    link: 'https://babeljs.io/',
    check: true
  })

  cli.onPromptComplete((answers, options) => {
    if (answers.feature.includes('ts')) {
      if (!answers.useTsWithBabel) {
        return
      }
    } else if (!answers.feature.includes('babel')) {
      return
    }
    options.plugins['@neliel/cli-plugin-babel'] = {}
  })
}
