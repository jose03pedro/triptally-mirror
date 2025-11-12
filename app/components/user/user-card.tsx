import { UserIcon } from "@/app/components/user/user-icon";
import { EditIconButton } from "@/app/components/user/user_edit-icon";
import EditUserModal from "./user-edit-modal";
import IconText from "../ui/icon-text";

type UserCardProps = {
  firstName: string;
  lastName: string;
};

export function UserCard({ firstName, lastName }: UserCardProps) {
  return (
    <>
    <div className={"d-flex flex-row align-items-center gap-4"}>
      <UserIcon size={120} />

      <div className="user-info">
        <p className="mb-0 fw-bold fs-5">
        {firstName} {lastName}
        </p>
      </div>

      <EditIconButton modalId="editUserModal" size={22} ariaLabel="Edit Profile" data-bs-toggle="modal" data-bs-target="#editUser" />
      <EditUserModal />

    </div>
    </>
  );
}
