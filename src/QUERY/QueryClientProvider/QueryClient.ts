import {Observer} from "../Observer";

export class QueryClient {
    public observer: Observer | null  = null;

    mount() {
        this.observer = new Observer();
        return this;
    }

    unMount(): void {}

    getObserver(): Observer {
        return <Observer>this.observer;
    }
}