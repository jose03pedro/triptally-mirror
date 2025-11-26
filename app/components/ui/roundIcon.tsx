import Image from "next/image";

type RoundIconProps = {
  url: string;
  size: number;
  description: string;
};

export function RoundIcon({ url, size, description }: RoundIconProps) {
  return (
    <div
      className="rounded-circle overflow-hidden"
      style={{ width: size, height: size, objectFit: "cover" }}
    >
      <Image src={url} alt={description} width={size} height={size} />
    </div>
  );
}
