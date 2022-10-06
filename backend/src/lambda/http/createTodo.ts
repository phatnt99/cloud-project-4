import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils';
import { createTodo } from '../../helpers/todos';
import { createLogger } from '../../utils/logger'

const logger = createLogger('createTodo')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    // TODO: Implement creating a new TODO item
    // SOLVED
    const todoItem = await createTodo(newTodo, getUserId(event));
    logger.info("Todo has been created, todoId = ", todoItem.todoId);

    return {
      statusCode: 201,
      body: JSON.stringify({
        item: todoItem
      })
     };
  }
)

handler.use(
  cors({
    credentials: true
  })
)