export default function LoginMenu(props: { loggedIn: boolean; }) {
    let loggedIn = props.loggedIn;

    if (!loggedIn) {
        return <ul>
            <li><a href="/nologin/login">Login</a></li>
        </ul>
    } else {
        return <ul>
            <li><a href="/nologin/logout">Logout</a></li>
        </ul>
    }
}