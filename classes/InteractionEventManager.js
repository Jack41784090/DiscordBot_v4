"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InteractionEventManager = void 0;
var InteractionEventManager = /** @class */ (function () {
    function InteractionEventManager() {
        this.user_interaction_map = new Map();
    }
    InteractionEventManager.getInstance = function () {
        if (InteractionEventManager.instance === undefined) {
            InteractionEventManager.instance = new InteractionEventManager();
        }
        return this.instance;
    };
    InteractionEventManager.prototype.registerInteraction = function (_user, _interactionEvent) {
        var split = this.user_interaction_map.get(_user.id) ||
            this.user_interaction_map.set(_user.id, {
                'inventory': null
            }).get(_user.id);
        var existing = split[_interactionEvent.interactionEventType];
        if (existing) {
            existing.stop();
        }
        split[_interactionEvent.interactionEventType] = _interactionEvent;
    };
    return InteractionEventManager;
}());
exports.InteractionEventManager = InteractionEventManager;
