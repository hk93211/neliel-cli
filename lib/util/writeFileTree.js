const fs = require('fs-extra')
const path = require('path')

function deleteReomveedFiles (directory, newFiles, previousFiles) {
  // get all files that are not in the new filesystem and are still existing
  const filesToDelete = Object.keys(previousFiles)
    .filter(filename => !newFiles[filename])

  // delete each of these files
  return Promise.all(filesToDelete.map(filename => {
    return fs.unlink(path.join(directory, filename))
  }))
}

module.exports = async function writeFileTree (dir, files, previousFiles) {
  if (process.env.NELIEL_CLI_SKIP_WRITE) {
    return
  }

  if (previousFiles) {
    await deleteReomveedFiles(dir, files, previousFiles)
  }

  Object.keys(files).forEach(name => {
    const filePath = path.join(dir, name)
    fs.ensureDirSync(path.join(dir, name))
    console.log(filePath, name, files[name])
    fs.writeFileSync(filePath, files[name])
  })
}
