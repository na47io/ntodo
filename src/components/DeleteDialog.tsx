import { compose } from "@/utils.ts";
import { signal } from "@preact/signals";

export interface DeleteDialogProps {
    open: boolean;
    id: string;
    childTaskCount: number;
}
export const deleteDialogOpen = signal<DeleteDialogProps>({
    open: false,
    id: "",
    childTaskCount: 0,
});

export function DeleteDialog({ open, onCancel, onConfirm }: {
    open: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}) {
    return (
        <dialog open={open}>
            <article>
                <h6>Delete task (and its children!)</h6>
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
                        Delete Task
                    </button>
                </footer>
            </article>
        </dialog>
    );
}
