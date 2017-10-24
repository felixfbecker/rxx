
# rxx

Reactive JSX

[![Version](https://img.shields.io/npm/v/rxx.svg)](https://www.npmjs.com/package/rxx)
[![Downloads](https://img.shields.io/npm/dt/rxx.svg)](https://www.npmjs.com/package/rxx)
[![Dependency status](https://david-dm.org/felixfbecker/rxx/status.svg)](https://david-dm.org/felixfbecker/rxx#info=dependencies)
[![Build status](https://travis-ci.org/felixfbecker/rxx.svg?branch=master)](https://travis-ci.org/felixfbecker/rxx)
[![License](https://img.shields.io/npm/l/rxx.svg)](https://github.com/felixfbecker/rxx/blob/master/LICENSE.txt)

Use Observables as JSX bindings

## Installation
```
npm install --save rxx
```

## Usage
```jsx
import * as rxx from 'rxx';

const Counter = () => {
    const increments = new Subject()
    const decrements = new Subject()

    const count = merge(increments.mapTo(1), decrements.mapTo(-1))
        .scan((prev, change) => prev + change, 0)

    return (
        <div>
            {count}
            <button onclick={() => increments.next()}>+</button>
            <button onclick={() => decrements.next()}>-</button>   
        </div>
    )
}

document.body.appendChild(<Counter />)
```


## Configuration 

### TypeScript

Add to `tsconfig.json`:

```js
"jsx": "react",
"jsxFactory": "rxx.createElement",
```

### Babel

Add to your `.babelrc`:

```js
"plugins": [
  ["transform-react-jsx", {"pragma": "rxx.createElement"}]
]
```
