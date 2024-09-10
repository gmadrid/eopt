export default function LoginMenu(props: { loggedIn: boolean; }) {
    let loggedIn = props.loggedIn;

    if (!loggedIn) {
        return <ul>
            <li><a href="/login">Login</a></li>
        </ul>
    } else {
        return <ul>
        <li><a href="/logout">Logout</a></li>
        </ul>
    }
}