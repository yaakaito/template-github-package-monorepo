#!/usr/bin/env node

const { program } = require('commander')
const { workspace, packages } = require('./lib/util')
const { exec } = require('child_process')
const { promisify } = require('util')

const main = async() => {
    program.parse(process.argv)
    const log = console.log
    try {
        const { version } = await workspace()
        const pkgs = await packages(true)

        for (const pkg of pkgs) {
            const { stdout, stderr } = await promisify(exec)(`cd ${pkg.path} && yarn publish --new-version ${version}`)
            if (stderr) {
                log(stderr)
                process.exit(2)
            }
            log(stdout)
        }
    }
    catch(e) {
        log(e)
        process.exit(2)
    }
}

if (require.main === module) {
    main()
}
