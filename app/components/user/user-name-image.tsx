import Image from "next/image";
import {UserIcon} from "@/app/components/user/user-icon";
type UserImageProps = {
    firstName: string;
    lastName: string;
}


export function UserNameImage({ firstName, lastName }: UserImageProps) {
    return (
        <div className={"d-flex flex-row align-items-center gap-2"}>
            <UserIcon size={40}/>
            <span>{firstName} {lastName}</span>
        </div>
    )
}