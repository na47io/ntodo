/** @jsxImportSource preact */
import { Todo, todoAdd, todoAddChild, todoToggle } from "./todo.ts";
import { useContext } from "preact/hooks";
import { AppContext, State } from "@/model.ts";

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
const handleTodoToggle = (
    todos: Todo[],
    setState: (newTodos: Todo[]) => void,
) => compose(todoToggle.bind(null, todos), setState);
const handleTodoAddChild = (
    todos: Todo[],
    setState: (newTodos: Todo[]) => void,
) => compose(
    todoAddChild.bind(null, todos),
    setState,
);
const handleAddTodo = (todos: Todo[], setState: (newTodos: Todo[]) => void) =>
    compose(
        todoAdd.bind(null, todos),
        setState,
    );

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

function Todos() {
    const state = useContext(AppContext);

    const [completed, total] = state.counts.value;
    const todos = state.todos;
    const setTodos = state.setTodos;

    return (
        <div>
            <h1
                contentEditable={true}
                onKeyDown={blurOnEnter}
            >
                n-todo
            </h1>
            <h2>Project: {state.projectId}</h2>
            <h2>Completed: {completed} / {total}</h2>
            {todos.value.map((todo) => (
                <TodoItem
                    key={todo.id}
                    item={todo}
                    onToggle={handleTodoToggle(todos.value, setTodos)}
                    onAddChild={handleTodoAddChild(todos.value, setTodos)}
                />
            ))}
            <button onClick={handleAddTodo(todos.value, setTodos)}>
                Add Task
            </button>
        </div>
    );
}

export function App(props: { initialState: State }) {
    return (
        <AppContext.Provider value={props.initialState}>
            <Todos />
        </AppContext.Provider>
    );
}
