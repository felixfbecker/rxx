
import { Observable } from 'rxjs/Observable'
import { of as observableOf } from 'rxjs/observable/of'
import { observable as observableSymbol } from 'rxjs/symbol/observable'

export const isNode = (val: any): val is Node =>
    !!val && typeof val.nodeType === 'number'

export const isArrayLike = (val: any): val is ArrayLike<any> =>
    !!val && typeof val === 'object' && typeof val.length === 'number' && typeof val.nodeType !== 'number'

export const isIterable = (val: any): val is Iterable<any> =>
    !!val && typeof val[Symbol.iterator] === 'function'

export const isObservable = (val: any): val is Observable<any> =>
    !!val && typeof val[observableSymbol] === 'function'

export const toObservable = <T>(value: T | Observable<T>): Observable<T> => isObservable(value) ? value : observableOf(value)

export const toArray = <T>(value: T | Iterable<T>): T[] => isIterable(value) ? Array.from(value) : [value]
