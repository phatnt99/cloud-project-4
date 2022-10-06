import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { TodoDao } from './todoDao';
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const todoDao = new TodoDao();

export async function getAllTodos(userId: string): Promise<TodoItem[]> {

    return todoDao.getTodosByUserId(userId);
}

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {
  const itemId = uuid.v4();

  return todoDao.createTodo({
    todoId: itemId,
    userId: userId,
    name: createTodoRequest.name,
    done: false,
    dueDate: createTodoRequest.dueDate,
    createdAt: new Date().toISOString()
  });
}

export async function getTodo(todoId: string, userId: string): Promise<TodoItem> {
  
  return await todoDao.getTodoByUserIdAndTodoId(userId, todoId);
}

export async function saveImgUrl(todoId: string, itemUrl: string, userId: string): Promise<void> {
  const todoItem = await todoDao.getTodoByUserIdAndTodoId(userId, todoId);

  todoDao.saveImgUrlOfUserIdAndTodoId(todoItem.userId, todoItem.todoId, process.env.ATTACHMENT_S3_BUCKET, itemUrl);
}

export async function updateTodo(
    todoId: string, 
    updateTodoRequest: UpdateTodoRequest,
    userId: string
  ): Promise<void> {
    const todoItem = await todoDao.getTodoByUserIdAndTodoId(userId, todoId);
  
    await todoDao.updateTodoByUserIdAndTodoId(todoItem.userId, todoItem.todoId, {
      name: updateTodoRequest.name,
      done: updateTodoRequest.done,
      dueDate: updateTodoRequest.dueDate,
    });
}

export async function deleteTodo(
    itemId: string,
    userId: string
  ): Promise<void> {
    const todoItem = await todoDao.getTodoByUserIdAndTodoId(userId, itemId);

    await todoDao.deleteTodoByUserIdAndTodoId(todoItem.userId, todoItem.todoId);
}