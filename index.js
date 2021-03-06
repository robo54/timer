/*
    Copyright (c) 2012 Jérémie Patonnier
    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:
    
    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.
    
    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE.
*/

// ------------------ //
// UTILITIES          //
// ------------------ //

// Extend JS objects to make them testable in an easy way
Function.prototype.isFunction = true;

Number.prototype.isNumber = true;

if (!Number.isNaN) {
    Number.isNaN = function (n) {
        return typeof n === "number" && window.isNaN(n);
    };
}

// Internal casting function

function toInt(value, alt) {
    return Number.isNaN(+value) ? alt : +value;
}

function toPosInt(value, alt) {
    return +value >= 0 ? +value : alt;
}

function toNullTime(isNull) {
    if (isNull === null)  { return null; }
    if (isNull && isNull.isNumber && isNull > 0) { return isNull; }
    return +new Date();
}

// Easing manager

function Easing(name) {
    if (Array.isArray(name) && name.length === 4) {
        name = this.bezier.toFunc(name[0],name[1],name[2],name[3]);
    }

    this.easeFx = (name && name.isFunction && name) || this.func[name] || this.func.linear;
}

Easing.prototype = {
    getValue : function (begin, end, now) {
        if (begin === end) {
            throw new Error('A zero time animation as no meaning!');
        }

        return this.easeFx(this.getTime(begin, end, now));
    },

    getTime  : function (begin, end, now) {
        if (begin === end) {
            throw new Error('A zero time animation as no meaning!');
        }

        return (now - begin) / (end - begin);
    },

    // Utils to bezier conversion
    // assuming cubic bezier with control points (0, 0), (x1, y1), (x2, y2), and (1, 1).
    bezier : {
        n_for_t : function (t, n1, n2) {
            var nt = 1-t;
            return 3 * Math.pow(nt, 2) * t * n1 + 3 * nt * Math.pow(t, 2) * n2 + Math.pow(t, 3);
        },

        t_for_n : function (n, n1, n2) {
            var gn, gt, i = 0,
                mint = 0,
                maxt = 1;

            while (i < 30) {
                gt = (mint + maxt) / 2;
                gn = this.n_for_t(gt, n1, n2);

                if (n < gn) { maxt = gt; }
                else        { mint = gt; }

                i++;
            }

            return (mint + maxt) / 2;
        },

        toFunc : function (x1, y1, x2, y2) {
            var b = this;
            if (x1 > 1) { x1 = 1; }
            if (x1 < 0) { x1 = 0; }
            if (x2 > 1) { x2 = 1; }
            if (x2 < 0) { x2 = 0; }

            return function (t) {
                if (t === 0) { return 0; }
                if (t === 1) { return 1; }
                return b.n_for_t(b.t_for_n(t, x1, x2), y1, y2);
            };
        }
    },

    func : {
        // t : current time: 0 < t < 1 on the time axis
        linear: function linear(t) {
            return t;
        },

        easeInQuad: function easeInQuad(t) {
            return Math.pow(t, 2);
        },

        easeOutQuad: function easeOutQuad(t) {
            return -1*t*(t-2);
        },

        easeInOutQuad: function easeInOutQuad(t) {
            t = t * 2;
            if (t < 1) { return Math.pow(t, 2) / 2; }
            t = t - 1;
            return (t*(t-2) - 1) / -2;
        },

        easeInCubic: function easeInCubic(t) {
            return Math.pow(t, 3);
        },

        easeOutCubic: function easeOutCubic(t) {
            t = t - 1;
            return Math.pow(t, 3) + 1;
        },

        easeInOutCubic: function easeInOutCubic(t) {
            t = t * 2;
            if (t < 1) { return Math.pow(t, 3) / 2; }
            t = t - 2;
            return (Math.pow(t, 3) + 2) / 2;
        },

        easeInQuart: function easeInQuart(t) {
            return Math.pow(t, 4);
        },

        easeOutQuart: function easeOutQuart(t) {
            t = t - 1;
            return -1 * Math.pow(t, 4) + 1;
        },

        easeInOutQuart: function easeInOutQuart(t) {
            t = t * 2;
            if (t < 1) { return Math.pow(t, 4) / 2; }
            t = t - 2;
            return (Math.pow(t, 4) - 2) / -2;
        },

        easeInQuint: function easeInQuint(t) {
            return Math.pow(t, 5);
        },

        easeOutQuint: function easeOutQuint(t) {
            t = t - 1;
            return Math.pow(t, 5) + 1;
        },

        easeInOutQuint: function easeInOutQuint(t) {
            t = t * 2;
            if (t < 1) { return Math.pow(t, 5) / 2; }
            t = t - 2;
            return (Math.pow(t, 5) + 2) / 2;
        },

        easeInSine: function easeInSine(t) {
            return -1 * Math.cos(t * (Math.PI/2)) + 1;
        },

        easeOutSine: function easeOutSine(t) {
            return Math.sin(t*Math.PI/2);
        },

        easeInOutSine: function easeInOutSine(t) {
            return (Math.cos(t*Math.PI) - 1) / -2;
        },

        easeInExpo: function easeInExpo(t) {
            return (t===0) ? 0 : Math.pow(2, 10 * (t - 1));
        },

        easeOutExpo: function easeOutExpo(t) {
            return (t===1) ? 1 : 1 - Math.pow(2, -10 * t);
        },

        easeInOutExpo: function easeInOutExpo(t) {
            if (t===0) { return 0; }
            if (t===1) { return 1; }
            t = t * 2;
            if (t < 1) { return Math.pow(2, 10 * (t - 1)) / 2; }
            t = t - 1;
            return (2 - Math.pow(2, -10 * t)) / 2;
        },

        easeInCirc: function easeInCirc(t) {
            return -1 * (Math.sqrt(1 - Math.pow(t, 2)) - 1);
        },

        easeOutCirc: function easeOutCirc(t) {
            t = t - 1;
            return Math.sqrt(1 - Math.pow(t, 2));
        },

        easeInOutCirc: function easeInOutCirc(t) {
            t = t * 2;
            if (t < 1) { return (Math.sqrt(1 - Math.pow(t, 2)) - 1) / -2; }
            t = t - 2;
            return (Math.sqrt(1 - Math.pow(t, 2)) + 1) / 2;
        },

        easeInElastic: function easeInElastic(t) {
            var p=0.3, s=p/(2*Math.PI) * Math.asin(1);
            if (t===0) { return 0; }
            if (t===1) { return 1; }
            t = t - 1;
            return -(Math.pow(2,10*t) * Math.sin((t-s)*(2*Math.PI)/p));
        },

        easeOutElastic: function easeOutElastic(t) {
            var p=0.3, s=p/(2*Math.PI) * Math.asin(1);
            if (t===0) { return 0; }
            if (t===1) { return 1; }
            return Math.pow(2,-10*t) * Math.sin((t-s)*(2*Math.PI)/p) + 1;
        },

        easeInOutElastic: function easeInOutElastic(t) {
            var p=1.5*0.3, s=p/(2*Math.PI) * Math.asin(1);
            if (t===0) {return 0;}
            t = t * 2;
            if (t===2) {return 1;}
            t = t - 1;
            if (t < 0) {return -0.5*(Math.pow(2,10*t) * Math.sin((t-s)*(2*Math.PI)/p));}
            return Math.pow(2,-10*t) * Math.sin((t-s)*(2*Math.PI)/p)*0.5 + 1;
        },

        easeInBack: function easeInBack(t) {
            var s=1.70158;
            return Math.pow(t, 2)*((s+1)*t - s);
        },

        easeOutBack: function easeOutBack(t) {
            var s=1.70158;
            t = t - 1;
            return Math.pow(t, 2)*((s+1)*t + s) + 1;
        },

        easeInOutBack: function easeInOutBack(t) {
            var s=1.70158*1.525;
            t = t * 2;
            if (t < 1) { return (Math.pow(t, 2)*(s*t + t - s)) / 2; }
            t = t - 2;
            return (Math.pow(t, 2)*(s*t + t + s) + 2) / 2;
        },

        easeInBounce: function easeInBounce(t) {
            return 1 - Easing.prototype.func.easeOutBounce (1-t);
        },

        easeOutBounce: function easeOutBounce(t) {
            var a=2.625, b=0.984375, c=2.75;
            if (t < (1/c)) { a=0; b=0; }
            else if (t < (2/c)) { a=1.5; b=0.75; }
            else if (t < (2.5/c)) { a=2.25; b=0.9375; }
            t = t - a/c;
            return 7.5625*Math.pow(t, 2) + b;
        },

        easeInOutBounce: function easeInOutBounce(t) {
            if (t < 0.5) { return Easing.prototype.func.easeInBounce (t*2) * 0.5; }
            return Easing.prototype.func.easeOutBounce (t*2-1) * 0.5 + 0.5;
        }
    }
};

