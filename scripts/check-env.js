require('dotenv').config();

const requiredEnvVars = ['VITE_STEAMGRIDDB_API_KEY'];

requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    console.error(`❌ Error: Missing required environment variable: ${varName} 🛑`);
    process.exit(1);
  } else {
    console.log(`✅ ${varName} is set 👍`);
  }
});