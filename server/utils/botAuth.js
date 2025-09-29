// Bot endpoints are intentionally left open (no token required).
// Original token-checking code is commented below — to re-enable, uncomment it and remove the early next().
export const botAuthMiddleware = (req, res, next) => {
  // NOTE: For development convenience the bot token protection is disabled.
  // To restore protection set the BOT_TOKEN env variable on the server and
  // uncomment the code below (and remove the plain next() call):

  /*
  const token = req.headers['x-bot-token'];
  if (!process.env.BOT_TOKEN) {
    console.warn('BOT_TOKEN is not set in environment; bot endpoints are effectively open');
  }
  if (!token || (process.env.BOT_TOKEN && token !== process.env.BOT_TOKEN)) {
    return res.status(401).json({ error: 'Invalid bot token' });
  }
  */

  // Allow all requests through to bot endpoints.
  next();
};
