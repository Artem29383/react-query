import React from 'react';
import './App.css';
import InputSearch from "./queries/InputSearch/InputSearch";
import {
    QueryClient,
    QueryClientProvider,
} from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'
import Posts from "./queries/Posts/Posts";
import PostsFetch from "./queries/Posts/PostsFetch";

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
        },
    },
})

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <div>
                {/*<InputSearch/>*/}
                {/*<Posts />*/}
                <PostsFetch />
            </div>
            <ReactQueryDevtools />
        </QueryClientProvider>
    );
}

export default App;
