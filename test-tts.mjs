import fs from 'fs';
import path from 'path';

const envPath = path.resolve('.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
let apiKey = '';
for (const line of envContent.split('\n')) {
  if (line.startsWith('MAGNIFIC_API_KEY=')) {
    apiKey = line.split('=')[1].trim();
  }
}

async function startVoice(vid) {
  const startRes = await fetch("https://api.magnific.com/v1/ai/voiceover/elevenlabs-turbo-v2-5", {
    method: "POST",
    headers: {
      "x-magnific-api-key": apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      text: "שלום שמי",
      voice_id: vid,
    })
  });
  const data = await startRes.json();
  return data.data?.task_id || data.task_id;
}

async function test() {
  const clydeId = await startVoice("2EiwWnXFnvU5JabPnv8n");
  const joshId = await startVoice("tx3xeV01z848rD2ZJ5O2");
  const brianId = await startVoice("nPczCjzI2devNBz1zQrb");
  console.log("Started tasks:", {clydeId, joshId, brianId});
  
  await new Promise(r => setTimeout(r, 4000));
  
  for (let id of [clydeId, joshId, brianId]) {
    if(!id) continue;
    const checkRes = await fetch(`https://api.magnific.com/v1/ai/voiceover/elevenlabs-turbo-v2-5/${id}`, {
      method: "GET",
      headers: { "x-magnific-api-key": apiKey }
    });
    const checkData = await checkRes.json();
    console.log(`Task ${id} status:`, checkData.data?.status || checkData.status);
  }
}

test();
