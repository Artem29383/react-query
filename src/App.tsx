import React, {useState} from 'react';
import './App.css';
import InputSearch from "./queries/InputSearch/InputSearch";
import {
    // QueryClient,
    // QueryClientProvider,
} from 'react-query'
// import { ReactQueryDevtools } from 'react-query/devtools'
import Posts from "./queries/Posts/Posts";
import PostsFetch from "./queries/Posts/PostsFetch";
import {BrowserRouter} from "react-router-dom";
import PollingTime from "./queries/PollingTime/PollingTime";
import {QueryClientProvider} from "./QUERY/QueryClientProvider/QueryClientProvider";
import {QueryClient} from "./QUERY/QueryClientProvider/QueryClient";

// export const queryClient = new QueryClient({
//     defaultOptions: {
//         queries: {
//             refetchOnWindowFocus: false,
//         },
//     },
// })

export const queryClient = new QueryClient();

function App() {
    const [show, setToggle] = useState(false);

    return (
        <BrowserRouter>
            <QueryClientProvider client={queryClient}>
                <div>
                    {/*<button onClick={() => setToggle(prevState => !prevState)}>TOGGLE</button>*/}
                    <InputSearch/>
                    {/*<Posts />*/}
                    {/*<PostsFetch />*/}
                    {/*{show && <PollingTime />}*/}
                </div>
                {/*<ReactQueryDevtools />*/}
            </QueryClientProvider>
        </BrowserRouter>
    );
}

export default App;
