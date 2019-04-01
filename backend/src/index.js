// this is where the server is configured
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '.env' });
const createServer = require('./createServer');
const db = require('./db');

const server = createServer();

// Use express middleware to handle cookies (JWT)
server.express.use(cookieParser());

// Use express middleware to populate current user
// decode the JWT so we can get the userId on each request
server.express.use((req, res, next) => {
  const { token } = req.cookies;
  if (token) {
    const { userId } = jwt.verify(token, process.env.APP_SECRET);
    // put user id on request for further requests to access
    req.userId = userId;
  }
  next();
});

// Create a middleware that populates the user on each request
server.express.use(async (request, response, next) => {
  // if they are not logged in, skip this
  if (!request.userId) return next();
  const user = await db.query.user(
    { where: { id: request.userId } },
    '{id, permissions, email, name}'
  );
  request.user = user;
  next();
});

server.start(
  {
    cors: {
      credentials: true,
      origin: process.env.FRONTEND_URL
    }
  },
  deets => {
    console.log(`Server is now running on port http://localhost:${deets.port}`);
  }
);
