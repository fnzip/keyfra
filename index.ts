import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { generateAnimation } from './animation';
import { serveStatic } from 'hono/bun';

const app = new Hono();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use('*', cors());
app.use('*', serveStatic({ root: './static' }))

// Define the POST /ai endpoint
app.post('/ai', async (c) => {
  try {
    // Parse the request body
    const body = await c.req.json();

    if (!body.text) {
      return c.json({ error: 'Missing text parameter' }, 400);
    }

    // Generate animation based on the text
    const animationData = await generateAnimation(body.text);

    // Return the animation data
    return c.json(animationData);
  } catch (error) {
    console.error('Error generating animation:', error);
    return c.json({ error: 'Failed to generate animation' }, 500);
  }
});

// Export the Bun server configuration
export default {
  port: PORT,
  fetch: app.fetch
};
