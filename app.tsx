/** @jsxImportSource https://esm.sh/react */
import React, { useState } from "https://esm.sh/react";

interface Todo {
    id: string; // UUID
    text: string;
    completed: boolean;
    children?: Todo[];
}

const TodoItem = ({ item, onToggle, onAddChild, level = 0 }: {
    item: Todo;
    onToggle: (id: string) => void;
    onAddChild: (id: string) => void;
    level?: number;
}) => {
    const hasChildren = item.children && item.children.length > 0;
    const allChildrenCompleted = hasChildren &&
        item.children?.every((child) => child.completed);
    const canBeCompleted = !hasChildren || allChildrenCompleted;

    return (
        <div style={{ marginLeft: "20px" }}>
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
                    //TODO can uncheck child elements after parent has been checked
                />
                <span
                    onClick={(e) => e.preventDefault()}
                    contentEditable={!item.completed}
                    style={{
                        "textDecoration": item.completed
                            ? "line-through"
                            : "none",
                    }}
                >
                    {item.text}
                    <button
                        disabled={item.completed}
                        onClick={() => onAddChild(item.id)}
                    >
                        ⬇️
                    </button>
                </span>
            </label>
            {hasChildren && (
                <div>
                    {item.children?.map((child) => (
                        <div>
                            <TodoItem
                                key={child.id}
                                item={child}
                                onToggle={onToggle}
                                onAddChild={onAddChild}
                                level={level + 1}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
const NestedTodoList = () => {
    const [todos, setTodos] = useState<Todo[]>([
        {
            id: crypto.randomUUID(),
            text: "Main Task 1",
            completed: false,
            children: [
                {
                    id: crypto.randomUUID(),
                    text: "Subtask 1.1",
                    completed: false,
                },
                {
                    id: crypto.randomUUID(),
                    text: "Subtask 1.2",
                    completed: false,
                },
            ],
        },
        {
            id: crypto.randomUUID(),
            text: "Main Task 2",
            completed: false,
            children: [
                {
                    id: crypto.randomUUID(),
                    text: "Subtask 2.1",
                    completed: false,
                },
                {
                    id: crypto.randomUUID(),
                    text: "Subtask 2.2",
                    completed: false,
                    children: [
                        {
                            id: crypto.randomUUID(),
                            text: "Sub-subtask 2.2.1",
                            completed: false,
                        },
                    ],
                },
            ],
        },
    ]);

    const todoToggle = (id: string) => {
        const updateTodo = (todos: Todo[]): Todo[] => {
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

    const todoAdd = () => {
        setTodos([
            ...todos,
            {
                id: crypto.randomUUID(),
                text: "New Task",
                completed: false,
                children: [],
            },
        ]);
    };

    const todoAddChild = (id: string) => {
        const updateTodo = (todos: Todo[]): Todo[] => {
            return todos.map((todo) => {
                if (todo.id === id) {
                    return {
                        ...todo,
                        children: [
                            ...todo.children ?? [],
                            {
                                id: crypto.randomUUID(),
                                text: "New Subtask",
                                completed: false,
                                children: [],
                            },
                        ],
                    };
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
            <h1>n-todo</h1>
            {todos.map((todo) => (
                <TodoItem
                    key={todo.id}
                    item={todo}
                    onToggle={todoToggle}
                    onAddChild={todoAddChild}
                />
            ))}
            <button onClick={todoAdd}>Add Task</button>
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
