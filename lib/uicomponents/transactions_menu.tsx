export default function TransactionsMenu(props: { loggedIn: boolean; }) {
    let loggedIn = props.loggedIn;

    if (!loggedIn) {
        return <></>
    }
    return <ul>
        <li><a href="/transactions">Transactions</a></li>
    </ul>
}