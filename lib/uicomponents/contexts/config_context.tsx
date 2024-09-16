'use client';

import React, {createContext} from "react";
import {EoptConfigImmutable} from "@/lib/eopt_config";

type ConfigContextType = EoptConfigImmutable;

export let ConfigContext = createContext<ConfigContextType>({} as EoptConfigImmutable);

export default function ConfigContextComponent(props: { config: EoptConfigImmutable, children: React.ReactNode; }) {
    let [config] = React.useState(props.config);

    return <ConfigContext.Provider value={config}>
        {props.children}
    </ConfigContext.Provider>
}
