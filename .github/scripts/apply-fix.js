const fs = require('fs');
const path = require('path');

async function main() {
    const task = process.env.TASK;
    const targetFiles = process.env.TARGET_FILES.split(',').map(f => f.trim());
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const key = process.env.AZURE_OPENAI_KEY;
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;

    // Read each file's current content — blank if it doesn't exist yet (new file)
    let filesContext = "";
    for (const file of targetFiles) {
        const content = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : "(this file does not exist yet — create it)";
        filesContext += `\n----FILE: ${file}----\n${content}\n`;
    }

    const url = `${endpoint}openai/responses?api-version=2025-04-01-preview`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'api-key': key },
        body: JSON.stringify({
            model: deployment,
            input: [
                {
                    role: "system",
                    content: "You are a precise code-editing assistant working on a real website. You will be given a task and the current content of one or more files (some may not exist yet). Return ALL files' complete, corrected content using EXACTLY this format for each file, with no other text:\n----FILE: filename----\n<full file content>\n\nInclude every file listed, even ones you didn't need to change."
                },
                {
                    role: "user",
                    content: `Task: ${task}\n\nFiles:\n${filesContext}`
                }
            ]
        })
    });

    const data = await response.json();
    const messageItem = data.output.find(item => item.type === "message");
    const rawOutput = messageItem?.content?.[0]?.text;

    if (!rawOutput) {
        console.error("No content returned from model");
        process.exit(1);
    }

    // Parse the response back into separate files
    const fileBlocks = rawOutput.split(/----FILE: (.+?)----/g).filter(Boolean);

    for (let i = 0; i < fileBlocks.length; i += 2) {
        const fileName = fileBlocks[i].trim();
        const fileContent = fileBlocks[i + 1].trim();

        // Create any needed folders
        const dir = path.dirname(fileName);
        if (dir && dir !== '.' && !fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(fileName, fileContent, 'utf8');
        console.log(`Updated ${fileName}`);
    }
}

main();
