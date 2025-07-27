import express, { Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import config from '../config/config.js';
import { getBotConfig, saveBotConfig, resetBotConfig, type BotConfig } from '../utils/botConfig.js';
import { saveEnvConfig, getEnvConfig } from '../utils/envConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = config.WEB_PORT;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// API Routes

// Get current bot configuration
app.get('/api/config', async (_req: Request, res: Response) => {
    try {
        const botConfig = await getBotConfig();
        const envConfig = await getEnvConfig();
        res.json({ botConfig, envConfig });
    } catch (error) {
        res.status(500).json({ error: 'Failed to load configuration' });
    }
});

// Update bot configuration
app.post('/api/config/bot', async (req: Request, res: Response) => {
    try {
        const botConfig: Partial<BotConfig> = req.body;
        await saveBotConfig(botConfig);
        res.json({ success: true, message: 'Bot configuration updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update bot configuration' });
    }
});

// Update environment configuration
app.post('/api/config/env', async (req: Request, res: Response) => {
    try {
        const envConfig = req.body;
        await saveEnvConfig(envConfig);
        res.json({ success: true, message: 'Environment configuration updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update environment configuration' });
    }
});

// Reset bot configuration to defaults
app.post('/api/config/reset', async (_req: Request, res: Response) => {
    try {
        await resetBotConfig();
        res.json({ success: true, message: 'Configuration reset to defaults' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to reset configuration' });
    }
});

// Serve the main HTML page
app.get('/', (_req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Web interface running on http://localhost:${PORT}`);
    console.log(`Bot configuration interface is ready!`);
}); 