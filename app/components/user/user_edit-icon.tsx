import Image from "next/image";

type EditIconProps = {
    size: number;
}

export function EditIcon({ size }: EditIconProps) {
    return <div
        className="edit-icon"
        style={{width: size, height: size}}>
        <Image
            src="/icons/edit.png"
            alt="Edit Profile"
            width={size}
            height={size}
        />
    </div>
}