
const path = require('path')
const fs = require('fs')
const promisify = require('util').promisify

const packages = async (onlyPublic = false, dir = path.resolve(__dirname, '../../packages'))  => {
    const dirents = await promisify(fs.readdir)(dir, { withFileTypes: true })
    const packages = []
    for (const dirent of dirents) {
        if (!dirent.isDirectory()) {
            continue
        }
        try {
            const packageJsonPath = path.resolve(dir, dirent.name, 'package.json')
            const packageJson = await readJson(packageJsonPath)
            const { name, private } = packageJson
            if (!onlyPublic || !private) {
                packages.push({
                    name,
                    path: path.resolve(dir, dirent.name),
                    packageJson,
                    update: async function () {
                        await writeJson(packageJsonPath, this.packageJson)
                    }
                })
            }
        } catch(e) {
            console.log(e)
            continue
        }
    }
    return packages
}

const workspace = () => {
    return readJson(path.resolve(__dirname, '../../package.json'))
}

const updateWorkspace = (json) => {
    return writeJson(path.resolve(__dirname, '../../package.json'), json)
}

const readJson = async (name) => {
    const file = (await promisify(fs.readFile)(name)).toString()
    return JSON.parse(file)
}

const writeJson = async (name, json) => {
    const data = JSON.stringify(json, null, 2)
    await promisify(fs.writeFile)(name, data)
}

module.exports = {
    packages,
    workspace,
    updateWorkspace,
}
