"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InteractionEvent = void 0;
var InteractionEvent = /** @class */ (function () {
    function InteractionEvent(_id, _message, _eventType, _options) {
        var _this = this;
        if (_options === void 0) { _options = {}; }
        this.stoppable = false;
        this.collectors = [];
        this.finishingPromiseResolve = function () { };
        this.finishingPromiseTimer = setTimeout(function () { }, 1);
        this.ownerID = _id;
        this.type = _eventType;
        this.interactedMessage = _message;
        this.finishingPromise = new Promise(function (resolve) {
            _this.finishingPromiseResolve = resolve;
            // inactivity stop
            _this.finishingPromiseTimer = setTimeout(function () {
                _this.collectors.forEach(function (_c) { return _c.stop(); });
                resolve();
                _this.stop();
            }, 100 * 1000);
            // stop function stop: calling this.finishingPromise(true)
        });
        // special cases events
        switch (_eventType) {
            case 'battle':
            case 'dungeon':
                if (_options[_eventType] !== undefined) {
                    this.stoppable = false;
                    this[_eventType] = _options[_eventType];
                }
                else {
                    this.finishingPromiseResolve();
                }
                break;
            default:
                this.stoppable = true;
                break;
        }
    }
    InteractionEvent.prototype.stop = function () {
        var _this = this;
        switch (this.type) {
            case 'battle':
                if (this.battle) {
                    var stat = this.battle.allStats().find(function (_s) { return _s.owner === _this.ownerID; });
                    if (stat) {
                        this.battle.removeEntity(stat);
                    }
                }
                clearTimeout(this.finishingPromiseTimer);
                this.finishingPromiseResolve();
                break;
            case 'dungeon':
                if (this.dungeon) {
                }
                break;
            default:
                this.interactedMessage.delete()
                    .catch(function (_err) { return null; });
                clearTimeout(this.finishingPromiseTimer);
                this.finishingPromiseResolve();
                break;
        }
    };
    InteractionEvent.prototype.promise = function () {
        return this.finishingPromise;
    };
    InteractionEvent.prototype.activity = function () {
        var _this = this;
        clearTimeout(this.finishingPromiseTimer);
        this.finishingPromiseTimer = setTimeout(function () {
            _this.collectors.forEach(function (_c) { return _c.stop(); });
            _this.finishingPromiseResolve;
            _this.stop();
        }, 5 * 1000);
    };
    return InteractionEvent;
}());
exports.InteractionEvent = InteractionEvent;
