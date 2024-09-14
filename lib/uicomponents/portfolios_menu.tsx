export default function PortfoliosMenu(props: { loggedIn: boolean; }) {
    let loggedIn = props.loggedIn;

    if (!loggedIn) {
        return <></>
    }
    return <ul>
        <li><a href="/portfolios">Portfolios</a></li>
    </ul>
}