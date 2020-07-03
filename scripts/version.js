#!/usr/bin/env node

const { program } = require('commander')
const semver = require('semver')
const { workspace, packages, updateWorkspace } = require('./lib/util')

const main = async() => {
    program.parse(process.argv)
    const log = console.log
    try {
        const ws = await workspace()
        const version = semver.inc(ws.version, program.args[0])
        if (!version) {
            throw 'Invalid version'
        }
        const pkgs = await packages()
        for (const pkg of pkgs) {
            pkg.packageJson.version = version
            const { dependencies, peerDependencies } = pkg.packageJson
            for (const { name } of pkgs) {
                if (dependencies && dependencies[name]) {
                    dependencies[name] = version
                }
                if (peerDependencies && peerDependencies[name]) {
                    peerDependencies[name] = version
                }
            }
            await pkg.update()
        }
        await updateWorkspace({
            ...ws,
            version
        })
    }
    catch(e) {
        log(e)
        process.exit(2)
    }
}

if (require.main === module) {
    main()
}
