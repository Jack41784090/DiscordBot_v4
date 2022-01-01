import { Stat, StatusEffectEffect, StatusEffectType } from "../typedef";
import { clamp } from "./Utility";

const statusEffect_effects = new Map<StatusEffectType, StatusEffectEffect>([
    [
        "bleed",
        (_statusEffect: StatusEffect) => {
            _statusEffect.affected.HP -= _statusEffect.value * 100;
            _statusEffect.duration--;
        }
    ],
]);

export class StatusEffect {
    type: StatusEffectType;
    duration: number;
    value: number;
    from: Stat;
    affected: Stat;

    constructor(_type: StatusEffectType, _duration: number, _value: number, _from: Stat, _affected: Stat) {
        this.type = _type;
        this.duration = _duration;
        this.value = clamp(_value, 0, 1);
        this.from = _from;
        this.affected = _affected;
    }

    tick() {
        const statusEffect = statusEffect_effects.get(this.type);
        if (statusEffect) {
            statusEffect(this);
        }
    }
}