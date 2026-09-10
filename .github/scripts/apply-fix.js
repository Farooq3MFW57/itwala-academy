const fs = require('fs');

async function main() {
    const task = process.env.TASK;
    const targetFile = process.env.TARGET_FILE;
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const key = process.env.AZURE_OPENAI_KEY;
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;

    // Read the current content of the file to be fixed
    const currentContent = fs.readFileSync(targetFile, 'utf8');

    const url = `${endpoint}openai/responses?api-version=2025-04-01-preview`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'api-key': key },
        body: JSON.stringify({
            model: deployment,
            input: [
                {
                    role: "system",
                    content: "You are a precise code-editing assistant. You will be given a file's full content and a task. Return ONLY the complete, corrected file content — no explanations, no markdown code fences, just the raw file content."
                },
                {
                    role: "user",
                    content: `Task: ${task}\n\nCurrent file content:\n${currentContent}`
                }
            ]
        })
    });

    const data = await response.json();
    const messageItem = data.output.find(item => item.type === "message");
    const newContent = messageItem?.content?.[0]?.text;

    if (!newContent) {
        console.error("No content returned from model");
        process.exit(1);
    }

    fs.writeFileSync(targetFile, newContent, 'utf8');
    console.log(`Updated ${targetFile} successfully.`);
}

main();