// Timer internal state manager

function TimerState() {
    this.data = {
        userTime  : null,
        startTime : null,
        easing    : new Easing(),
        steps     : {
            length   : 0,
            position : "end"
        }
    };
}

TimerState.prototype = {
    // --------- //
    // User data //
    // --------- //

    // Accessor to the delay set by the user
    get delay() {
        return this.data.delay;
    },

    set delay(value) {
        var newVal = toInt(value, 0),
            oldVal = this.delay;

        if (this.begin) {
            this.begin = this.begin - oldVal + newVal;
        }

        this.data.delay = newVal;
    },

    // Accessor to the start time set by the user
    get userTime() {
        return this.data.userTime;
    },

    set userTime(isNull) {
        this.data.userTime = toNullTime(isNull);
        this.startTime = this.data.userTime;
    },

    // Accessor to the duration set by the user
    get duration() {
        return this.data.duration;
    },

    set duration(value) {
        // NEED TO INVESTIGATE IF IT'S THE RIGHT BEHAVIOR

        // var now    = +new Date(),
        //     shift  = this.easing.getTime(this.begin, this.end, now),
        //     newVal = toPosInt(value, 0),
        //     oldVal = this.duration;

        // if (this.begin && this.end - oldVal + newVal > now) {
        //     this.begin -= Math.round(shift * (newVal - oldVal));
        // }

        // this.data.duration = newVal;

        this.data.duration = toPosInt(value, 0);
    },

    get constrain() {
        return this.data.constrain;
    },

    set constrain(value) {
        this.data.constrain = !!value;
    },

    get loopLength() {
        return this.data.loopLength;
    },

    set loopLength(value) {
        this.data.loopLength = toPosInt(value, 1);
    },

    get steps() {
        return this.data.steps;
    },

    set steps(value) {
        if (value && (value.length || value.isNumber)) {
            this.data.steps.length = toPosInt(value.length || value, 0);
        }

        if (value && value.position) {
            this.data.steps.position = value.position === "start" ||
                                       value.position === "end" ?
                                       value.position : "end";
        }
    },

    // ------------------ //
    // Easing computation //
    // ------------------ //

    get easing() {
        return this.data.easing;
    },

    set easing(value) {
        this.data.easing = new Easing(value);
    },

    // --------------- //
    // Animation speed //
    // --------------- //

    // Current speed
    get speed() {
        return this.data.speed;
    },

    set speed(value) {
        var shift,
            now    = +new Date(),
            newVal = toInt(value, 1),
            factor = newVal * (newVal < 0 ? -1 : 1);

        this.pauseTime = null;
        this.backTime  = null;

        if (newVal === 0) { this.pauseTime = now; }
        if (newVal   < 0) { this.backTime  = now; }

        this.prevSpeed  = this.speed;
        this.data.speed = newVal;

        shift = now - this.begin;
        this.begin = now - shift / (factor === 0 ? 1 : factor);
    },

    // Previous speed
    get prevSpeed() {
        return this.data.prevSpeed;
    },

    set prevSpeed(value) {
        this.data.prevSpeed = toInt(value, 1);
    },

    // ---------------------- //
    // Internal time position //
    // ---------------------- //

    // Keep the first time the Timer is played
    get startTime() {
        return this.data.startTime;
    },

    set startTime(isNull) {
        this.data.startTime = toNullTime(isNull);

        // When the value is set (meaning, the Timer start)
        // The pause and back times MUST be reinitialized
        if(this.startTime !== null && this.pauseTime !== null) {
            this.pauseTime = this.startTime;
        }

        if(this.startTime !== null && this.backTime !== null) {
            this.backTime = this.startTime;
        }

        this.begin = this.startTime + this.delay;
    },

    // Keep the last time the Timer is paused
    get pauseTime() {
        return this.data.pauseTime;
    },

    set pauseTime(isNull) {
        var now    = +new Date(),
            newVal = toNullTime(isNull),
            oldVal = this.pauseTime;

        if(oldVal !== null && newVal === null) {
            this.begin += now - oldVal;
        }

        this.data.pauseTime = newVal;
    },

    // Keep the last time the Timer is going backward
    get backTime() {
        return this.data.backTime;
    },

    set backTime(isNull) {
        var now    = +new Date(),
            newVal = toNullTime(isNull),
            oldVal = this.backTime;

        if(oldVal !== null && newVal === null) {
            this.begin += (now - oldVal)*2;
        }

        this.data.backTime = newVal;
    },

    // ------------------------------ //
    // Absolute position of the timer //
    // ------------------------------ //

    // Begin time
    get begin() {
        return this.data.begin;
    },

    set begin(value) {
        this.data.begin = toPosInt(value, 0);
    },

    // End time (readonly)
    get end() {
        var speed = this.data.speed;
        speed *= speed < 0 ? -1 : 1;

        return this.begin + this.duration / (speed === 0 ? 1 : speed);
    }
};

