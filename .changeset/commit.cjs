// eslint-disable-next-line @typescript-eslint/no-require-imports
const outdent = require("outdent")

/**
 * @type {NonNullable<import('@changesets/types').CommitFunctions["getAddMessage"]>}
 */
const getAddMessage = async (changeset, options) => {
  const skipCI = options?.skipCI === "add" || options?.skipCI === true
  return outdent`${changeset.summary}${skipCI ? `\n\n[skip ci]\n` : ""}`
}

/**
 * @type {NonNullable<import('@changesets/types').CommitFunctions["getVersionMessage"]>}
 */
/*const getVersionMessage = async (releasePlan, options) => {
  const skipCI = options?.skipCI === "version" || options?.skipCI === true
  const publishableReleases = releasePlan.releases.filter((release) => release.type !== "none")
  const numPackagesReleased = publishableReleases.length

  const releasesLines = publishableReleases.map((release) => `  ${release.name}@${release.newVersion}`).join("\n")

  return outdent`
    RELEASING: Releasing ${numPackagesReleased} package(s)

    Releases:
    ${releasesLines}
    ${skipCI ? `\n[skip ci]\n` : ""}
`
}*/

exports.default = {
  getAddMessage,
  //getVersionMessage,
}
