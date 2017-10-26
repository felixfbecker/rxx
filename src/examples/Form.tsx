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

export const Form = ({ usernames }: Props): JSX.Element => {

    const alertDismisses = new Subject<void>()
    const firstNameValues = new Subject<string>()
    const lastNameValues = new Subject<string>()
    const submits = new Subject<void>()
    const saving = new Subject<boolean>()
    const errors = new Subject<any>()

    alertDismisses.subscribe(errors)

    usernames
        .pipe(switchMap(username =>
            fetchProfile(username)
                .pipe(catchError(error => {
                    errors.next(error)
                    return []
                }))
        ))
        .subscribe()

    submits
        .pipe(withLatestFrom(usernames, firstNameValues, lastNameValues))
        .pipe(concatMap(([, username, firstName, lastName]) =>
            updateProfile(username, firstName, lastName)
                .pipe(catchError(error => {
                    errors.next(error)
                    return []
                }))
        ))
        .subscribe()

    return (
        <div>
            <h1>Profile</h1>

            {
                errors.pipe(map(error => error &&
                    <div className='alert alert-danger'>
                        {error.message}
                        <button onclick={() => alertDismisses.next()}>x</button>
                    </div>
                ))
            }

            {usernames}

            <label>
                First Name
                <input type='text' value={firstNameValues} onchange={e => firstNameValues.next((e.currentTarget as HTMLInputElement).value)}/>
            </label>

            <label>
                Last Name
                <input type='text' value={lastNameValues} onchange={e => lastNameValues.next((e.currentTarget as HTMLInputElement).value)}/>
            </label>

            <button type='submit' disabled={saving} onsubmit={() => submits.next()}>Update</button>

            {saving.pipe(map(isLoading => isLoading && 'Loading...'))}
        </div>
    )
}