// ------------------ //
// CORE               //
// ------------------ //

function Timer(config) {
    // Sefely keep the internal properties of the object
    var closed = new TimerState();

    // Accessor to closed statement
    // You use those methods at your own risk

    Object.defineProperty(this, "set", {
        value : function(property, value) {
            closed[property] = value;
            return closed[property];
        },
        writable     : false,
        enumerable   : false,
        configurable : false
    });

    Object.defineProperty(this, "get", {
        value : function(property) {
            return closed[property];
        },
        writable     : false,
        enumerable   : false,
        configurable : false
    });

    // Truly initialize the object
    this.set("duration",   (config && config.isNumber && config) || (config && config.duration));
    this.set("delay",       config && config.delay  );
    this.set("easing",      config && config.easing );
    this.set("speed",       config && config.speed  );
    this.set("loopLength",  config && config.loops  );
    this.set("steps",       config && config.steps  );
    this.set("constrain",  !config || config.constrain === undefined || config.constrain);
}

// ------------------------- //
// PROPERIES
// ------------------------- //
// Timer.startTime
Object.defineProperty(Timer.prototype, "startTime", {
    set : function () {
        throw new Error("Timer.startTime is a readonly property");
    },
    get : function () {
        return this.get("userTime");
    },
    enumerable   : true,
    configurable : false
});

