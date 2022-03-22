import {useQueryClient} from "./QueryClientProvider/QueryClientProvider";
import {useEffect, useState} from "react";

export type QueryStatus = 'idle' | 'loading' | 'error' | 'success'

interface QueryObserverBaseResult<TData = unknown, TError = unknown> {
    data: TData | undefined
    dataUpdatedAt: number
    error: TError | null
    errorUpdatedAt: number
    failureCount: number
    isError: boolean
    isFetched: boolean
    isFetchedAfterMount: boolean
    isFetching: boolean
    isIdle: boolean
    isLoading: boolean
    isLoadingError: boolean
    isPlaceholderData: boolean
    isPreviousData: boolean
    isRefetchError: boolean
    isRefetching: boolean
    isStale: boolean
    isSuccess: boolean
    remove: () => void
    status: QueryStatus
}

export type UseQueryResult<TData = unknown,
    TError = unknown> = QueryObserverBaseResult<TData, TError>

export type QueryFunction<T = unknown,
    > = () => T | Promise<T>

export interface Options {
    enabled: boolean;
    debounce?: number;
    retry?: number;
}

const checkArray = (queryKey: Array<string> | string) => Array.isArray(queryKey) ? queryKey[1] : queryKey;

export function useQuery(
    TQueryKey: Array<string> | string,
    asyncFn: () => Promise<any>,
    options: Options,
) {
    const [payload, setPayload] = useState<any>(null);
    const [error, setError] = useState<any>(null);
    const [status, setStatus] = useState<QueryStatus>('idle');
    const data = {
        error,
        isError: status === 'error',
        isFetched: false,
        isLoading: status === 'loading',
        isSuccess: status === 'success',
        status,
        data: payload
    }
    const queryClient = useQueryClient();
    const observer = queryClient.getObserver();

    useEffect(() => {
        (async () => {
            try {
                if (!observer.shouldLoadOnMount(options)) return;

                observer.add(checkArray(TQueryKey), asyncFn, options);
                setStatus('loading');
                const response = await observer.toCallQuery(checkArray(TQueryKey), options);
                console.info('!!')
                console.info('response', response)
                setPayload(response);
                setStatus('success');
            } catch (e) {
                console.log('ERROR', e);
                setError(e);
                setPayload(null);
                setStatus('error');
            }
        })()

        return () => {
            setError(null);
            setPayload(null);
            setStatus('idle');
        }
    }, [options.enabled, checkArray(TQueryKey)]);

    return data
}