import Tooltip from "@mui/material/Tooltip";
import Link from "next/link";

interface NavbarButtonProps {
  navigateTo: string;
  tooltip: string;
  icon: string;
}

export function NavbarButton({ navigateTo, tooltip, icon }: NavbarButtonProps) {
  return (
    <Link href={navigateTo} className="d-inline-block mx-1 nav-link">
      <Tooltip
        title={tooltip}
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
        <button
          type="button"
          className="btn btn-outline-secondary p-1 d-flex align-items-center justify-content-center"
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "1.4rem" }}
          >
            {icon}
          </span>
        </button>
      </Tooltip>
    </Link>
  );
}
