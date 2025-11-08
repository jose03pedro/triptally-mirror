type IconTextProps = {
    icon : string,
    text: string
    size?: number
    color?: string
}

export default function IconText({icon, text, size = 20, color = "#000"}: IconTextProps) {
    return (
        <div className="d-flex gap-1 align-items-center">
            <span className="material-icons md-dark" style={{ fontSize: size, color: color }}>{ icon }</span>
            <span style={{ fontSize: size / 1.3, color: color }}>{ text } </span>
        </div>
    )
}