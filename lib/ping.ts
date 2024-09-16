import EoptConfig from "@/lib/eopt_config";

export default async function ping(msg: string) {
    await fetch(`${EoptConfig.server_self_url}api/ping?m=` + msg);
}
