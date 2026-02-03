const fs = require("fs");
const path = require("path");
const archiver = require("archiver");

function resolveVersion(explicitVersion) {
  if (explicitVersion) return explicitVersion;

  try {
    const packageJsonPath = path.join(__dirname, "..", "package.json");
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    return pkg.version || "dev";
  } catch (err) {
    console.error("Failed to read package.json for version:", err);
    return "dev";
  }
}

function zipDirectory(sourceDir, sourceFile, targetDir, version) {
  const archive = archiver("zip", { zlib: { level: 9 } });
  const stream = fs.createWriteStream(
    path.join(targetDir, `diagrammaton-${version}.zip`)
  );

  return new Promise((resolve, reject) => {
    archive
      .directory(sourceDir, path.basename(sourceDir))
      .file(sourceFile, { name: "manifest.json" })
      .on("error", (err) => reject(err))
      .pipe(stream);

    stream.on("close", () => resolve());
    archive.finalize();
  });
}

const sourceDir = process.argv[2];
const sourceFile = process.argv[3];
const targetDir = process.argv[4];
const version = resolveVersion(process.argv[5]);

zipDirectory(sourceDir, sourceFile, targetDir, version)
  .then(() => console.log("Directory successfully zipped!"))
  .catch(console.error);
