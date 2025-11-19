type DeleteBtnProps = {
    color?: string,
    size?: number,
    action: string,
}

export function ActionBtn({ color = '#94a3b8', size = 20, action}: DeleteBtnProps) {
    return (
        <div role="button" className="flex cursor-pointer hover:opacity-75 transition p-1 rounded-full hover:bg-slate-100">
            <span className="material-icons" style={{ color: color, fontSize: `${size}px` }}
        >{action}</span>
        </div>
    )
}