// Timer.delay
Object.defineProperty(Timer.prototype, "delay", {
    set : function (value) {
        this.set("delay", value);
    },
    get : function () {
        return this.get("delay");
    },
    enumerable   : true,
    configurable : false
});

// Timer.speed
Object.defineProperty(Timer.prototype, "speed", {
    set : function (speed) {
        this.set('speed', speed);
    },
    get : function () {
        return this.get("speed");
    },
    enumerable   : true,
    configurable : false
});

// Timer.duration
Object.defineProperty(Timer.prototype, "duration", {
    set : function (value) {
        this.set("duration", value);
    },
    get : function () {
        return this.get("duration");
    },
    enumerable   : true,
    configurable : false
});

// Timer.easing
Object.defineProperty(Timer.prototype, "easing", {
    set : function (value) {
        this.set("easing", value);
    },
    get : function () {
        return this.get("easing").easeFx;
    },
    enumerable   : true,
    configurable : false
});

// Timer.constrain
Object.defineProperty(Timer.prototype, "constrain", {
    set : function (value) {
        this.set("constrain", value);
    },
    get : function () {
        return this.get("constrain");
    },
    enumerable   : true,
    configurable : false
});

// Timer.loops
Object.defineProperty(Timer.prototype, "loops", {
    set : function (value) {
        this.set("loopLength", value);
    },
    get : function () {
        return this.get("loopLength");
    },
    enumerable   : true,
    configurable : false
});

