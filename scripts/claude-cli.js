#!/usr/bin/env node

const Anthropic = require('@anthropic-ai/sdk').default;
const { readFileSync } = require('fs');
const { createInterface } = require('readline');

// Initialize the Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Create readline interface for terminal input
const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function chatWithClaude(message) {
  try {
    console.log('\n🤖 Claude is thinking...\n');
    
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: message
      }]
    });

    const reply = response.content[0].text;
    console.log('Claude:', reply);
    
  } catch (error) {
    if (error.status === 401) {
      console.error('❌ Authentication failed. Please check your ANTHROPIC_API_KEY.');
      console.error('Set it with: export ANTHROPIC_API_KEY=your_api_key_here');
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

function showHelp() {
  console.log(`
🤖 Claude CLI Tool

Usage:
  node scripts/claude-cli.js                    # Interactive mode
  node scripts/claude-cli.js "your message"     # Single message
  node scripts/claude-cli.js --file path.txt    # Send file contents

Examples:
  node scripts/claude-cli.js "Hello Claude!"
  node scripts/claude-cli.js --file README.md
  npm run claude "Explain this code"

Make sure to set your API key:
  export ANTHROPIC_API_KEY=your_api_key_here
`);
}

async function main() {
  const args = process.argv.slice(2);
  
  // Check if API key is set
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY environment variable is required.');
    console.error('Set it with: export ANTHROPIC_API_KEY=your_api_key_here');
    console.error('Get your API key from: https://console.anthropic.com/');
    process.exit(1);
  }

  // Handle help flag
  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
  }

  // Handle file input
  if (args[0] === '--file' && args[1]) {
    try {
      const fileContent = readFileSync(args[1], 'utf8');
      const message = `Please analyze this file (${args[1]}):\n\n${fileContent}`;
      await chatWithClaude(message);
    } catch (error) {
      console.error('❌ Error reading file:', error.message);
    }
    process.exit(0);
  }

  // Handle single message
  if (args.length > 0) {
    const message = args.join(' ');
    await chatWithClaude(message);
    process.exit(0);
  }

  // Interactive mode
  console.log('🤖 Claude CLI - Interactive Mode');
  console.log('Type your messages and press Enter. Type "exit" to quit.\n');

  const askQuestion = () => {
    rl.question('You: ', async (input) => {
      if (input.toLowerCase() === 'exit' || input.toLowerCase() === 'quit') {
        console.log('👋 Goodbye!');
        rl.close();
        return;
      }

      if (input.trim()) {
        await chatWithClaude(input);
      }
      
      console.log(''); // Add spacing
      askQuestion(); // Continue the conversation
    });
  };

  askQuestion();
}

main().catch(console.error); 