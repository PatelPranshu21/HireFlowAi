import dotenv from 'dotenv';
dotenv.config();

async function testGroqCall() {
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

  console.log('Testing Groq with model:', model);

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: model,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'You are an ATS resume parser. Output a JSON object with name, title, skills array, and summary.' },
        { role: 'user', content: 'Alex Rivera, Senior Python Backend Engineer with Django, PostgreSQL, Redis, React, AWS.' }
      ]
    })
  });

  console.log('HTTP Status:', res.status);
  const data = await res.json();
  console.log('Groq Response:', JSON.stringify(data.choices[0].message.content, null, 2));
}

testGroqCall().catch(console.error);
