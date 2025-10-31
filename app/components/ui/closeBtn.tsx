export function CloseBtn() {
    return (
        <div
            style={{
                    position: "absolute",
                    top: "12px",
                    insetInlineEnd: "12px",
                    width: "22px",
                    height: "22px",
                    borderRadius: "100%"
                }}>
            <div role="button"
                 style={{transition: "background 20ms ease-in", cursor: "pointer", width: "100%", height: "100%", borderRadius: "100%", display: "flex", justifyContent: "center", alignItems: "center"}}>
                <svg aria-hidden="true" role="graphics-symbol" viewBox="0 0 16 16" className="closeSmall"
                     style={{width: "14px", height: "100%", display: "block", flexShrink: 0}}>
                    <path
                        d="M3.732 11.052c-.303.308-.32.877.011 1.202.33.33.894.32 1.203.011L8 9.21l3.05 3.05c.32.325.872.32 1.197-.011a.857.857 0 00.01-1.197L9.21 8.002l3.05-3.056a.857.857 0 00-.01-1.197.857.857 0 00-1.198-.01L8 6.788 4.946 3.732c-.31-.303-.878-.32-1.203.01-.325.331-.314.895-.01 1.203l3.055 3.056-3.056 3.05z"></path>
                </svg>
            </div>
        </div>
    )
}