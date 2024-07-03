import * as fs from "fs"
import process from "process"
import { compileFunc } from "@ton-community/func-js"
import { Cell } from "ton-core"

async function compileScript() {
    const compileRusult = await compileFunc({
        targets: ["./contracts/main.fc"],
        sources: (x) => fs.readFileSync(x).toString("utf8")
    })

    if (compileRusult.status === "error") {
        console.warn(`\n${compileRusult.message}`)
        process.exit(1)
    }

    console.log("successeful")

    const hexArtifact = "build/main.compiled.json"

    fs.writeFileSync(
        hexArtifact,
        JSON.stringify({
            hex: Cell.fromBoc(Buffer.from(compileRusult.codeBoc, "base64"))[0]
                .toBoc()
                .toString("hex")
        })
    )
}

compileScript()