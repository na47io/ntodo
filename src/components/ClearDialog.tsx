import { compose } from "@/utils.ts";
import { signal } from "@preact/signals";

export const clearDialogOpen = signal(false);
export function ClearDialog({ open, onCancel, onConfirm, totalTodos }: {
    open: boolean;
    onCancel: () => void;
    onConfirm: () => void;
    totalTodos: number;
}) {
    const itemItems = totalTodos === 1 ? "item" : "items";
    return (
        <dialog open={open}>
            <article>
                <h6>Clear {totalTodos} {itemItems}</h6>
                <p>
                    ⚠️ Be <strong>careful</strong>! There is no turning back.
                </p>
                <footer>
                    <button
                        onClick={onCancel}
                        class="secondary"
                    >
                        Cancel
                    </button>
                    <button
                        className="outline"
                        onClick={compose(onConfirm, onCancel)}
                    >
                        Clear {totalTodos} {itemItems}
                    </button>
                </footer>
            </article>
        </dialog>
    );
}
