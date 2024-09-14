export default function SidebarMenu(props: { name: string; href: string; loggedIn: boolean; }) {
    let {name, href, loggedIn} = props;

    if (!loggedIn) {
        return <></>
    }
    return <ul>
        <li><a href={href}>{name}</a></li>
    </ul>
}