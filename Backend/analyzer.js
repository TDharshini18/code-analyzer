const fs = require("fs");
const path = require("path");
const Groq = require("groq-sdk");
require("dotenv").config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

/* -----------------------
   RECURSIVE FILE SCANNER
------------------------ */
function scanDirectory(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      scanDirectory(fullPath, fileList);
    } else {
      fileList.push(fullPath);
    }
  });

  return fileList;
}

/* -----------------------
   TECH STACK DETECTION
------------------------ */
function detectTechStack(files) {
  const frameworks = new Set();
  const languages = new Set();

  files.forEach(file => {
    if (file.endsWith(".js")) languages.add("JavaScript");
    if (file.endsWith(".ts")) languages.add("TypeScript");
    if (file.endsWith(".py")) languages.add("Python");
    if (file.endsWith(".java")) languages.add("Java");

    if (file.includes("package.json")) {
      const content = fs.readFileSync(file, "utf8");
      if (content.includes("express")) frameworks.add("Express");
      if (content.includes("react")) frameworks.add("React");
      if (content.includes("next")) frameworks.add("Next.js");
      if (content.includes("mongoose")) frameworks.add("MongoDB");
    }

    if (file.includes("requirements.txt")) {
      frameworks.add("Python Backend");
    }
  });

  return {
    languages: [...languages],
    frameworks: [...frameworks]
  };
}

/* -----------------------
   STRUCTURE DETECTION
------------------------ */
function detectStructure(files) {
  const structure = {
    entryPoints: [],
    routes: [],
    services: [],
    models: [],
    flow: []
  };

  files.forEach(file => {
    if (file.endsWith("index.js") || file.endsWith("app.js"))
      structure.entryPoints.push(file);

    if (file.toLowerCase().includes("route"))
      structure.routes.push(file);

    if (file.toLowerCase().includes("service"))
      structure.services.push(file);

    if (file.toLowerCase().includes("model"))
      structure.models.push(file);
  });

  structure.flow.push("Client → Routes → Services → Models → Database");

  return structure;
}

/* -----------------------
   ARCHITECTURE DETECTION
------------------------ */
function detectArchitecture(structure) {
  if (structure.routes.length && structure.services.length && structure.models.length)
    return "Layered Architecture (Route → Service → Model)";
  if (structure.routes.length && !structure.services.length)
    return "Controller-based Architecture";
  return "Basic / Unknown Architecture";
}

/* -----------------------
   SUMMARIZE REPO CONTENT
------------------------ */
function getRepoSummary(files) {
  let summary = "";

  files.slice(0, 20).forEach(file => {
    try {
      const content = fs.readFileSync(file, "utf8").slice(0, 1000);
      summary += `\nFILE: ${file}\n${content}\n`;
    } catch {}
  });

  return summary;
}

/* -----------------------
   GROQ AI ANALYSIS
------------------------ */
async function askGroq(summary) {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: "You are a senior software architect analyzing a GitHub repository."
      },
      {
        role: "user",
        content: `Analyze this codebase and explain:
        - Overall architecture
        - Tech stack
        - Folder structure meaning
        - How data flows
        - How to modify APIs

        CODE SNIPPETS:
        ${summary}`
      }
    ]
  });

  return completion.choices[0].message.content;
}

/* -----------------------
   MAIN ANALYZER FUNCTION
------------------------ */
async function analyzeProject(projectPath) {
  const files = scanDirectory(projectPath);

  const techStack = detectTechStack(files);
  const structure = detectStructure(files);
  const architecture = detectArchitecture(structure);
  const summary = getRepoSummary(files);

  const aiAnalysis = await askGroq(summary);

  return {
    architecture,
    frameworks: techStack.frameworks,
    languages: techStack.languages,
    structure,
    aiAnalysis,
    onboardingGuide: {
      startHere: structure.entryPoints[0] || "Check root index/app file",
      modifyAPI: structure.routes[0] || "Find route files",
      businessLogic: structure.services[0] || "Find service layer",
      database: structure.models[0] || "Find model files"
    }
  };
}

module.exports = { analyzeProject };