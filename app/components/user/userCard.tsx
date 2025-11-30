import { UserIcon } from "@/app/components/user/userIcon";
import { UserEditButton } from "@/app/components/user/userEditButton";
import Tooltip from "@mui/material/Tooltip";
import {useUserStore} from "@/lib/store/userStore";

type UserCardProps = {
  firstName?: string;
  lastName?: string;
};

export function UserCard({ firstName, lastName }: UserCardProps) {
    const displayName =
        [firstName, lastName].filter(Boolean).join(" ") || "Traveler";

    return (
        <div className="d-flex flex-column align-items-center gap-3 text-center">

            {/* Avatar */}
            <div className="position-relative">
                <div
                    className="position-absolute top-0 start-0 end-0 bottom-0 rounded-circle bg-primary"
                    style={{ opacity: 0.2 }}
                />
                <div className="position-relative">
                    <UserIcon size={72} />
                </div>
            </div>

            {/* Name + role */}
            <div>
                <h2 className="fs-4 fw-semibold text-dark mb-1">{displayName}</h2>
                <div className="d-inline-flex align-items-center gap-1 px-3 py-1 rounded-pill bg-light text-secondary small fw-medium">
                <span className="material-icons text-primary" style={{ fontSize: "16px" }}>
                    verified
                </span>
                <span>Traveler</span>
                </div>
            </div>

            {/* Edit button */}
            <div className="w-100 pt-1">
                <Tooltip
                    title="Edit user details"
                    slotProps={{
                        popper: {
                            modifiers: [
                                {
                                    name: "offset",
                                    options: {
                                        offset: [0, -10],
                                    },
                                },
                            ],
                        },
                    }}
                >
                    <UserEditButton
                        size={22}
                        label="Edit Profile"
                        data-bs-toggle="modal"
                        data-bs-target="#editUserModal"
                        className="btn btn-outline-secondary w-100"
                    />
                </Tooltip>
            </div>
        </div>
    );
}
