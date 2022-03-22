import React, {useState} from 'react';
import {useQuery} from "react-query";
import axios from "axios";
import {queryClient} from "../../App";
import {Routes, Route, useParams, NavLink} from "react-router-dom";

const Posts = () => {
    const posts = useQuery('posts', () => {
        return axios.get('https://jsonplaceholder.typicode.com/posts')
            .then(r => r.data);
    }, {
        cacheTime: 10000000,
        onSuccess: data => console.log(data),
        onError: e => console.log(e),
        onSettled: (data, error) => console.log(data, error),
    })

    return (
        <div>
            <h1>posts</h1>
            <div>
                {posts.isLoading ? 'loading posts...' :
                <div>{
                    posts.data.map((p: { id: React.Key | null | undefined; title: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal | null | undefined; }) => <div key={p.id}>
                        <NavLink to={`/${p.id}`}>{p.title}</NavLink>
                    </div>)
                }</div>
                }
            </div>
        </div>
    );
};

const Post = () => {
    const { id } = useParams();
    const post = useQuery(['post', id], () => {
        return axios.get(`https://jsonplaceholder.typicode.com/posts/${id}`)
            .then(r => r.data);
    }, {
        // @ts-ignore
        initialData: () => queryClient.getQueryData('posts')?.find(d => d.id === id),
    })

    return <div>
        <NavLink to='/'>back</NavLink>
        <div>post</div>
        <pre>{JSON.stringify(post.data, null, 2)}</pre>
    </div>
}

const PostsFetch = () => {
    return (
        <Routes>
            <Route path={'/:id'} element={<Post />} />
            <Route path={'/'} element={<Posts />} />
        </Routes>
    );
};

export default PostsFetch;