import React, {useContext} from 'react'
import {QueryClient} from "./QueryClient";
import {Observer} from "../Observer";


declare global {
    interface Window {
        // @ts-ignore
        ReactQueryClientContext?: React.Context<QueryClient | undefined>
    }
}

const defaultContext = React.createContext<QueryClient | undefined>(undefined)
const QueryClientSharingContext = React.createContext<boolean>(false)

function getQueryClientContext(contextSharing: boolean): any {
    if (contextSharing && typeof window !== 'undefined') {
        if (!window.ReactQueryClientContext) {
            // @ts-ignore
            window.ReactQueryClientContext = defaultContext
        }

        return window.ReactQueryClientContext
    }

    return defaultContext
}

export const useQueryClient = () => {
    const ctx = useContext(QueryClientSharingContext);
    const queryClient = useContext(getQueryClientContext(ctx))

    if (!queryClient) {
        throw new Error('No QueryClient set, use QueryClientProvider to set one')
    }

    return queryClient as QueryClient
}

export interface QueryClientProviderProps {
    client: QueryClient
    contextSharing?: boolean
}

export const QueryClientProvider: React.FC<QueryClientProviderProps> = ({
    client,
    contextSharing = false,
    children,
}) => {
    client.mount();
    const Context = getQueryClientContext(contextSharing)

    return (
        <QueryClientSharingContext.Provider value={contextSharing}>
            <Context.Provider value={client}>{children}</Context.Provider>
        </QueryClientSharingContext.Provider>
    )
}
