/** @jsxImportSource https://esm.sh/preact */
import React from "https://esm.sh/preact/compat";
import { signal } from "@preact/signals";

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
                    onKeyDown={blurOnEnter}
                    contentEditable={!item.completed}
                    style={{
                        "textDecoration": item.completed
                            ? "line-through"
                            : "none",
                    }}
                >
                    {item.text}
                </span>
                <button
                    disabled={item.completed}
                    onClick={() => onAddChild(item.id)}
                >
                    ⬇️
                </button>
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

function blurOnEnter(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
        e.preventDefault();
        // save editing
        e.currentTarget.blur();
    }
}

const NestedTodoList = () => {
    const todos: Todo[] = [
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
    ];

    const setTodos = (newTodos: Todo[]) => {};

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

        console.log("adding child!");
        setTodos(updateTodo(todos));
    };

    const getCompletedPercentage = (todos: Todo[]) => {
        const allTodos = todos.flatMap((todo) => {
            const children = todo.children ?? [];
            return [todo, ...children];
        });
        const completed = allTodos.filter((todo) => todo.completed).length;

        return `${completed}/${allTodos.length}`;
    };

    return (
        <div>
            <h1
                contentEditable={true}
                onKeyDown={blurOnEnter}
            >
                n-todo
            </h1>
            <h2>Completed: {getCompletedPercentage(todos)}</h2>
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

const App = () => <NestedTodoList />;

export default App;
