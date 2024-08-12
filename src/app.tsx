import { Todo, todoAdd, todoAddChild, todoDelete, todoToggle } from "@/todo.ts";
import { useContext, useState } from "preact/hooks";
import { AppContext, State } from "@/model.ts";
import { ClearDialog, clearDialogOpen } from "@/components/ClearDialog.tsx";
import { DeleteDialog, deleteDialogOpen } from "@/components/DeleteDialog.tsx";
import { compose } from "@/utils.ts";

function blurOnEnter(e: KeyboardEvent) {
    if (e.key === "Enter") {
        e.preventDefault();

        if (e.currentTarget instanceof HTMLElement) {
            e.currentTarget.blur();
        }
    }
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

function handleTodoDelete(
    todos: Todo[],
    setState: (newTodos: Todo[]) => void,
): (id: string) => void {
    return compose(
        todoDelete.bind(null, todos),
        setState,
    );
}

const handleClearTodos = (
    setState: (newTodos: Todo[]) => void,
) => setState([]);

const TodoItem = ({ item, onToggle, onAddChild, onDelete, level = 0 }: {
    item: Todo;
    onToggle: (id: string) => void;
    onAddChild: (id: string) => void;
    onDelete: (id: string) => void;
    level?: number;
}) => {
    const hasChildren = item.children && item.children.length > 0;
    const allChildrenCompleted = hasChildren &&
        item.children?.every((child) => child.completed);
    const canBeCompleted = !hasChildren || allChildrenCompleted;
    const itemCompleted = item.completed && canBeCompleted;

    const [text, setText] = useState(item.text);

    return (
        <div>
            <label
                style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "5px",
                    gap: "14px",
                }}
            >
                {"|" + "-".repeat(level * 8)}
                <input
                    type="checkbox"
                    checked={itemCompleted}
                    onChange={() => onToggle(item.id)}
                    disabled={!canBeCompleted}
                    //TODO can uncheck child elements after parent has been checked
                />
                <span
                    onClick={(e) => {
                        e.preventDefault();
                        setText(() => "");
                    }}
                    onKeyDown={blurOnEnter}
                    contentEditable={!itemCompleted}
                    style={{
                        padding: "8px",
                        minWidth: "100px",
                        textDecoration: itemCompleted ? "line-through" : "none",
                        opacity: itemCompleted ? 0.3 : 1,
                    }}
                >
                    {text}
                </span>
                <button
                    className="outline"
                    disabled={itemCompleted}
                    onClick={() => onAddChild(item.id)}
                >
                    subtask
                </button>
                <button
                    className="outline"
                    disabled={itemCompleted}
                    onClick={() => {
                        deleteDialogOpen.value = {
                            open: true,
                            id: item.id,
                            childTaskCount: item.children?.length || 0,
                        };
                    }}
                >
                    del
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
                                onDelete={onDelete}
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
        <section>
            <header>
                <a href="/new">+ new ntodo</a>
            </header>

            <section>
                <hgroup>
                    <h2>{state.projectId}</h2>
                    <small>v{todos.value.version}</small>
                    <label for="file">completed : {completed} / {total}</label>
                    <progress id="file" value={completed} max={total}>
                    </progress>
                </hgroup>

                {todos.value.todos.map((todo) => (
                    <TodoItem
                        key={todo.id}
                        item={todo}
                        onToggle={handleTodoToggle(todos.value.todos, setTodos)}
                        onAddChild={handleTodoAddChild(
                            todos.value.todos,
                            setTodos,
                        )}
                        onDelete={handleTodoDelete(todos.value.todos, setTodos)}
                    />
                ))}
                <section style={{ display: "flex", "gap": "14px" }}>
                    <button
                        onClick={handleAddTodo(todos.value.todos, setTodos)}
                    >
                        Add Task
                    </button>
                    <button
                        disabled={total == 0}
                        className="outline"
                        onClick={() => {
                            clearDialogOpen.value = true;
                        }}
                    >
                        Clear
                    </button>
                </section>
                <ClearDialog
                    onCancel={() => {
                        clearDialogOpen.value = false;
                    }}
                    onConfirm={() => handleClearTodos(setTodos)}
                    open={clearDialogOpen.value}
                    totalTodos={total}
                />
                <DeleteDialog
                    onCancel={() => {
                        deleteDialogOpen.value = {
                            open: false,
                            id: "",
                            childTaskCount: 0,
                        };
                    }}
                    onConfirm={() =>
                        handleTodoDelete(todos.value.todos, setTodos)(
                            deleteDialogOpen.value.id,
                        )}
                    open={deleteDialogOpen.value.open}
                />
            </section>
        </section>
    );
}

export function App(props: { initialState: State }) {
    return (
        <AppContext.Provider value={props.initialState}>
            <Todos />
        </AppContext.Provider>
    );
}
