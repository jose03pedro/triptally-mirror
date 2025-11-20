"use client";

import { editUser } from "@/app/actions/editUser";
import { useActionState, useEffect, useState } from "react";
import FieldErrors from "@/app/components/ui/fieldErrors";
import FormModal from "../ui/formModal";
import { useRouter } from "next/navigation";

export default function UserEditModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const initialState = {
    success: false,
    errors: {
      first_name: [],
      last_name: [],
      password: [],
      current_password: [],
    },
  };

  const [state, action, isPending] = useActionState(editUser, initialState);
  const [formValues, setFormValues] = useState({
    first_name: "",
    last_name: "",
    password: "",
    current_password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (state?.success) {
      // Close the modal programmatically by clicking the dismiss button
      const closeBtn = document.querySelector('#editUserModal [data-bs-dismiss="modal"]') as HTMLElement;
      if (closeBtn) {
        closeBtn.click();
      }
      
      // Additional cleanup just in case
      document.body.classList.remove("modal-open");
      document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());

      router.refresh(); // forces server layouts/pages to re-read cookies

      setFormValues({
        first_name: "",
        last_name: "",
        password: "",
        current_password: "",
      });
    }
  }, [state, router]);

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