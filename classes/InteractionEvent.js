"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InteractionEvent = void 0;
var InteractionEvent = /** @class */ (function () {
    function InteractionEvent(_user, _message, _eventType) {
        this.active = true;
        this.user = _user;
        this.interactionEventType = _eventType;
        this.interactedMessage = _message;
    }
    InteractionEvent.prototype.stop = function () {
        this.active = false;
        this.interactedMessage.delete()
            .catch(function (_err) { return null; });
    };
    return InteractionEvent;
}());
exports.InteractionEvent = InteractionEvent;
