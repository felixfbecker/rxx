import { Observable } from 'rxjs/Observable'
import { empty } from 'rxjs/observable/empty'
import { of as observableOf } from 'rxjs/observable/of'
import { catchError } from 'rxjs/operators/catchError'
import { concatMap } from 'rxjs/operators/concatMap'
import { map } from 'rxjs/operators/map'
import { switchMap } from 'rxjs/operators/switchMap'
import { withLatestFrom } from 'rxjs/operators/withLatestFrom'
import { Subject } from 'rxjs/Subject'
import * as rxx from '../index'

const updateProfile = (username: string, firstName: string, lastName: string): Observable<never> => empty()
const fetchProfile = (username: string) => observableOf({ firstName: username, lastName: username })

export interface Props {
    usernames: Observable<string>
}

export class Form extends HTMLElement {

    private alertDismisses = new Subject<void>()
    private firstNameValues = new Subject<string>()
    private lastNameValues = new Subject<string>()
    private submits = new Subject<void>()
    private saving = new Subject<boolean>()
    private errors = new Subject<any>()

    constructor(props: Props) {
        super()

        this.alertDismisses.subscribe(this.errors)

        props.usernames
            .pipe(switchMap(username =>
                fetchProfile(username)
                    .pipe(catchError(error => {
                        this.errors.next(error)
                        return []
                    }))
            ))
            .subscribe()

        this.submits
            .pipe(withLatestFrom(props.usernames, this.firstNameValues, this.lastNameValues))
            .pipe(concatMap(([, username, firstName, lastName]) =>
                updateProfile(username, firstName, lastName)
                    .pipe(catchError(error => {
                        this.errors.next(error)
                        return []
                    }))
            ))
            .subscribe()

        this.appendChild(
            <div>
                <h1>Profile</h1>

                {
                    this.errors.pipe(map(error => error &&
                        <div className='alert alert-danger'>
                            {error.message}
                            <button onclick={() => this.alertDismisses.next()}>x</button>
                        </div>
                    ))
                }

                {props.usernames}

                <label>
                    First Name
                    <input type='text' value={this.firstNameValues} onchange={e => this.firstNameValues.next((e.currentTarget as HTMLInputElement).value)}/>
                </label>

                <label>
                    Last Name
                    <input type='text' value={this.lastNameValues} onchange={e => this.lastNameValues.next((e.currentTarget as HTMLInputElement).value)}/>
                </label>

                <button type='submit' disabled={this.saving} onsubmit={() => this.submits.next()}>Update</button>

                {this.saving.pipe(map(isLoading => isLoading && 'Loading...'))}
            </div>
        )
    }
}
