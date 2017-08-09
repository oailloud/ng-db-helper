import { DataModel } from '../models/data-model.model';
import {BadColumnDeclarationError} from '../errors/bad-column-declaration.error';
import {BadTableDeclarationError} from '../errors/bad-table-declaration.error';

export class ModelManager {
    public static version = '';
    private static instance;
    private tables = {};
    private models = {};
    private db;

    public static getInstance() {
        if (!ModelManager.instance) {
            ModelManager.instance = new ModelManager();
        }
        return ModelManager.instance;
    }

    public addModel(newModel) {
        this.tables[newModel.prototype.TABLE_NAME] = {
            name: newModel.prototype.TABLE_NAME,
            columns: newModel.prototype.columns,
            columnList: newModel.prototype.columnList,
            fields: newModel.prototype.fields,
            model: newModel
        };
        this.models[newModel.name] = newModel.prototype.TABLE_NAME;
    }

    public getColumnNameForField(model: any, fieldName: string): string {
        if (!this.models.hasOwnProperty(model.name)) {
            const error = new BadColumnDeclarationError('Did you forget to declare model: ' +
                model.name + '\n Check @Table déclaration on this model');
            throw(error);
        }
        const tableName = this.models[model.name];
        const table = this.tables[tableName];

        if (!table.fields.hasOwnProperty(fieldName)) {
            const error = new BadTableDeclarationError('Did you forget to declare column for field "' +
            fieldName + '" of model "' + model.name + ' - tableName : ' +  tableName + ' table : ' + table + '' +
            '"\n Check @Column déclaration on this model');
            throw(error);
        }
        return table.fields[fieldName].name;
    }

    public getDataModel(): DataModel {
        return new DataModel(this.tables);
    }

    public getModel(tableName): any {
        return this.tables[tableName];
    }

    public getTable(model): any {
        return this.models[model.name];
    }
}
