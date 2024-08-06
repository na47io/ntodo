import { computed, effect, Signal, signal } from "@preact/signals";
import { Todo, todoGetCounts } from "@/todo.ts";
import { createContext } from "preact";

export interface InitialState {
    projectId: string;
    initialTodos: Todo[];
}

export interface State {
    projectId: string;
    todos: Signal<Todo[]>;
    counts: Signal<[number, number]>;
    setTodos: (newState: Todo[]) => void;
}

export const AppContext = createContext<State>({
    projectId: "",
    todos: signal([]),
    counts: signal([0, 0]),
    setTodos: () => {},
});

export function createAppState(
    { projectId, initialTodos }: InitialState,
): State {
    const todos = signal<Todo[]>(initialTodos);

    const counts = computed(() => {
        return todoGetCounts(todos.value);
    });

    effect(() => {
        // don't run this on the server
        if (typeof Deno === "undefined") {
            fetch("/api/todos", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    todos: todos.value,
                    projectId,
                }),
            }).then((res) => {
                console.log("saved");
            });
        }
    });

    return {
        projectId,
        todos,
        counts,
        setTodos: (newTodos: Todo[]) => {
            todos.value = newTodos;
        },
    };
}
