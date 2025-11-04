import {CloseBtn} from "@/app/components/ui/closeBtn";
import {ReactNode} from "react";

interface FormModalProps {
    id: string;
    title: string;
    action: any;
    children: ReactNode;
    isPending?: boolean;
}

export default function FormModal({ id, title, action, children, isPending = false }: FormModalProps) {
    return (
        <div className="modal fade"
             id={`${id}Modal`}
             role="dialog"
             aria-labelledby={`${id}ModalLabel`}
             aria-hidden="true"
             data-bs-backdrop="static"
        >
            <div className="modal-dialog" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title fs-6" id={`${id}ModalLabel`}>{title}</h5>
                        <div data-bs-dismiss="modal" aria-label="Close"><CloseBtn/></div>
                    </div>

                    <form id={`${id}ModalForm`} action={action}>
                        <div className="modal-body">
                            {children}
                        </div>

                        <div className="modal-footer">
                            <button type="button" className="btn " data-bs-dismiss="modal">Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={isPending}>Create</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}