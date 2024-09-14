export default async function ping(msg: string) {
    // TODO: get this host name out of here.
    await fetch("http://localhost:3333/api/ping?m=" + msg);
}
