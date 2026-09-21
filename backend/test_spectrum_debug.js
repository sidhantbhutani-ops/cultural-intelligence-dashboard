require('dotenv').config({ path: '.env.local' });
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

async function test() {
  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: 'Respond with: {"test": "value"}'
        }
      ]
    });

    console.log('Full Message Object:');
    console.log(JSON.stringify(message, null, 2));
    
    console.log('\nContent[0]:');
    console.log(JSON.stringify(message.content[0], null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

test();
