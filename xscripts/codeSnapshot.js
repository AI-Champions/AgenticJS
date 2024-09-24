import fs from "fs";
import path from "path";
import util from "util";

const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const stat = util.promisify(fs.stat);

const INSTRUCTIONS_PROMPT = `This markdown document provides a comprehensive snapshot of the entire codebase for the KaibanJS library. It is designed to facilitate easy understanding and navigation of the library's structure and contents for both developers and automated systems.

**Directory Structure**

The 'Directory Structure' section visually represents the hierarchical arrangement of all files and directories within the KaibanJS project. This tree-like structure helps in quickly locating files and understanding the organizational layout of the project.

**File Contents**

Following the directory structure, the 'File Contents' section includes detailed listings of each JavaScript file within the KaibanJS library. Each file entry is prefixed with its relative path from the base directory, ensuring clear context and easy access. The content of each file is enclosed in code blocks, formatted for JavaScript, providing exact details of the code written in the library`;

const baseDirectory = "./src"; // Adjust the base directory as needed
const outputFilePath = "./output.md";

// Function to recursively get all file paths
async function getFiles(dir) {
  const subdirs = await readdir(dir);
  const files = await Promise.all(
    subdirs.map(async (subdir) => {
      const res = path.resolve(dir, subdir);
      return (await stat(res)).isDirectory() ? getFiles(res) : res;
    })
  );
  return files.reduce((a, f) => a.concat(f), []);
}

// Function to generate directory tree structure
async function generateDirStructure(dir, prefix = "") {
  const dirContents = await readdir(dir, { withFileTypes: true });
  let structure = "";
  for (const dirent of dirContents) {
    const filePath = path.resolve(dir, dirent.name);
    if (dirent.isDirectory()) {
      structure += `${prefix}└── ${dirent.name}\n`;
      structure += await generateDirStructure(filePath, `${prefix}    `);
    } else if (!dirent.name.startsWith("_DONTUSE")) {
      structure += `${prefix}└── ${dirent.name}\n`;
    }
  }
  return structure;
}

// Function to create the markdown document
async function createMarkdownFile(files, dirStructure) {
  let markdownContent = `# Code Snapshot for KaibanJS\n\n`;
  markdownContent += `${INSTRUCTIONS_PROMPT} \n\n`;
  markdownContent += `## Directory Structure\n\n\`\`\`\n${dirStructure}\`\`\`\n\n`;
  markdownContent += `## File Contents\n\n`;
  for (const file of files) {
    const fileName = path.basename(file);
    if (path.extname(file) === ".js" && !fileName.startsWith("_DONTUSE")) {
      let relativePath = path.relative(baseDirectory, file);
      relativePath = path.normalize(relativePath).replace(/\\/g, "/"); // Normalize and replace backslashes
      relativePath = `./src/${relativePath}`; // Prepend with ./src/

      // // Normalize the path here before printing
      // let relativePath = path.relative(path.resolve(__dirname, baseDirectory), file);
      // // relativePath = `./${relativePath}`; // Ensures path starts with ./
      // relativePath = `./src/${relativePath}`; // Ensures path starts with ./src/
      // relativePath = relativePath.replace(/\\/g, '/'); // Normalize Windows paths

      const content = await readFile(file, "utf8");
      markdownContent += `### ${relativePath}\n\n`;
      markdownContent += "```js\n";
      markdownContent += `//--------------------------------------------\n`;
      markdownContent += `// File: ${relativePath}\n`;
      markdownContent += `//--------------------------------------------\n\n`;
      markdownContent += `${content}\n`;
      markdownContent += "```\n\n";
    }
  }
  await writeFile(outputFilePath, markdownContent, "utf8");
}

// Main function to execute the script
async function main() {
  const files = await getFiles(baseDirectory);
  const dirStructure = await generateDirStructure(baseDirectory);
  await createMarkdownFile(files, dirStructure);
}

main().catch((err) => console.error(err));
