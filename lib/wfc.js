import { EventEmitter } from './events';
import { Grid } from './grid';

class WaveFunctionCollapser {

    constructor() {

        this.grid = new Grid();
        this.rules = {};
        this.events = new EventEmitter();

    }

    createRule(ruleName, ruleCallback) {

        this.rules[ruleName] = ruleCallback;

    }

    createOptionData(x, y, value, rules = []) {

        return {
            x,
            y,
            value,
            rules
        };

    }

    createCellData() {

        return {
            options: [],
            collapsed: false,
            decision: undefined
        };

    }

    setCell(x, y) {

        this.grid.set(x, y, this.createCellData());

    }

    // rule can be a rule name or callback
    addOptionToCell(x, y, value, _rules = []) {

        const cellData = this.grid.get(x, y);

        if (!cellData) {

            return;

        }

        const rules = [];
        _rules.forEach((rule) => {

            if (typeof rule === 'string') {

                if (this.rules[rule]) {

                    rules.push(this.rules[rule]);

                }

            }
            if (typeof rule === 'function') {

                rules.push(rule);

            }

        });

        cellData.options.push(this.createOptionData(x, y, value, rules));

    }

    async collapse() {

        console.log('collapsing');
        while (true) {

            const cells = Array.from(this.grid.values()).filter(({ collapsed }) => collapsed === false).sort((a, b) => {

                return a.options.length - b.options.length;

            });
            console.log('to collapse:', cells.length);

            if (cells.length === 0) {

                break;

            }

            // propogate
            cells.forEach((cell) => {

                const { options } = cell;
                cell.options = options.filter(({ x, y, value, rules }) => {

                    for (const rule of rules) {

                        if (!rule(value, x, y)) {

                            return false;

                        }

                    }
                    return true;

                });

                if (cell.options.length <= 1) {

                    this.collapseCell(cell);

                }

            });

            // collapse cell
            this.collapseCell(cells[0]);

            await new Promise(resolve => setTimeout(resolve, 1));

        }

        console.log('finished collapse');

    }

    collapseCell(x, y) {

        const cell = typeof x === 'object' ? x : this.grid.get(x, y);
        if (!cell || cell.collapsed) {

            return undefined;

        }

        // collapse cell
        if (cell.options.length > 0) {

            cell.decision = cell.options[Math.floor(Math.random() * cell.options.length)];

        }

        this.events.trigger('cellcollapse', cell.decision);

        cell.collapsed = true;

        return cell;

    }

    onCellCollapse(eventCallback) {

        this.events.on('cellcollapse', eventCallback);
        return this;

    }

}

export { WaveFunctionCollapser };
