import { APIGatewayProxyEvent } from "aws-lambda";
import { parseUserId } from "../auth/utils";
import { createLogger } from '../utils/logger';

const logger = createLogger('getTodos');

/**
 * Get a user id from an API Gateway event
 * @param event an event from API Gateway
 *
 * @returns a user id from a JWT token
 */
export function getUserId(event: APIGatewayProxyEvent): string {
  logger.info("getUserId");
  return parseUserId(getToken(event));
}

export function getToken(event: APIGatewayProxyEvent): string {
  logger.info("getToken");
  let authHeader = event.headers.Authorization;
  logger.info(authHeader);
  return authHeader.split(' ')[1];
}