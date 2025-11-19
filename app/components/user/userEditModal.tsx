"use client";

import { editUser } from "@/app/actions/editUser";
import { useActionState, useEffect, useState } from "react";
import FieldErrors from "@/app/components/ui/fieldErrors";
import ResponsiveModal from "../ui/responsiveModal";
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
      onClose();
      router.refresh();

      setFormValues({
        first_name: "",
        last_name: "",
        password: "",
        current_password: "",
      });
    }
  }, [state, router, onClose]);

  const canSubmit = Boolean(formValues.first_name && formValues.last_name);

  const inputClass = (hasError: boolean) =>
    `w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition ${
      hasError
        ? "border-red-300 focus:ring-red-200 bg-red-50/30"
        : "border-slate-200 focus:ring-blue-500/50"
    }`;

  return (
    <ResponsiveModal
      id="editUser"
      title="Edit Profile"
      action={action}
      isPending={isPending}
      canSubmit={canSubmit}
      onCancel={onClose}
    >
      <div>
        <label htmlFor="first_name" className="block mb-1.5 text-sm font-medium text-slate-700">
          First Name <span className="text-red-500">*</span>
        </label>
        <input
          id="first_name"
          name="first_name"
          type="text"
          placeholder="Set Your New First Name"
          className={inputClass(!!state?.errors?.first_name?.length)}
          onChange={handleChange}
          value={formValues.first_name}
        />
        <FieldErrors errors={state?.errors?.first_name} />
      </div>

      <div>
        <label htmlFor="last_name" className="block mb-1.5 text-sm font-medium text-slate-700">
          Last Name <span className="text-red-500">*</span>
        </label>
        <input
          id="last_name"
          name="last_name"
          type="text"
          placeholder="Set Your New Last Name"
          className={inputClass(!!state?.errors?.last_name?.length)}
          onChange={handleChange}
          value={formValues.last_name}
        />
        <FieldErrors errors={state?.errors?.last_name} />
      </div>

      <div>
        <label
          htmlFor="current_password"
          className="block mb-1.5 text-sm font-medium text-slate-700"
        >
          Current Password <span className="text-red-500">*</span>
        </label>
        <input
          id="current_password"
          name="current_password"
          type="password"
          placeholder="Enter your current password"
          className={inputClass(!!state?.errors?.current_password?.length)}
          onChange={handleChange}
          value={formValues.current_password}
          required
        />
        <FieldErrors errors={state?.errors?.current_password} />
      </div>

      <div>
        <label htmlFor="password" className="block mb-1.5 text-sm font-medium text-slate-700">
          New Password (optional)
        </label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Leave blank to keep current password"
          className={inputClass(!!state?.errors?.password?.length)}
          onChange={handleChange}
          value={formValues.password}
        />
        <FieldErrors errors={state?.errors?.password} />
      </div>
    </ResponsiveModal>
  );
}