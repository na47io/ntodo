/** @jsxImportSource preact */
export function Landing() {
    return (
        <div>
            <h1>Welcome to the Todo App</h1>
            <form method="GET" action="/createProject">
                <input
                    required
                    type="text"
                    id="projectId"
                    name="projectId"
                    placeholder="Enter project name"
                />
                <button type="submit">Create Project</button>
            </form>
        </div>
    );
}
