"use client";

import { editUser } from "@/app/actions/user/editUser";
import {useActionState, useEffect, useMemo, useState} from "react";
import FieldErrors from "@/app/components/ui/fieldErrors";
import FormModal from "../ui/formModal";
import { useRouter } from "next/navigation";
import UploadAvatars from "@/app/components/user/uploadAvatars";
import {useUserStore} from "@/lib/store/userStore";

declare const bootstrap: any;

interface UserEditModalProps {
    onClose: () => void;
    updateUser: (user: any) => void;
}

export default function UserEditModal({ onClose, updateUser }: UserEditModalProps) {
  const {user} = useUserStore();

  const initialState = {
    success: false,
    errors: {
      first_name: [],
      last_name: [],
      password: [],
      current_password: [],
    },
  };

    const formInitialState = useMemo(() => ({
        first_name: user?.first_name || "",
        last_name: user?.last_name || "",
        password: "",
        current_password: "",
        avatar: user?.avatar || "",
    }), [user]);

    const [state, action, isPending] = useActionState(editUser, initialState);
  const [formValues, setFormValues] = useState(formInitialState);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

    useEffect(() => {
        if (!state?.success) return;

        // Close modal
        const modalEl = document.getElementById("editUserModal");
        const modal = bootstrap.Modal.getInstance(modalEl);
        modal?.hide();

        if (state.user) updateUser(state.user);

        setFormValues({
            ...formInitialState,
            first_name: state.user?.first_name || "",
            last_name: state.user?.last_name || "",
            avatar: state.user?.avatar || "",
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state?.success, state.user]);

    const canSubmit = Boolean(formValues.first_name && formValues.last_name);

  return (
    <FormModal
      id="editUser"
      title="Edit Profile"
      action={action}
      isPending={isPending}
      canSubmit={canSubmit}
      onClose={onClose}
      submitLabel="Save"
      pendingLabel="Saving..."
    >
      <UploadAvatars />
      <div className="mb-2">
        <label htmlFor="first_name" className="form-label text-secondary mb-0">
          First Name <span className="text-danger">*</span>
        </label>
        <input
          id="first_name"
          name="first_name"
          type="text"
          placeholder="Set Your New First Name"
          className={`form-control fs-6 ${
            state?.errors?.first_name?.length ? "is-invalid" : ""
          }`}
          onChange={handleChange}
          value={formValues.first_name}
        />
        <FieldErrors errors={state?.errors?.first_name} />
      </div>

      <div className="mb-2">
        <label htmlFor="last_name" className="form-label text-secondary mb-0">
          Last Name <span className="text-danger">*</span>
        </label>
        <input
          id="last_name"
          name="last_name"
          type="text"
          placeholder="Set Your New Last Name"
          className={`form-control fs-6 ${
            state?.errors?.last_name?.length ? "is-invalid" : ""
          }`}
          onChange={handleChange}
          value={formValues.last_name}
        />
        <FieldErrors errors={state?.errors?.last_name} />
      </div>

      <div className="mb-2">
        <label
          htmlFor="current_password"
          className="form-label text-secondary mb-0"
        >
          Current Password <span className="text-danger">*</span>
        </label>
        <input
          id="current_password"
          name="current_password"
          type="password"
          placeholder="Enter your current password"
          className={`form-control fs-6 ${
            state?.errors?.current_password?.length ? "is-invalid" : ""
          }`}
          onChange={handleChange}
          value={formValues.current_password}
          required
        />
        <FieldErrors errors={state?.errors?.current_password} />
      </div>

      <div className="mb-2">
        <label htmlFor="password" className="form-label text-secondary mb-0">
          New Password (optional)
        </label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Leave blank to keep current password"
          className={`form-control fs-6 ${
            state?.errors?.password?.length ? "is-invalid" : ""
          }`}
          onChange={handleChange}
          value={formValues.password}
        />
        <FieldErrors errors={state?.errors?.password} />
      </div>
    </FormModal>
  );
}