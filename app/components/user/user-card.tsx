import Image from "next/image";

type UserCardProps = {
    firstName: string;
    lastName: string;
}

export function UserCard({ firstName, lastName }: UserCardProps) {
    return (
        <>
            <div className={"d-flex flex-row align-items-center gap-4"}>
                <div
                    className="user-icon rounded-circle overflow-hidden"
                    style={{width: "120px", height: "120px"}}>
                    <Image
                        src={`/default-profile.png`}
                        alt="Profile"
                        width={120}
                        height={120}
                    />
                </div>

                <div className="user-info">
                    <p className="mb-0 fw-bold fs-5">{firstName} {lastName}</p>
                </div>
            </div>
        </>
    );
}
