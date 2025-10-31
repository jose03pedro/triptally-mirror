import Image from "next/image";
import {UserIcon} from "@/app/components/user/user-icon";

type UserCardProps = {
    firstName: string;
    lastName: string;
}

export function UserCard({ firstName, lastName }: UserCardProps) {
    return (
        <>
            <div className={"d-flex flex-row align-items-center gap-4"}>
                <UserIcon size={120}/>

                <div className="user-info">
                    <p className="mb-0 fw-bold fs-5">{firstName} {lastName}</p>
                </div>
            </div>
        </>
    );
}
