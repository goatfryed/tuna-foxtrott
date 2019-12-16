import {isUserPlayer, User, UserPlayer} from "../../model";
import {Adventure, GameSummary} from "../../model/Adventure";
import {observable, when} from "mobx";
import {ActionManager} from "../../actions/ActionManager";

export class AdventureManager {

    readonly userPlayer: UserPlayer;
    @observable.ref started: Date|undefined = undefined;
    @observable.ref finished: Date|undefined = undefined;

    private readonly _actionManager: ActionManager;

    get actionManager() {
        return this._actionManager;
    }

    constructor(
        readonly adventure: Adventure,
        readonly user: User,
    ) {
        const userPlayer = adventure.players
            .filter(isUserPlayer)
            .filter(p => p.user === user)
            [0];
        if (!userPlayer) throw new Error("given user not set on adventure");
        this.userPlayer = userPlayer;
        this._actionManager = new ActionManager(this.adventure);
    }

    public start(): void {
        this.started = new Date();
        this.adventure.setup();

        when(
            () => this.adventure.isLost() || this.adventure.isWon(),
            () => {
                this.finished = new Date();
            }
        );
        this.adventure.dispatcher.addListener(
            "UNIT_PREP_PHASE",
            () => {
                this._actionManager.clearIntent();
            }
        )
    }

    getSummary(): Readonly<GameSummary>|undefined {
        if (!this.finished || !this.started) {
            return undefined;
        }

        return {
            started: this.started,
            finished: this.finished,
            won: this.adventure.isWon()
        }
    }

    tearDown() {
        this.adventure.tearDown();
    }
}