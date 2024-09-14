export default function SidebarMenu(props: { name: string; href: string; loggedIn: boolean; }) {
    let {name, href, loggedIn} = props;

    if (!loggedIn) {
        return <></>
    }
    return <div>
        <a href={href}>{name}</a>
    </div>
}