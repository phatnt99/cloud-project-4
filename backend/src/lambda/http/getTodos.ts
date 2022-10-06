import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getAllTodos } from '../../helpers/todos'
import { getUserId } from '../utils';
import { createLogger } from '../../utils/logger'

const logger = createLogger('getTodos')

// TODO: Get all TODO items for a current user
// SOLVED
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Write your code here
    logger.info("Into handler");
    const todos = await getAllTodos(getUserId(event));

    logger.info(`Total todo = ${todos.length}`)

    return {
      statusCode: 200,
      body: JSON.stringify({
        items: todos
      })
     };
  }
)

handler.use(
  cors({
    credentials: true
  })
)
