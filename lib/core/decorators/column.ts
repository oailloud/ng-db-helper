import { ShadowValue } from '../models/shadow-value.model';
import { DbTable } from '../models/structure/db-table.model';
import { DbColumn } from '../models/structure/db-column.model';
import { DbHelperModel } from '../models/db-helper-model.model';
import { ColumnConfig } from './configurator/column.configurator';
import { Clause } from './../models/queries/clause.model';

/**
 * Column annotation to add on class property that should use {@link Table} annotation.
 * class using this annotation must extends {@link DbHelperModel}.
 *
 * @example
 * ```typescript
 * @Table
 * export class Todo extends DbHelperModel {
 *
 *      @Column({primaryKey: true, autoIncremented: tru, type: 'integer'})
 *      public id: number
 *
 *      @Column
 *      public name: string;
 *
 *      @Column({type: 'long'})
 *      public dueDate: number;
 * }
 * ```
 *
 * @param config, {@link ColumnConfig} is column configuration, informations are used to
 *          build DataModel.
 *
 * @author  Olivier Margarit
 * @since   0.1
 */
export function Column<T extends DbHelperModel>(config?: ColumnConfig): any {
    return (target: T, key: string) => {
        const column = new DbColumn(key);

        if (config) {
            column.configure(config);
        }

        if (!target.constructor.prototype.$$dbTable) {
            target.constructor.prototype.$$dbTable = new DbTable();
        }

        target.constructor.prototype.$$dbTable.columnList.push(column);
        target.constructor.prototype.$$dbTable.columns[column.name] = column;
        target.constructor.prototype.$$dbTable.fields[column.field] = column;

        const descriptor = Object.getOwnPropertyDescriptor(target, key);
        if (descriptor && descriptor.value !== undefined) {
            column.defaultValue = descriptor.value;
        }

        Object.defineProperty(target.constructor.prototype, key, {
            get: function () {
                return this.$$shadow[column.name].val;
            },
            set: function (val: any) {
                const oldVal = this.$$shadow[column.name].val;
                this.$$shadow[column.name].val = val;
                if (this.$$shadow[column.name].val !== oldVal) {
                    this.$$isModified = true;
                    this.$$shadow[column.name].prevVal = oldVal;
                }
            },
            enumerable: true,
            configurable: false
        });
    };
}
