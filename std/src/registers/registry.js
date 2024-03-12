export class Registry {
    _A = undefined;
    _B = undefined;
    registered = new Map();
    getItems(input, reverse = false) {
        const items = Array.from(this.registered.entries()).map(([i, p])=>p(input) && i).filter(Boolean);
        reverse && items.reverse();
        return items;
    }
    register(item, predicate) {
        this.registered.set(item, predicate);
        return item;
    }
    unregister(item) {
        this.registered.delete(item);
        return item;
    }
}
