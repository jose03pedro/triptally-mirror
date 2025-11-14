import { RotatingLines } from "react-loader-spinner";

export function Loading() {
  return (
    <div className="w-100 d-flex justify-content-center align-items-center">
      <RotatingLines
        strokeColor="grey"
        strokeWidth="5"
        animationDuration="0.75"
        width="45"
        visible={true}
      />
    </div>
  );
}
