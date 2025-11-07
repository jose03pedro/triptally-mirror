type DeleteBtnProps = {
    color?: string,
    size?: number,
    action: string,
}

export function ActionBtn({ color = '#adb5bd', size = 20, action}: DeleteBtnProps) {
    return (
        <div role="button" className="d-flex">
            <span className="material-icons md-dark" style={{ color: color, fontSize: `${size}px` }}
        >{action}</span>
        </div>
    )
}