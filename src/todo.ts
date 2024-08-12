export interface Todo {
    id: string; // UUID
    text: string;
    completed: boolean;
    children?: Todo[];
}

export const todoToggle = (todos: Todo[], id: string): Todo[] => {
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

export const todoAdd = (todos: Todo[]): Todo[] => [
    ...todos,
    {
        id: crypto.randomUUID(),
        text: "New Task",
        completed: false,
        children: [],
    },
];

export const todoAddChild = (todos: Todo[], id: string): Todo[] => {
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

export const todoGetCounts = (todos: Todo[]): [number, number] => {
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

export const todoDelete = (todos: Todo[], id: string): Todo[] => {
    // remove the todo with the matching id
    const removeTodo = (todos: Todo[]): Todo[] => {
        return todos.reduce((acc, todo) => {
            if (todo.id === id) {
                return acc;
            }

            if (todo.children) {
                return [...acc, {
                    ...todo,
                    children: removeTodo(todo.children),
                }];
            }

            return [...acc, todo];
        }, [] as Todo[]);
    };

    return removeTodo(todos);
};

export function todoEdit(todos: Todo[], id: string, text: string): Todo[] {
    const updateTodo = (todos: Todo[]): Todo[] => {
        return todos.map((todo) => {
            if (todo.id === id) {
                return { ...todo, text };
            } else if (todo.children) {
                return { ...todo, children: updateTodo(todo.children) };
            }
            return todo;
        });
    };

    return updateTodo(todos);
}
