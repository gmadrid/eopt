export default function AccountsMenu(props: { loggedIn: boolean; }) {
    let loggedIn = props.loggedIn;

    if (!loggedIn) {
        return <></>
    }
    return <ul>
        <li><a href="/accounts">Accounts</a></li>
    </ul>
}