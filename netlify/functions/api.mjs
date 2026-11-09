// Runs the existing Express API as one Netlify Function.
// The web page in public/ is served as static files; everything under /api goes here.
import { withLambda } from '@netlify/aws-lambda-compat';
import serverless from 'serverless-http';
import { app } from '../../src/server.js';

export default withLambda(serverless(app));

export const config = {
  path: ['/api', '/api/*', '/health'],
};
