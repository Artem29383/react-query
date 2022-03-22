import React, {useState} from 'react';
// import {useQuery} from 'react-query';
import axios from 'axios';
import {useQuery} from "../../QUERY/useQuery";

const InputSearch = () => {
    const [pokemon, setPokemon] = useState('');
    const query = useQuery(['pokemon', pokemon], () => {
        return axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemon}`).then(r => r.data);
    }, {
        enabled: !!pokemon,
        debounce: 1000,
        retry: 3
    });
    // const query = useQuery(['pokemon', pokemon],
    //     () => {
    //     // @ts-ignore
    //         const source = CancelToken.source();
    //         const promise = new Promise(resolve => setTimeout(resolve, 1000))
    //             .then(() => {
    //                return axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemon}`, {
    //                     cancelToken: source.token,
    //                 })
    //             })
    //         .then((res: { data: any }) => res.data);
    //
    //         // @ts-ignore
    //         promise.cancel = () => {
    //             source.cancel('CANCEL!');
    //         }
    //
    //         return promise;
    // }, {
    //     retry: 0,
    //     enabled: !!pokemon
    // });

    return (
        <div>
            <input type="text" value={pokemon} onChange={e => setPokemon(e.target.value)}/>
            {/* @ts-ignore */}
            <div>{(query.isLoading) ? 'loading' : query.isError ? query.error?.message : query.data ? <div>
                <p>name: {query.data?.name}</p>
                <img src={query.data?.sprites.back_default} alt=""/>
            </div> : null}</div>
        </div>
    );
};

export default InputSearch;