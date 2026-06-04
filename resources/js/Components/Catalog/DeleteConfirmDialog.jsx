import Modal from "@/Components/Modal";
import Button from "../ui/Button";

export default function DeleteConfirmDialog({
    show = false,
    title = "Delete item?",
    description = "",
    confirmText = "Delete",
    processing = false,
    onClose = () => {},
    onConfirm = () => {},
}) {
    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            <div className="p-6 md:p-8 bg-card rounded-2xl">
                <h2 className="mb-2 text-2xl font-semibold text-primary-text">
                    {title}
                </h2>
                <p className="mb-6 text-sm text-secondary-dark">
                    {description}
                </p>

                <div className="flex justify-end gap-3">
                    <Button onClick={onClose} disabled={processing}>
                        Cancel
                    </Button>
                    <Button
                        variant="danger"
                        onClick={onConfirm}
                        disabled={processing}
                    >
                        {processing ? "Deleting..." : confirmText}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
