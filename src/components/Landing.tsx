/** @jsxImportSource preact */
function Docs() {
    return (
        <section>
            <p>
                After reading{" "}
                <a href="https://learnhowtolearn.org/how-to-build-extremely-quickly/">
                    How to Build Anything Extremely Quickly
                </a>{" "}
                I built this app in 2 days.
            </p>
            <p>
                Which is still too slow. I hope this tool helps you and me build
                even faster.
            </p>
            <p>
                Have fun and{" "}
                <a href="https://github.com/nikololay">let me know</a>{" "}
                what you make.
            </p>
            <p>
                Features:
                <ul>
                    <li>Items can be infintely nested</li>
                    <li>
                        Parent items cannot be completed before all their
                        children completed
                    </li>
                    <li>Click on Task text to edit it</li>
                    <li>Track progress</li>
                    <li>Unlimited projects now and hopefully forever</li>
                </ul>
            </p>

            <p>
                Fun Quirks:
                <ul>
                    <li>
                        Todo lists (called projects) are created from the
                        url-slug. If your project name happens to clash with
                        mine the only thing I ask is have fun with it.
                    </li>
                    <li>
                        <strong>Remember your project slugs!</strong>{" "}
                        or use your browser history... There are no users to
                        link projects back to.
                    </li>
                </ul>
            </p>
        </section>
    );
}

export function CreateNewForm() {
    return (
        <form method="GET" action="/createProject">
            <input
                required
                type="text"
                id="projectId"
                name="projectId"
                placeholder="Enter list name"
            />
            <button type="submit">create a ntodo list</button>
        </form>
    );
}

export function Landing() {
    return (
        <section>
            <header>
                <h1>welcome to ntodo 🗿</h1>
            </header>
            <div class="grid">
                <Docs />
                <CreateNewForm />
            </div>
            <footer>
                <a href="https://github.com/nikololay/ntodo">source code</a>
                {" | "}
                made by <a href="https://github.com/nikololay">nikolay</a>
            </footer>
        </section>
    );
}
