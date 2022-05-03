const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

// Verify if user exist
function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response
      .status(400)
      .json({ error: `user not found with username ${username}.` });
  }

  request.user = user;
  next();
}

// Create a new User
app.post("/users", (request, response) => {
  const user = request.body;

  if (!user.name || !user.username) {
    return response
      .status(400)
      .json({ error: "The fields 'name' and 'username' can't be null." });
  }

  const userToInsert = {
    id: uuidv4(),
    name: user.name,
    username: user.username,
    todos: [],
  };

  users.push(userToInsert);

  return response.status(201).end();
});

// Find all TODO's by username
app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { todos } = request.user;

  response.status(200).json({ data: todos });
});

// Create a new TODO to user with received username
app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const user = request.user;

  if (!title || !deadline) {
    return response
      .status(400)
      .json({ error: "Fields 'title' and 'deadline' can't be null." });
  }

  const todoToInsert = {
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todoToInsert);

  return response.status(201).end();
});

// Update Todo informations by id
app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;
  const user = request.user;

  if (!title && !deadline) {
    return response
      .status(400)
      .json({ error: `Some field should be informed.` });
  }

  const indexTodo = user.todos.findIndex((todo) => todo.id === id);

  if (indexTodo < 0) {
    return response
      .status(400)
      .json({ error: `Todo not found with id ${id} for received user.` });
  }

  user.todos[indexTodo] = {
    ...user.todos[indexTodo],
    title: title,
    deadline: new Date(deadline),
  };

  return response.status(204).end();
});

// Update Todo to DONE
app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const user = request.user;

  const indexTodo = user.todos.findIndex((todo) => todo.id === id);

  if (indexTodo < 0) {
    return response
      .status(400)
      .json({ error: `Todo not found with id ${id} for received user.` });
  }

  user.todos[indexTodo].done = true;

  return response.status(204).end();
});

// Delete Todo by id
app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const user = request.user;

  const indexTodo = user.todos.findIndex((todo) => todo.id === id);

  if (indexTodo < 0) {
    return response
      .status(400)
      .json({ error: `Todo not found with id ${id} for received user.` });
  }

  user.todos.splice(indexTodo, 1);

  return response.status(204).end();
});

module.exports = app;
