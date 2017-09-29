import * as React from 'react';

export type incrementFunc = () => void;

export default function Counter({count, increment} : {count: number, increment: incrementFunc}) {
    return (
        <div>
            <h1>Count: {count}</h1>
            <p>
                <button className="btn" onClick={increment}>Increment</button>
            </p>
        </div>
    );
}