// Timer.steps.length
// Timer.steps.position
Object.defineProperty(Timer.prototype, "steps", {
    set : function (value) {
        this.set("steps", value);
    },
    get : function () {
        var timer = this;

        return {
            set length(value) {
                timer.set("steps", {length:value});
            },

            get length() {
                return timer.get("steps").length;
            },

            set position(value) {
                timer.set("steps", {position:value});
            },

            get position() {
                return timer.get("steps").position;
            }
        };
    },
    enumerable   : true,
    configurable : false,
});

// Timer.is.playing
// Timer.is.paused
Object.defineProperty(Timer.prototype, "is", {
    set : function () {
        throw new Error("Timer.is is a readonly property");
    },
    get : function () {
        var startTime = this.get("startTime"),
            speed     = this.get("speed"),
            output    = {
                playing: startTime !== null,
                paused : startTime !== null && speed === 0
            };

        if (this.constrain) {
            if (speed > 0 && this.position.time >= 1) { this.stop(); }
            if (speed < 0 && this.position.time <= 0) { this.stop(); }
        }

        return output;
    },
    enumerable   : true,
    configurable : false
});

// Timer.position.time
// Timer.position.value
// Timer.position.loop
Object.defineProperty(Timer.prototype, "position", {
    set : function () {
        throw new Error("Timer.position is a readonly property");
    },
    get : function () {
        var begin, end, now, ease, speed, dur, pos, step,
            startTime = this.get("startTime"),
            output    = {
                value : 0,
                time  : 0,
                loop  : 1
            };

        if (startTime === null) { return output; }

        speed = this.get("speed");
        dur   = this.get("duration");
        now   = +new Date();

        if (speed === 0) {
            now = this.get("pauseTime");
        }
        else if (speed < 0) {
            now = this.get("backTime") * 2 - now;
        }

        begin = this.get("begin");
        end   = this.get("end");

        pos   = Math.ceil((now - begin) / dur);

        if (pos < 1) { pos = 1; }
        if (this.loops > 0 && pos > this.loops) { pos = this.loops; }

        begin += (pos-1)*dur;
        end   += (pos-1)*dur;
        output.loop = pos;

        if (this.constrain) {
            if (now <= begin) { return output; }
            if (now > end) { this.stop(); return output; }
        }

        ease = this.get("easing");

        output.time  = ease.getTime( begin, end, now);

        if (this.steps.length > 0) {
            step = this.steps.position === "end" ? "floor" : "ceil";
            step = Math[step](output.time * this.steps.length);
            output.value = ease.easeFx(step/this.steps.length);
        } else {
            output.value = ease.getValue(begin, end, now);
        }

        return output;
    },
    enumerable   : true,
    configurable : false
});

// ------------------------- //
// METHOD
// ------------------------- //
Timer.prototype.play = function play() {
    if(this.get("userTime") === null) {
        this.set("userTime");

    } else if (this.get("speed") === 0) {
        this.set("speed", this.get("prevSpeed"));
    }
};

Timer.prototype.pause = function pause() {
    this.speed = 0;
};

Timer.prototype.stop = function stop() {
    this.set("userTime", null);
};

Timer.prototype.freeze = function freeze() {
    if (arguments.length < 2 && this.startTime === null) {
        throw new Error('The timer must be started with the play() function first');
    }

    var begin = (arguments.length > 1 ? arguments[0] : this.startTime) + this.delay,
        now   = arguments[1] || arguments[0] || +new Date(),
        end   = begin + this.duration,
        step  = this.steps.position === "end" ? "floor" : "ceil",
        time  = this.get("easing").getTime(begin, end, now),
        value = this.get("easing").getValue(begin, end, now);

    if (this.steps.length > 0) {
        step  = Math[step](time * this.steps.length);
        value = this.get("easing").easeFx(step/this.steps.length);
    }

    if (this.constrain) {
        if (time < 0) { return {time: 0, value: 0}; }
        if (time > 1) { return {time: 1, value: 1}; }
    }

    return {time: time, value: value};
};

// window.Timer = Timer;
export default Timer;
