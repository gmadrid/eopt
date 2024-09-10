import {useContext} from "react";

export default function AccountsMenu(props: { loggedIn: boolean; }) {
    let loggedIn = props.loggedIn;

    if (!loggedIn) {
        return <></>
    }
    return <ul><li><strong>To Do</strong> Accounts Menu</li></ul>
}