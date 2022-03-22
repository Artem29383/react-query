import React from 'react';
import {useQuery} from "react-query";
import axios from "axios";
import {queryClient} from "../../App";

const PollingTime = () => {
    const time = useQuery('time', () => {
        return axios.get('http://worldtimeapi.org/api/timezone/Europe/Moscow').then(res => res.data)
    },
        {
            staleTime: Infinity //never update after mount
        // refetchInterval: 5000,
        // refetchIntervalInBackground: false,
    }
    )

    return (
        <div>
            {/*<button onClick={() => queryClient.invalidateQueries('time')}>UPDATE!!!!!</button>*/}
            <h1>Server time {time.isFetching ? '...' : null}</h1>
            <div>
                {time.isLoading ? 'Loading time...' : new Date(time.data.datetime).toLocaleString()}
            </div>
        </div>
    );
};

export default PollingTime;