import Image from "next/image";

type UserIconProps = {
    url?: string;
    size: number;
}

export function UserIcon({ url, size } : UserIconProps) {
    const src = url ? url :"/default-profile.png";

    return <div
        className="user-icon rounded-circle overflow-hidden"
        style={{width: size, height: size}}>
        <Image
            src={ src }
            alt="Profile"
            width={size}
            height={size}
        />
    </div>
}