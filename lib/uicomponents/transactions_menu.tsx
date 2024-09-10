export default function TransactionsMenu(props: { loggedIn: boolean; }) {
    let loggedIn = props.loggedIn;

    if (!loggedIn) {
        return <></>
    }

    return <ul><li><strong>To Do</strong> Transactions Menu</li></ul>
}