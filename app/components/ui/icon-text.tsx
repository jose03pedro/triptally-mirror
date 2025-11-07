type IconTextProps = {
    icon : string,
    text: string
}

export default function IconText({icon, text}: IconTextProps) {
    return (
        <div className="d-flex gap-2">
            <span className="material-icons md-dark">{ icon }</span>
            <span>{ text }</span>
        </div>
    )
}