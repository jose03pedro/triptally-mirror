import Image from "next/image";

type UserImageProps = {
    firstName: string;
    lastName: string;
}

export function UserImage({ firstName, lastName }: UserImageProps) {
    return (
        <div className={"d-flex flex-row align-items-center gap-2"}>
            <div
                className="user-icon rounded-circle overflow-hidden"
                style={{width: "40px", height: "40px"}}>
                <Image
                    src={`/default-profile.png`}
                    alt="Profile"
                    width={50}
                    height={50}
                />
            </div>
            <span>{firstName} {lastName}</span>
        </div>
    )
}