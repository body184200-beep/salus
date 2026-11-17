import { app } from './app.js';
import { config } from './config/index.js';
import { initDatabase } from './db/database.js';
import { seedDatabase } from './db/seeds.js';
async function startServer() {
    try {
        console.log('🔄 Initializing SALUS database...');
        initDatabase();
        await seedDatabase();
        app.listen(config.port, () => {
            console.log(`🚀 SALUS API Server running on port ${config.port}`);
            console.log(`🩺 Health endpoint: http://localhost:${config.port}/api/health`);
        });
    }
    catch (err) {
        console.error('❌ Failed to start SALUS server:', err);
        process.exit(1);
    }
}
startServer();
