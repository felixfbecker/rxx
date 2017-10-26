import { merge } from 'rxjs/observable/merge'
import { mapTo } from 'rxjs/operators/mapTo'
import { scan } from 'rxjs/operators/scan'
import { Subject } from 'rxjs/Subject'
import * as rxx from '../index'

export const Counter = () => {
    const increments = new Subject()
    const decrements = new Subject()

    const count = merge(
        increments.pipe(mapTo(1)),
        decrements.pipe(mapTo(-1))
    )
        .pipe(scan((prev, change) => prev + change, 0))

    return (
        <div>
            {count}
            <button onclick={() => increments.next()}>+</button>
            <button onclick={() => decrements.next()}>-</button>
        </div>
    )
}
