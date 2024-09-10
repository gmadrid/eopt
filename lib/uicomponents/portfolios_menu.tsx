export default function PortfoliosMenu(props: { loggedIn: boolean; }) {
    let loggedIn = props.loggedIn;

    if (!loggedIn) {
        return <></>
    }

    return <ul><li><strong>To Do</strong> Portfolios Menu</li></ul>
}