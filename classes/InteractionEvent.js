"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InteractionEvent = void 0;
var InteractionEventManager_1 = require("./InteractionEventManager");
var InteractionEvent = /** @class */ (function () {
    function InteractionEvent(_id, _message, _eventType, _options) {
        if (_options === void 0) { _options = {}; }
        this.ownerID = _id;
        this.interactionEventType = _eventType;
        this.interactedMessage = _message;
        if (_eventType === 'battle') {
            if (_options.battle) {
                this.battle = _options.battle;
            }
            else {
                InteractionEventManager_1.InteractionEventManager.getInstance().stopInteraction(_id, 'battle');
            }
        }
        this.stoppable = (function () {
            switch (_eventType) {
                case 'battle':
                    return false;
                default:
                    return true;
            }
        })();
    }
    InteractionEvent.prototype.stop = function () {
        var _this = this;
        switch (this.interactionEventType) {
            case 'battle':
                if (this.battle) {
                    var stat = this.battle.allStats().find(function (_s) { return _s.owner === _this.ownerID; });
                    if (stat) {
                        this.battle.removeEntity(stat);
                    }
                }
                break;
            default:
                this.interactedMessage.delete()
                    .catch(function (_err) { return null; });
                break;
        }
    };
    return InteractionEvent;
}());
exports.InteractionEvent = InteractionEvent;
