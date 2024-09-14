export default function LoginMenu(props: { loggedIn: boolean; }) {
    let loggedIn = props.loggedIn;

    if (!loggedIn) {
        return <div>
            <a href="/nologin/login">Login</a>
        </div>
    } else {
        return <div>
            <a href="/nologin/logout">Logout</a>
        </div>
    }
}