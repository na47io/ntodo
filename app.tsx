/** @jsxImportSource https://esm.sh/react */
import React, { useState } from "https://esm.sh/react";

const TodoItem = ({ item, onToggle, level = 0 }) => {
    const hasChildren = item.children && item.children.length > 0;
    const allChildrenCompleted = hasChildren &&
        item.children.every((child) => child.completed);
    const canBeCompleted = !hasChildren || allChildrenCompleted;

    return (
        <div style={{ marginLeft: `${level * 20}px` }}>
            <label
                style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "5px",
                }}
            >
                <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => onToggle(item.id)}
                    disabled={!canBeCompleted}
                />
                <span style={{ marginLeft: "5px" }}>{item.text}</span>
            </label>
            {hasChildren && (
                <div>
                    {item.children.map((child) => (
                        <TodoItem
                            key={child.id}
                            item={child}
                            onToggle={onToggle}
                            level={level + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const NestedTodoList = () => {
    const [todos, setTodos] = useState([
        {
            id: 1,
            text: "Main Task 1",
            completed: false,
            children: [
                { id: 2, text: "Subtask 1.1", completed: false },
                { id: 3, text: "Subtask 1.2", completed: false },
            ],
        },
        {
            id: 4,
            text: "Main Task 2",
            completed: false,
            children: [
                { id: 5, text: "Subtask 2.1", completed: false },
                {
                    id: 6,
                    text: "Subtask 2.2",
                    completed: false,
                    children: [
                        { id: 7, text: "Sub-subtask 2.2.1", completed: false },
                    ],
                },
            ],
        },
    ]);

    const toggleTodo = (id) => {
        const updateTodo = (todos) => {
            return todos.map((todo) => {
                if (todo.id === id) {
                    const newCompleted = !todo.completed;
                    return { ...todo, completed: newCompleted };
                } else if (todo.children) {
                    return { ...todo, children: updateTodo(todo.children) };
                }
                return todo;
            });
        };

        setTodos(updateTodo(todos));
    };

    return (
        <div>
            <h1>Nested Todo List</h1>
            {todos.map((todo) => (
                <TodoItem key={todo.id} item={todo} onToggle={toggleTodo} />
            ))}
        </div>
    );
};

const App = () => {
    return (
        <html>
            <head>
                <meta charSet="utf-8" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <link rel="stylesheet" href="/styles.css"></link>
                <title>My app</title>
            </head>
            <body>
                <NestedTodoList />
            </body>
        </html>
    );
};

export default App;
