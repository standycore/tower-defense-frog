
/**
 * 2d vector class
 * for math and ease of use methods
 * function similarly to crisp-game-lib vectors
 *
 * the constructor can have numbers: new Vector2(x, y) || or objects and vectors: new Vector2({x: 0, y: 0})
 * ex: new Vector2(new Vector2(2, 2));
 * ex: const vec = new Vector2(6, 29);
 *     const vecCopy = new Vector2(vec);
 */
class Vector2 {

    constructor(x = 0, y = 0) {

        this.set(x, y);

    }

    // set the vector
    set(x = this.x, y = this.y) {

        if (x instanceof Object) {

            this.x = x.x;
            this.y = x.y;

        } else {

            this.x = x;
            this.y = y;

        }
        return this;

    }

    /**
     * returns copy of this vector
     * @returns {Vector2}
     */
    copy() {

        return new Vector2(this);

    }

    // basic math operations
    add(x, y) {

        if (x instanceof Object) {

            this.x += x.x;
            this.y += x.y;

        } else {

            this.x += x;
            this.y += y;

        }
        return this;

    }

    sub(x, y) {

        if (x instanceof Object) {

            this.x -= x.x;
            this.y -= x.y;

        } else {

            this.x -= x;
            this.y -= y;

        }
        return this;

    }

    mul(v) {

        this.x *= v;
        this.y *= v;
        return this;

    }

    div(v) {

        this.x /= v;
        this.y /= v;
        return this;

    }

    // get the length / magnitude of the vector
    magnitude() {

        return Math.sqrt(this.x * this.x + this.y * this.y);

    }

    get length() {

        return this.magnitude();

    }

    distanceToVector({ x, y }) {

        const xDif = this.x - x;
        const yDif = this.y - y;
        const dist = Math.sqrt(xDif * xDif + yDif * yDif);
        return dist;

    }

    /**
     *
     * @param {Vector2} v1
     * @param {Vector2} v2
     * @returns {float}
     */
    static distanceBetweenVectors(v1, v2) {

        return new Vector2(v1.x, v1.y).distanceTo(v2.x, v2.y);

    }

    static distanceBetween(x1, y1, x2, y2) {

        return new Vector2(x1, y1).distanceTo(x2, y2);

    }

    distanceTo(x, y) {

        if (x instanceof Object) {

            return this.distanceToVector(x);

        } else {

            return this.distanceToVector({ x, y });

        }

    }

    // normalize the vector to a length of 1
    normalize() {

        const mag = this.magnitude();
        this.div(mag, mag);
        return this;

    }

    // return dot product with vector x y
    dot(x, y) {

        if (x instanceof Object) {

            return this.x * x.x + this.y * x.y;

        } else {

            return this.x * x + this.y * y;

        }

    }

    // linear interpolate to the specified vector v
    lerpv(v, t) {

        return this.copy().add(new Vector2(v).sub(this).mul(t));

    }

    // linear interpolate to the specified vector(x, y)
    // internally calls lerpv
    // t is the amount to interpolate between 0 and 1
    lerp(x, y, t) {

        if (x instanceof Object) {

            return this.lerpv(new Vector2(x), y);

        } else {

            return this.lerpv(new Vector2(x, y), t);

        }

    }

    // lerp between 2 vectors
    static lerp(v1, v2, t) {

        return new Vector2(v1).lerp(v2.x, v2.y, t);

    }

    // get the percent of the closest point between start and end from point
    static closestPointPercent(start, end, point) {

        const startToEnd = end.copy().sub(start);
        const startToPoint = point.copy().sub(start);
        const dot = startToEnd.dot(startToPoint);
        const length = startToEnd.magnitude();
        return dot / (length * length);

    }

    // get closest point on a vector between start and end from point
    static closestPoint(start, end, point) {

        const startToEnd = end.copy().sub(start);
        const t = this.closestPointPercent(start, end, point);
        return start.copy().add(startToEnd.mul(t));

    }

}

// function for easyily creating new vectors
// function vec2(x, y) {

//     return new Vector2(x, y);

// }

/**
 * @param {Vector2} start
 * @param {Vector2} end
 */
class LinearCurve {

    constructor(start, end) {

        this.start = new Vector2(start);
        this.end = new Vector2(end);

    }

    at(t) {

        return this.start.lerpv(this.end, t);

    }

}

/**
 * @param {Vector2} start
 * @param {Vector2} control
 * @param {Vector2} end
 */
class BilinearCurve {

    constructor(start, control, end) {

        this.start = new Vector2(start);
        this.control = new Vector2(control);
        this.end = new Vector2(end);

    }

    at(t) {

        const a = this.start.lerpv(this.control, t);
        const b = this.control.lerpv(this.end, t);
        return a.lerpv(b, t);

    }

}

export { Vector2, LinearCurve, BilinearCurve };
