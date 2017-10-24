import * as assert from 'assert'
import { JSDOM } from 'jsdom'
import { Observable } from 'rxjs/Observable'
import { Subject } from 'rxjs/Subject'
import * as rxx from '../index'
import { isObservable } from '../util'

describe('rxx', () => {

    before(() => {
        // TODO don't patch global environment
        const jsdom = new JSDOM();
        (global as any).window = jsdom.window;
        (global as any).document = jsdom.window.document
    })

    it('creates a <div> element', () => {
        assert.equal((<div id='hello'>world</div>).outerHTML, '<div id="hello">world</div>')
    })

    it('supports binding a scalar as a prop', () => {

        const classNames = 'hello world'
        const element = <div className={classNames}></div>

        assert.equal(element.outerHTML, '<div class="hello world"></div>')
    })

    it('supports binding an Observable as a prop', () => {

        const classNames = new Subject<string>()
        const element = <div className={classNames}></div>

        classNames.next('hello')
        assert.equal(element.outerHTML, '<div class="hello"></div>')

        classNames.next('world')
        assert.equal(element.outerHTML, '<div class="world"></div>')
    })

    it('supports binding scalars as content', () => {

        const content = 'hello world'
        const element = <div>{content}</div>

        assert.equal(element.outerHTML, '<div>hello world</div>')
    })

    it('supports binding an Observable as content', () => {

        const content = new Subject<JSX.Element>()
        const element = <div>{content}</div>

        assert.equal(element.outerHTML, '<div><!-- not rendered --></div>')

        content.next(<span>hello</span>)
        assert.equal(element.outerHTML, '<div><span>hello</span></div>')

        content.next(<span>world</span>)
        assert.equal(element.outerHTML, '<div><span>world</span></div>')
    })

    it('supports function components', () => {

        const Component = (props: { foo: number, bar: Observable<number> }): JSX.Element => {
            assert.equal(props.foo, 1)
            assert(isObservable(props.bar), 'Expected b to be Observable')
            return <div>{props.foo} {props.bar}</div>
        }

        const bars = new Subject<number>()
        const element = <Component foo={1} bar={bars} />

        assert.equal(element.outerHTML, '<div>1 <!-- not rendered --></div>')
        bars.next(1)
        assert.equal(element.outerHTML, '<div>1 1</div>')
        bars.next(2)
        assert.equal(element.outerHTML, '<div>1 2</div>')
    })
})
