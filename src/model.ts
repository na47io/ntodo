import { computed, effect, Signal, signal } from "@preact/signals";
import { Todo, todoGetCounts } from "@/todo.ts";
import { createContext } from "preact";

export interface InitialState {
    projectId: string;
    initialTodos: Todos;
}

export interface State {
    projectId: string;
    todos: Signal<Todos>;
    counts: Signal<[number, number]>;
    setTodos: (newState: Todo[]) => void;
}

export interface Todos {
    todos: Todo[];
    version: number;
}

export const AppContext = createContext<State>({
    projectId: "",
    todos: signal({ todos: [], version: 0 } as Todos),
    counts: signal([0, 0]),
    setTodos: () => {},
});

export function createAppState(
    { projectId, initialTodos }: InitialState,
): State {
    const todos = signal<Todos>(initialTodos);

    const counts = computed(() => {
        return todoGetCounts(todos.value.todos);
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
            }).then((_res) => {
            });
        }
    });

    return {
        projectId,
        todos,
        counts,
        setTodos: (newTodos: Todo[]) => {
            todos.value = {
                todos: newTodos,
                version: todos.value.version + 1, // TODO: increment version
            };
        },
    };
}
