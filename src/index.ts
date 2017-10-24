import { Observable } from 'rxjs/Observable'
import { startWith } from 'rxjs/operators/startWith'
import { isNode, isObservable, toArray, toObservable } from './util'

declare global {
    namespace JSX {
        /**
         * The result of a JSX expression
         */
        type Element = HTMLElement

        /**
         * What's accepted as children
         */
        type ConstChild = Node | string | number | boolean | null | undefined
        type ConstChildren = ConstChild | Iterable<ConstChild>
        type Child = Observable<ConstChildren> | ConstChildren
        type Children = Child | Iterable<Child>

        /**
         * The Map from HTML element tag names to the properties that can be assigned to them
         */
        type IntrinsicElements = {
            [N in keyof HTMLElementTagNameMap]: Partial<ObservableProps<HTMLElementTagNameMap[N] & { _children: Children }>>
        }

        /**
         * Intentionally empty as we don't add any special properties like `ref` or `key`
         */
        interface IntrinsicAttributes {}

        interface ElementChildrenAttribute {
            _children: any
        }
    }
}

/**
 * Mapped type that allows every property of T to be Observable
 */
export type ObservableProps<T> = {
    [K in keyof T]: T[K] | Observable<T[K]>
}

/**
 * Signature of a function that receives JSX properties and returns the DOM elements to be rendered.
 */
export type Factory<P> = (props: P) => JSX.Children

/**
 * @param tagName HTML element tag name
 */
export function createElement<N extends keyof JSX.IntrinsicElements>(tagName: N, props?: JSX.IntrinsicElements[N], ...children: JSX.Child[]): JSX.Children
/**
 * @param factory Factory function that receives props and returns a JSX element
 */
export function createElement<P>(factory: Factory<P>, props?: P, ...children: JSX.Child[]): JSX.Children
export function createElement(tagOrFactory: keyof HTMLElementTagNameMap | Factory<any> | null, props: any, ...children: JSX.Child[]): JSX.Children {
    if (!props) {
        props = {}
    }
    if (typeof tagOrFactory === 'string') {
        return createHTMLElement(tagOrFactory, props, ...children)
    }
    if (typeof tagOrFactory === 'function') {
        return tagOrFactory(props)
    }
    throw Object.assign(new Error('Expected tag name or factory function'), { actual: tagOrFactory })
}

function createHTMLElement<N extends keyof HTMLElementTagNameMap>(tagName: N, props: JSX.IntrinsicElements[N] | null, ...children: JSX.Child[]): HTMLElement {
    const element = document.createElement(tagName)
    for (const [key, value] of Object.entries(props || null)) {
        if (key === '_children') {
            continue
        }
        if (isObservable(value)) {
            value.subscribe(value => {
                element[key as keyof typeof element] = value
            }, err => {
                throw err
            })
        } else {
            element[key as keyof typeof element] = value
        }
    }
    for (const child of children) {
        let prev: Node[] = []
        // This Observable emits whenever the corresponding DOM node(s) should be replaced
        toObservable(child)
            // Render a comment node at the beginning so we have an anchor to insert subsequent updates at
            .pipe(startWith(null))
            .subscribe(curr => {
                const currArr = toArray(curr)
                // Insert all the new nodes before the first old node (in order)
                const newNodes = currArr.map(c => {
                    const node = createNode(c)
                    element.insertBefore(node, prev[0] || null)
                    return node
                })
                // Remove all old nodes
                for (const p of prev) {
                    element.removeChild(p)
                }
                prev = newNodes
            })
    }
    return element
}

function createNode(child: JSX.ConstChild): Node {
    if (typeof child === 'string' || typeof child === 'number' || child === true) {
        return document.createTextNode(child + '')
    }
    if (child === null || child === undefined || child === false) {
        return document.createComment(' not rendered ')
    }
    if (isNode(child)) {
        return child
    }
    throw new Error('Invalid child')
}
