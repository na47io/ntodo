/** @jsxImportSource https://esm.sh/preact */
import { computed, signal } from "@preact/signals";

interface Todo {
    id: string; // UUID
    text: string;
    completed: boolean;
    children?: Todo[];
}

const INITIAL_TODOS: Todo[] = [
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

const todos = signal<Todo[]>(INITIAL_TODOS);
const getCompletedPercentage = computed(() => {
    return todoGetCounts(todos.value);
});
const setTodos = (newTodos: Todo[]) => {
    todos.value = newTodos;
};

const todoToggle = (todos: Todo[], id: string): Todo[] => {
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

    return updateTodo(todos);
};

const todoAdd = (todos: Todo[]): Todo[] => [
    ...todos,
    {
        id: crypto.randomUUID(),
        text: "New Task",
        completed: false,
        children: [],
    },
];

const todoAddChild = (todos: Todo[], id: string): Todo[] => {
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

    return updateTodo(todos);
};

const todoGetCounts = (todos: Todo[]): [number, number] => {
    const countChildren = (todos: Todo[]): [number, number] => {
        if (todos.length === 0) {
            return [0, 0];
        }

        // recursive count
        return todos.reduce((acc, todo) => {
            if (todo.completed) {
                acc[0] += 1;
            }
            acc[1] += 1;

            if (todo.children) {
                const [completed, total] = countChildren(todo.children);
                acc[0] += completed;
                acc[1] += total;
            }

            return acc;
        }, [0, 0]);
    };

    return countChildren(todos);
};

function blurOnEnter(e: KeyboardEvent) {
    if (e.key === "Enter") {
        e.preventDefault();

        if (e.currentTarget instanceof HTMLElement) {
            e.currentTarget.blur();
        }
    }
}

// heretic left-side composition
// deno-lint-ignore ban-types
function compose(...fns: Function[]) {
    // deno-lint-ignore no-explicit-any
    return (x: any) => fns.reduce((acc, fn) => fn(acc), x);
}

// take the current state and return a function that will
// 1. get the new state by a applying the state transform (partially applied to the current state)
// 2. set the new state
const handleTodoToggle = (todos: Todo[]) =>
    compose(todoToggle.bind(null, todos), setTodos);
const handleTodoAddChild = (todos: Todo[]) =>
    compose(
        todoAddChild.bind(null, todos),
        setTodos,
    );
const handleAddTodo = (todos: Todo[]) =>
    compose(
        todoAdd.bind(null, todos),
        setTodos,
    ); // dont need partial apply here

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

const NestedTodoList = () => {
    const [completed, total] = getCompletedPercentage.value;

    return (
        <div>
            <h1
                contentEditable={true}
                onKeyDown={blurOnEnter}
            >
                n-todo
            </h1>
            <h2>Completed: {completed} / {total}</h2>
            {todos.value.map((todo) => (
                <TodoItem
                    key={todo.id}
                    item={todo}
                    onToggle={handleTodoToggle(todos.value)}
                    onAddChild={handleTodoAddChild(todos.value)}
                />
            ))}
            <button onClick={handleAddTodo(todos.value)}>
                Add Task
            </button>
        </div>
    );
};

const App = () => <NestedTodoList />;

export default App;
