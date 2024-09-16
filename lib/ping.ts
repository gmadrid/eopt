export default async function ping(msg: string) {
    await fetch("http://localhost:3333/api/ping?m=" + msg);
}
