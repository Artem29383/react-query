import React, {useState} from 'react';
import {useQuery} from "react-query";
import axios from "axios";
import {queryClient} from "../../App";

// @ts-ignore
const Posts = ({ setPostId }) => {
    const posts = useQuery('posts', () => {
        return axios.get('https://jsonplaceholder.typicode.com/posts')
            .then(r => r.data);
    })

    return (
        <div>
            <h1>posts</h1>
            <div>
                {posts.isLoading ? 'loading posts...' :
                <div>{
                    posts.data.map((p: { id: React.Key | null | undefined; title: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal | null | undefined; }) => <div key={p.id}>
                        <a href="#" onClick={() => setPostId(p.id)}>{p.title}</a>
                    </div>)
                }</div>
                }
            </div>
        </div>
    );
};

// @ts-ignore
const Post = ({ id, setPostId }) => {
    const post = useQuery(['post', id], () => {
        return axios.get(`https://jsonplaceholder.typicode.com/posts/${id}`)
            .then(r => r.data);
    }, {
        // @ts-ignore
        initialData: () => queryClient.getQueryData('posts')?.find(d => d.id === id),
    })

    return <div>
        <a href="#" onClick={() => setPostId(null)}>back</a>
        <div>post</div>
        <pre>{JSON.stringify(post.data, null, 2)}</pre>
    </div>
}

const PostsFetch = () => {
    const [postId, setPostId] = useState(null);
    return (
        <div>
            {!postId ? <Posts setPostId={setPostId} /> : <Post id={postId} setPostId={setPostId} />}
        </div>
    );
};

export default PostsFetch;