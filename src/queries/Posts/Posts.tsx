import React from 'react';
import {useQuery} from "react-query";
import axios from "axios";

const email = 'Sincere@april.biz'

const Posts = () => {
    const userQuery = useQuery('user', () => {
        return axios.get(`https://jsonplaceholder.typicode.com/users?email=${email}`)
            .then(r => r.data[0]);
    })

    const postsQuery = useQuery('posts', () => {
        return axios.get(`https://jsonplaceholder.typicode.com/posts?userId=${userQuery.data.id}`)
            .then(r => r.data);
    }, {
        enabled: !!userQuery.data?.id
    })

    return (
        <div>
            {userQuery.isLoading ? 'loading user...' : <div>
                <div>Username: {userQuery.data.name}</div>
                <div>Id: {userQuery.data.id}</div>
                <pre>INFORMATION: {JSON.stringify(userQuery.data, null, 2)}</pre>
                <div>Posts count: {postsQuery.isIdle ? null :
                    postsQuery.isLoading ?
                        'posts loading...' :
                        postsQuery.data.length
                }</div>
            </div>}
        </div>
    );
};

export default Posts;