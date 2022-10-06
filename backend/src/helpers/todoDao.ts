import * as AWS from 'aws-sdk';
import { createLogger } from '../utils/logger';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { TodoItem } from '../models/TodoItem';
import { TodoUpdate } from '../models/TodoUpdate';

const AWSXRay = require('aws-xray-sdk');
const XAWS = AWSXRay.captureAWS(AWS);
const logger = createLogger('todosDao');

export class TodoDao {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE
  ) {}

  async getTodosByUserId(userId: string): Promise<TodoItem[]> {
    logger.info('Getting todo item list');
    const result = await this.docClient
      .query({
        TableName: this.todosTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      })
      .promise();
    return result.Items as TodoItem[];
  }

  async getTodoByUserIdAndTodoId(userId: string, todoId: string): Promise<TodoItem> {
    logger.info(`Getting todo item: ${todoId}`);
    const result = await this.docClient
      .query({
        TableName: this.todosTable,
        KeyConditionExpression: 'userId = :userId and todoId = :todoId',
        ExpressionAttributeValues: {
          ':userId': userId,
          ':todoId': todoId
        }
      })
      .promise();
    const todoItem = result.Items[0];
    return todoItem as TodoItem;
  }

  async createTodo(newTodo: TodoItem): Promise<TodoItem> {
    logger.info(`Creating new todo item: ${newTodo.todoId}`);
    await this.docClient
      .put({
        TableName: this.todosTable,
        Item: newTodo
      })
      .promise();
    return newTodo;
  }

  async updateTodoByUserIdAndTodoId(userId: string, todoId: string, updateData: TodoUpdate): Promise<void> {
    logger.info(`Updating a todo item: ${todoId}`);
    await this.docClient
      .update({
        TableName: this.todosTable,
        Key: { userId, todoId },
        ConditionExpression: 'attribute_exists(todoId)',
        UpdateExpression: 'set name = :name, dueDate = :dueDate, done = :done',
        ExpressionAttributeValues: {
          ':name': updateData.name,
          ':dueDate': updateData.dueDate,
          ':done': updateData.done
        }
      })
      .promise();
  }

  async deleteTodoByUserIdAndTodoId(userId: string, todoId: string): Promise<void> {
    await this.docClient
      .delete({
        TableName: this.todosTable,
        Key: { userId, todoId }
      })
      .promise();
  }

  async saveImgUrlOfUserIdAndTodoId(userId: string, todoId: string, bucketName: string, url: string): Promise<void> {
    await this.docClient
      .update({
        TableName: this.todosTable,
        Key: { userId, todoId },
        ConditionExpression: 'attribute_exists(todoId)',
        UpdateExpression: 'set attachmentUrl = :attachmentUrl',
        ExpressionAttributeValues: {
          ':attachmentUrl': `https://${bucketName}.s3.amazonaws.com/${url}`
        }
      })
      .promise();
  }
}

function createDynamoDBClient() {
    return new XAWS.DynamoDB.DocumentClient()
  }
